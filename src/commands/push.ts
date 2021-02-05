import * as inquirer from 'inquirer';

import { startProgressBar, endProgressBar } from '../utils/progressBar';
import {  pushFlow } from '../lib/flows';
import { pushEndpoint } from '../lib/endpoints';
import { checkAgentDir, checkResourceDir, checkProject } from '../utils/checks';
import { upperFirst } from '../utils/stringUtils';
import { pushLexicon } from '../lib/lexicons';

/**
 * Pushes a single resource from disk to Cognigy.AI
 * @param resourceType the type of resources to restore
 */
export const push = async ({ resourceType, resourceName, options }): Promise<void> => {
    // check if project exists on Cognigy.AI and the APIKey can retrieve it
    await checkProject();

    // check agent directory
    checkAgentDir();

    // check if directory for resourceType exists
    checkResourceDir(resourceType, resourceName);

    // get confirmation from user that Cognigy.AI data will be overwritten
    const answers = (options.forceYes) ? { overwrite: true } : await inquirer
    	.prompt([
            {
            type: 'confirm',
            name: 'overwrite',
            message: `This will overwrite ${resourceType} ${resourceName} on Cognigy.AI. Do you want to proceed?`
        }
    ]);
    if (!answers.overwrite) {
        console.log(`Aborting...`);
        return;
    }

    console.log(`Starting to push ${upperFirst(resourceType)} ${resourceName} to Cognigy.AI ... \n`);
    

    switch (resourceType) {
        case "flow":
            startProgressBar(100);
            await pushFlow(resourceName, 100);
            endProgressBar();
            break;

        case "endpoint":
            startProgressBar(100);
            await pushEndpoint(resourceName, 100);
            endProgressBar();
            break;

        case "lexicon":
            await pushLexicon(resourceName, 100, options.timeout);
            break;

        default:
            console.log(`Resource type ${resourceType} can't be pushed.`);
    }

    console.log(`\nWe've successfully pushed ${upperFirst(resourceType)} ${resourceName} to Cognigy.AI - Enjoy.`);

    return;
};