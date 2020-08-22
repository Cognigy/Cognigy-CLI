import * as inquirer from 'inquirer';

import { startProgressBar, endProgressBar } from '../utils/progressBar';
import { checkAgentDir, checkProject } from '../utils/checks';
import { upperFirst } from '../utils/stringUtils';

import { restoreFlows } from '../lib/flows';
import { restoreEndpoints } from '../lib/endpoints';
import { restoreLexicons } from '../lib/lexicons';

/**
 * Restores a Virtual Agent project from disk to Cognigy.AI
 * @param resourceType the type of resources to restore (default: all)
 */
export const restore = async ({ resourceType = 'agent', forceYes = false }): Promise<void> => {
    // check if project exists on Cognigy.AI and the APIKey can retrieve it
    await checkProject();

    // check agent directory
    checkAgentDir();

    // get confirmation from user that Cognigy.AI data will be overwritten
    const answers = (forceYes) ? { overwrite: true } : await inquirer
    	.prompt([
            {
            type: 'confirm',
            name: 'overwrite',
            message: `This will overwrite all ${upperFirst(resourceType)} data you have stored on Cognigy.AI. Do you want to proceed?`
        }
    ]);

    if (!answers.overwrite) {
        console.log(`Aborting...`);
        return;
    }

    console.log(`Starting to restore your ${upperFirst(resourceType)}(s) to Cognigy.AI... \n`);
    startProgressBar(100);

    switch (resourceType) {
        case "agent":
            await restoreFlows(33);
            await restoreEndpoints(33);
            await restoreLexicons(33);
            break;

        case "flows":
        case "flow":
            await restoreFlows(100);
            break;

        case "endpoints":
        case "endpoint":
            await restoreEndpoints(100);
            break;

        case "lexicons":
        case "lexicon":
            await restoreLexicons(100);
            break;
    }

    endProgressBar();
    console.log(`\nWe've restored your ${upperFirst(resourceType)}(s) to Cognigy.AI - Enjoy.`);

    return;
};