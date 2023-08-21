import * as fs from 'fs';
import { findConfig } from '../utils/findConfig';
const configFile = findConfig();

interface ICLIConfig {
    apiKey: string;
    agent: string;
    baseUrl: string;
    agentDir: string;
    knowledgeAIStoreDir: string;
    playbookTimeoutSeconds: number;
    maxNumberOfTokens: number;
}

const getConfig = (): ICLIConfig => {
    const config = {
        apiKey: process.env.CAI_APIKEY,
        agent: process.env.CAI_AGENT,
        baseUrl: process.env.CAI_BASEURL,
        agentDir: process.env.CAI_AGENTDIR,
        knowledgeAIStoreDir: process.env.KNOWLEDGE_AI_STORE_DIR,
        playbookTimeoutSeconds: Number(process.env.CAI_PLAYBOOK_TIMEOUT_SECONDS),
        maxNumberOfTokens: process.env.MAX_NUMBER_OF_TOKENS ? parseInt(process.env.MAX_NUMBER_OF_TOKENS, 10) : 2048
    };

    if (process.argv[2] === "init" || process.argv.length < 3) return config;

    // if config is incomplete, try to check config file
    if (!config.apiKey || !config.agent || !config.baseUrl || !config.agentDir) {
        try {
            const fileConfig = JSON.parse(fs.readFileSync(configFile).toString());

            config.apiKey = (config.apiKey) ? config.apiKey : fileConfig.apiKey;
            config.agent = (config.agent) ? config.agent : fileConfig.agent;
            config.baseUrl = (config.baseUrl) ? config.baseUrl : fileConfig.baseUrl;
            config.agentDir = (config.agentDir) ? config.agentDir : fileConfig.agentDir;
            config.knowledgeAIStoreDir = (config.knowledgeAIStoreDir) ? config.knowledgeAIStoreDir : fileConfig.knowledgeAIStoreDir;
            config.playbookTimeoutSeconds = (config.playbookTimeoutSeconds) ? config.playbookTimeoutSeconds : fileConfig.playbookTimeoutSeconds;
            config.maxNumberOfTokens = (config.maxNumberOfTokens) ? config.maxNumberOfTokens : fileConfig.maxNumberOfTokens;

            if (!config.apiKey || !config.agent || !config.baseUrl || !config.agentDir || !config.playbookTimeoutSeconds)
                throw("incomplete config");
        } catch (err) {
            console.log('Missing configuration in environment variables or config.json');
            process.exit(0);
        }
    }

    return config;
};

export default getConfig();