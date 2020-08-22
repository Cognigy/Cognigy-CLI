import * as inquirer from 'inquirer';

import CONFIG from '../utils/config';
import { startProgressBar, endProgressBar } from '../utils/progressBar';
import { pullFlow } from '../lib/flows';
import { pullEndpoint } from '../lib/endpoints';
import { checkCreateDir, checkProject } from '../utils/checks';
import { upperFirst } from '../utils/stringUtils';
import { pullLexicon } from '../lib/lexicons';
import { pullLocales } from '../lib/locales';

/**
 * Pushes a single resource from disk to Cognigy.AI
 * @param resourceType the type of resources to restore
 */
export const pull = async ({ resourceType, resourceName, forceYes = false }): Promise<void> => {
    // check if project exists on Cognigy.AI and the APIKey can retrieve it
    await checkProject();

    // get confirmation from user that local data will be overwritten
    const answers = (forceYes) ? { overwrite: true } : await inquirer
    	.prompt([
            {
            type: 'confirm',
            name: 'overwrite',
            message: `This will overwrite data for ${upperFirst(resourceType)} ${resourceName} you have stored locally. Do you want to proceed?`
        }
    ]);
    if (!answers.overwrite) {
        console.log(`Aborting...`);
        return;
    }

    // check if agent directory exists and if not, create it
    await checkCreateDir(CONFIG.agentDir);

    console.log(`Starting to pull ${upperFirst(resourceType)} ${resourceName} from Cognigy.AI ... \n`);
    startProgressBar(100);

    switch (resourceType) {
        case "flow":
            await pullFlow(resourceName, 100);
            break;

        case "endpoint":
            await pullEndpoint(resourceName, 100);
            break;

        case "lexicon":
            await pullLexicon(resourceName, 100);
            break;

        case "locales":
            await pullLocales();
            break;

        default:
            console.log(`Resource type ${resourceType} can't be pulled.`);
    }

    endProgressBar();
    console.log(`\nWe've successfully pulled ${upperFirst(resourceType)} ${resourceName || ''} from Cognigy.AI - Enjoy.`);

    return;
};