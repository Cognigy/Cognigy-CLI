import * as fs from 'fs-extra';
import CognigyClient from '../utils/cognigyClient';
import CONFIG from '../utils/config';
import { checkCreateDir, removeCreateDir } from '../utils/checks';
import { indexAll } from '../utils/indexAll';
import { addToProgressBar } from '../utils/progressBar';
import * as jsonDiff from 'json-diff';
import { Spinner } from 'cli-spinner';
import chalk from 'chalk';

interface AiAgent {
  _id: string;
  name: string;
  // ... other properties
}

interface AiAgentConfig {
  aiAgentId?: string;
  _id?: string;
  name: string;
  // ... other properties
}

/**
 * Clones all AI Agents from Cognigy.AI to disk
 */
export const cloneAiAgents = async (
  progressIncrement: number = 100
): Promise<void> => {
  // Ensure aiAgents directory exists
  const aiAgentsDir = getAiAgentsDir();
  await checkCreateDir(aiAgentsDir);

  // Get all aiAgents
  const { items: aiAgents } = await indexAll(CognigyClient.indexAiAgents)({
    projectId: CONFIG.agent,
  });

  // Add progress tracking like in endpoints.ts
  const incrementPerAgent = progressIncrement / aiAgents.length;

  for (const agent of aiAgents) {
    const agentDir = getAgentDir(agent.name);

    await removeCreateDir(agentDir);
    await checkCreateDir(agentDir);

    const fullAiAgent = await CognigyClient.readAiAgent({
      aiAgentId: agent._id,
    });
    await fs.writeJSON(`${agentDir}/config.json`, fullAiAgent, { spaces: 2 });
    addToProgressBar(incrementPerAgent);
  }
};

/**
 * Pulls a single AI Agent or all AI Agents from Cognigy.AI
 * @param resourceName optional name of the AI Agent to pull
 */
export const pullAiAgent = async (resourceName?: string): Promise<void> => {
  // Ensure aiAgents directory exists
  const aiAgentsDir = getAiAgentsDir();
  await checkCreateDir(aiAgentsDir);

  if (resourceName) {
    // Pull specific aiAgent
    const aiAgent = await getAiAgentByName(resourceName);
    const fullAiAgent = await CognigyClient.readAiAgent({
      aiAgentId: aiAgent._id,
    });

    // Create directory for this agent
    const agentDir = getAgentDir(resourceName);
    await checkCreateDir(agentDir);

    // Save to disk as config.json
    await fs.writeJSON(`${agentDir}/config.json`, fullAiAgent, { spaces: 2 });
  } else {
    // Pull all aiAgents
    const { items: aiAgents } = await indexAll(CognigyClient.indexAiAgents)({
      projectId: CONFIG.agent,
    });

    await Promise.all(
      aiAgents.map(async (agent) => {
        const agentDir = getAgentDir(agent.name);
        await checkCreateDir(agentDir);

        const fullAiAgent = await CognigyClient.readAiAgent({
          aiAgentId: agent._id,
        });
        await fs.writeJSON(`${agentDir}/config.json`, fullAiAgent, {
          spaces: 2,
        });
      })
    );
  }
};

/**
 * Pushes an AI Agent to Cognigy.AI
 * @param resourceName name of the AI Agent to push
 * @param availableProgress How much of the progress bar can be filled by this process
 */
export const pushAiAgent = async (
  resourceName: string,
  availableProgress: number = 100
): Promise<void> => {
  const agentDir = getAgentDir(resourceName);

  // Read aiAgent config from disk
  const aiAgentConfig = await fs.readJSON(`${agentDir}/config.json`);

  // Find existing aiAgent
  const existingAgent = await getAiAgentByName(resourceName);

  if (!existingAgent) {
    throw new Error(`AI Agent '${resourceName}' not found`);
  }

  try {
    const cleanedConfig = cleanAiAgentConfig(aiAgentConfig);
    await CognigyClient.updateAiAgent({ ...cleanedConfig });
  } catch (error) {
    console.error(error);
    throw new Error(
      `Failed to update AI Agent '${resourceName}' in Cognigy.AI`
    );
  }

  addToProgressBar(availableProgress);
};

/**
 * Restores AI Agents back to Cognigy.AI
 * @param availableProgress How much of the progress bar can be filled by this process
 */
export const restoreAiAgents = async (
  availableProgress: number
): Promise<void> => {
  const aiAgentsDir = `${CONFIG.agentDir}/aiAgents`;

  // read aiAgent directories
  const aiAgentDirectories = fs.readdirSync(aiAgentsDir);
  if (!aiAgentDirectories || aiAgentDirectories.length === 0) {
    console.log('No AI Agents found, aborting...\n');
    return;
  }

  const incrementPerAgent = availableProgress / aiAgentDirectories.length;

  // iterate through AI Agents and push all to Cognigy.AI
  for (let aiAgent of aiAgentDirectories) {
    await pushAiAgent(aiAgent, incrementPerAgent);
  }
  return Promise.resolve();
};

// Add helper function for common operations
const getAiAgentByName = async (resourceName: string) => {
  const { items: aiAgents } = await indexAll(CognigyClient.indexAiAgents)({
    projectId: CONFIG.agent,
  });
  const aiAgent = aiAgents.find((agent) => agent.name === resourceName);
  if (!aiAgent) {
    throw new Error(`AI Agent '${resourceName}' not found`);
  }
  return aiAgent;
};

// Add helper for cleaning agent config
const cleanAiAgentConfig = (config: any) => {
  const cleanConfig = { ...config };
  cleanConfig.aiAgentId = cleanConfig._id;
  delete cleanConfig._id;
  delete cleanConfig.referenceId;
  delete cleanConfig.createdBy;
  delete cleanConfig.createdAt;
  delete cleanConfig.organisationId;
  delete cleanConfig.projectReference;
  delete cleanConfig.organisationReference;
  delete cleanConfig.lastChanged;
  delete cleanConfig.lastChangedBy;
  return cleanConfig;
};

const AI_AGENTS_DIR = 'aiAgents';

const getAiAgentsDir = () => `${CONFIG.agentDir}/${AI_AGENTS_DIR}`;
const getAgentDir = (agentName: string) => `${getAiAgentsDir()}/${agentName}`;

/**
 * Compares two AI Agent JSON representations
 * @param aiAgentName Name of the AI Agent to compare
 * @param mode always full
 */
export const diffAiAgents = async (
  aiAgentName: string,
  mode: string = 'full'
): Promise<void> => {
  try {
    // check if a valid mode was selected
    if (['full'].indexOf(mode) === -1) {
      console.log(
        `Selected mode not supported for AI Agents. Supported modes:\n\n- full\n`
      );
      process.exit(0);
    }

    const spinner = new Spinner(
      `Comparing ${chalk.green('local')} and ${chalk.red('remote')} AI Agent resource ${aiAgentName}... %s`
    );
    spinner.setSpinnerString('|/-\\');
    spinner.start();

    const aiAgentDir = getAiAgentsDir();

    // check whether AI Agent directory and config.json exist
    const agentDir = getAgentDir(aiAgentName);
    if (!fs.existsSync(agentDir) || !fs.existsSync(`${agentDir}/config.json`)) {
      spinner.stop();
      console.log(
        `\nThe requested AI Agent resource (${aiAgentName}) couldn't be found ${chalk.green('locally')}. Aborting...`
      );
      process.exit(0);
    }

    // retrieve local AI Agent config
    const localConfig = await fs.readJSON(`${agentDir}/config.json`);

    // retrieve remote AI Agent config
    const remoteConfig = await CognigyClient.readAiAgent({
      aiAgentId: localConfig._id,
    });

    // perform full comparison and output results
    const diffString = jsonDiff.diffString(remoteConfig, localConfig);

    spinner.stop();

    if (diffString) console.log(`\n\n ${diffString}`);
    else console.log(`\n\nThe local and remote resource are identical.`);

    return;
  } catch (err) {
    console.log(err.message);
    process.exit(0);
  }
};
