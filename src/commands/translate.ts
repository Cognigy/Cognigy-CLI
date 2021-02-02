import inquirer = require('inquirer');
import { ITranslateFlowOptions, pullFlow, translateFlow } from '../lib/flows';
import { checkAgentDir, checkLocale, checkProject } from '../utils/checks';
import { endProgressBar, startProgressBar } from '../utils/progressBar';
import { upperFirst } from '../utils/stringUtils';

/**
 * Translates a resource in Cognigy.AI
 * @param resourceType the type of resources to restore
 */
export const translate = async ({ resourceType, resourceName, options }): Promise<void> => {
    const { translator, apiKey, toLanguage, forceYes } = <ITranslateFlowOptions> options;

    if (resourceType !== "flow") {
        console.log(`\Translation of resource type ${resourceType} is not supported.`);
        process.exit(0);
    }

    // check if a locale was provided and if it actually exists
    await checkLocale(options.localeName);

    if (!['google', 'microsoft'].includes(translator)) {
        console.log("Please use 'google' or 'microsoft' as translation tool");
        process.exit(0);
    }

    if (!apiKey) {
        console.log(`Please provide an API Key for ${translator} translate`);
        process.exit(0);
    }

    if (!toLanguage) {
        console.log(`Please provide a language to translate to (e.g. en)`);
        process.exit(0);
    }

    // check if project exists on Cognigy.AI and the APIKey can retrieve it
    await checkProject();

    // check agent directory
    checkAgentDir();

    // get confirmation from user that data will be overwritten
    const answers = (forceYes) ? { overwrite: true } : await inquirer
        .prompt([
            {
                type: 'confirm',
                name: 'overwrite',
                message: `This will irreversably overwrite data for ${upperFirst(resourceType)} ${resourceName}. Do you want to proceed?`
            }
        ]);

    if (!answers.overwrite) {
        console.log(`Aborting...`);
        return;
    }

    // start translation process
    console.log(`\nStarting to translate Flow '${resourceName}'...\n`);

    // localize the Flow
    await translateFlow(resourceName, options);

    // re-pull the Flow to have newest version on the HD
    console.log(`\nRefreshing local Flow copy...\n`);
    startProgressBar(100);
    await pullFlow(resourceName, 50);
    endProgressBar();

    console.log(`\nWe've successfully translated Flow '${resourceName}'...\n`);

    return;
};