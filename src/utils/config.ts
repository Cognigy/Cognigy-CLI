import * as fs from 'fs';
import { findConfig } from '../utils/findConfig';
const configFile = findConfig();

interface ICLIConfig {
    apiKey: string;
    agent: string;
    baseUrl: string;
    agentDir: string;
}

const getConfig = (): ICLIConfig => {
    const config = {
        apiKey: process.env.CAI_APIKEY,
        agent: process.env.CAI_AGENT,
        baseUrl: process.env.CAI_BASEURL,
        agentDir: process.env.CAI_AGENTDIR
    };

    if (process.argv[2] === "init" || process.argv.length < 3) return config;

    // if config is incomplete, try to check config file
    if (!config.apiKey || !config.agent || !config.baseUrl || !config.agentDir) {
        try {
            const fileConfig = JSON.parse(fs.readFileSync(configFile).toString());

            config.apiKey = (config.apiKey) ? config.apiKey : (fileConfig.apiKey) ? fileConfig.apiKey : '';
            config.agent = (config.agent) ? config.agent : (fileConfig.agent) ? fileConfig.agent : '';
            config.baseUrl = (config.baseUrl) ? config.baseUrl : (fileConfig.baseUrl) ? fileConfig.baseUrl : '';
            config.agentDir = (config.agentDir) ? config.agentDir : (fileConfig.agentDir) ? fileConfig.agentDir : '';

            if (!config.apiKey || !config.agent || !config.baseUrl || !config.agentDir)
                throw("incomplete config");
        } catch (err) {
            console.log('Missing configuration in environment variables or config.json');
            process.exit(0);
        }
    }

    return config;
};

export default getConfig();