import * as fs from 'fs';
import del from 'del';
import chalk from 'chalk';
import CONFIG from '../utils/config';
import CognigyClient from '../utils/cognigyClient';
import { pullLocales } from '../lib/locales';
import { delay } from './delay';

/**
 * Checks whether the agent directory exists
 */
export const checkAgentDir = () => {
    if (!fs.existsSync(CONFIG.agentDir)) {
        console.log(`Agent directory ${CONFIG.agentDir} can't be found.`);
        process.exit(0);
    }
};

/**
 * Checks whether a directory exists and if not creates it
 */
export const checkCreateDir = async (dir: string): Promise<void> => {
    const splits = dir.split("/");
    let folder = splits[0];
    for (let i = 1; i < splits.length; i++) {
        folder += "/" + splits[i];
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder);
        }
    }
    return;
};

/**
 * Checks whether a directory exists and if not creates it
 */
export const removeCreateDir = async (dir: string): Promise<void> => {
    // remove target directory
    try {
        await del(dir, { force: true });
    } catch (err) { 
        console.log(err.message); 
    }

    // make sure flow directory exists
    checkCreateDir(dir);
    return;
};

/**
 * Checks whether a specific resource directory exists
 */
export const checkResourceDir = (resourceType: string, resourceName: string) => {
    const resourceDir = CONFIG.agentDir + '/' + resourceType + 's/' + resourceName;
    if (!fs.existsSync(resourceDir)) {
        console.log(`${resourceType} ${resourceName} can't be found in directory '${resourceDir}'.`);
        process.exit(0);
    }
};

/**
 * Checks whether the agent project exists
 */
export const checkProject = async () => {
    try {
        await CognigyClient.readProject({
            projectId: CONFIG.agent
        });
    } catch (err) {
        if (err.httpStatusCode === 500) console.log(`Invalid API Key or Base URL`);
        else if (err.httpStatusCode === 400) console.log(`Invalid Agent Project ID`);
        else console.log(`Error ${err.message}`);
        process.exit(0);
    }
};

/**
 * Check if a task is running
 * @param taskId The ID of the task to check
 * @param timeout Timeout before task times out
 */
export const checkTask = async (taskId: string, timeout?: number): Promise<any> => {
    const POOLING_INTERVAL = 1000 * 2; // TODO: define seconds in config.json
    const DEFAULT_TIMEOUT = 1000 * 60 * 5; // TODO: define minutes in config.json

    let restTimeout = typeof timeout === 'number' ? timeout : DEFAULT_TIMEOUT;

    const task = await CognigyClient.readTask({
        taskId: taskId,
        projectId: CONFIG.agent,
    });

    if (task.status === "done") {
        return Promise.resolve();
    }

    if (task.status === "error") {
        return Promise.reject(new Error(task.failReason));
    }

    if (restTimeout < 0) {
        return Promise.reject(new Error(`Timeout on checkTask ID: ${taskId}`));
    }

    await delay(POOLING_INTERVAL);
    return await checkTask(taskId, restTimeout -= POOLING_INTERVAL).catch((err) => {
        console.error(`\n${chalk.red("error:")} ${err.message}.\nAborting...`);
        process.exit();
    });
};

/**
 * Checks if a locale name was provided and if the locale actually exists on the server
 * @param localeName 
 */
export const checkLocale = async (localeName: string): Promise<boolean> => {
    let found = false;

    if (!localeName) {
        console.log(`\nYou must provide a localeName`);
        process.exit(0);
    } else {
        const locales = await pullLocales();
        
        if (!locales) {
            console.log(`\nLocales can't be loaded from server`);
            process.exit(0);
        }

        if (locales && Array.isArray(locales)) {
            locales.forEach((locale) => {
                if (locale.name === localeName) {
                    found = true;
                }
            })
        }

        if (!found) {
            console.log(`\nLocale ${localeName} can't be found. Please create it before continuing.`);
            process.exit(0);
        }
    }

    return found;
}