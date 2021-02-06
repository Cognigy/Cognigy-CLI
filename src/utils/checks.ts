import * as fs from 'fs';
import * as del from 'del';

import CONFIG from '../utils/config';
import CognigyClient from '../utils/cognigyClient';
import { pullLocales } from '../lib/locales';

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
 * @param calls How many calls were made?
 * @param locale Which locale to cehck
 * @param timeout Timeout before task times out
 */
export const checkTask = async (taskId: string, calls: number = 0, timeout): Promise<any> => {
    const task = await CognigyClient.readTask({
        taskId: taskId,
        projectId: CONFIG.agent
    });

    if (calls === 5) {
        return Promise.reject("Timeout");
    }

    if (task.status === "error")
        return Promise.reject(new Error(task.failReason));

    if (task.status === "queued" || task.status === "active") {
        return new Promise((resolve) => setTimeout(async () => { await checkTask(taskId, ++calls, timeout); resolve("ok"); }, timeout / 5));
    } else {
        return Promise.resolve(task);
    }
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