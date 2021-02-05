import * as fs from 'fs';
import { findConfig } from '../utils/findConfig';

const configFile = findConfig();

if (process.argv[2] !== "init" && process.argv[2]) {
    if (!fs.existsSync(configFile)) {
        console.error("No config.json file found. Please run cognigy init.");
        process.exit(0);
    } else {
        const config = JSON.parse(fs.readFileSync(configFile).toString());
        if (!config.agent || !config.apiKey || !config.baseUrl || !config.agentDir) {
            console.log("config.json doesn't have all necessary fields (agent, baseUrl, apiKey, agentDir) defined.");
            process.exit(0);
        }
    }
}