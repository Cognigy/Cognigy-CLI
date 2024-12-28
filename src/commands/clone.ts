import * as inquirer from 'inquirer';

import { startProgressBar, endProgressBar } from '../utils/progressBar';
import CONFIG from '../utils/config';
import { checkProject, removeCreateDir } from '../utils/checks';
import { upperFirst } from '../utils/stringUtils';

import { cloneEndpoints } from '../lib/endpoints';
import { cloneFlows } from '../lib/flows';
import { cloneLexicons } from '../lib/lexicons';
import { cloneAiAgents } from '../lib/aiagents';

/**
 * Clones a full Virtual Agent project to disk
 * @param resourceType the type of resources to clone to disc (default: all)
 */
export const clone = async ({ resourceType = 'agent', forceYes = false }): Promise<void> => {
    // check if project exists on Cognigy.AI and the APIKey can retrieve it
    await checkProject();

    // get confirmation from user that local data will be overwritten
    const answers = (forceYes) ? { overwrite: true } : await inquirer
        .prompt([
            {
                type: 'confirm',
                name: 'overwrite',
                message: `This will delete all ${resourceType} data you have stored currently locally. Do you want to proceed?`
            }
        ]);

    if (!answers.overwrite) {
        console.log(`Aborting...`);
        return;
    }

    // check if agent directory exists and if not, create it
    await removeCreateDir(CONFIG.agentDir);

    console.log(`Starting to clone your ${upperFirst(resourceType)} to disk. This can take several minutes... \n`);
    startProgressBar(100);

    switch (resourceType) {
        case "agent":
            await cloneFlows(33);
            await cloneEndpoints(33);
            await cloneLexicons(33);
            await cloneAiAgents();
            break;

        case "flows":
        case "flow":
            await cloneFlows(100);
            break;

        case "endpoints":
        case "endpoint":
            await cloneEndpoints(100);
            break;

        case "lexicons":
        case "lexicon":
            await cloneLexicons(100);
            break;

        case "aiAgents":
        case "aiAgent":
            await cloneAiAgents();
            break;
    }

    endProgressBar();
    console.log(`\nWe've cloned your ${upperFirst(resourceType)} to ${CONFIG.agentDir} - Enjoy.`);

    return;
};