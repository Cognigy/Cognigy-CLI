import { translateFlow } from '../lib/flows';
import { checkAgentDir, checkProject } from '../utils/checks';
import { upperFirst } from '../utils/stringUtils';

/**
 * Translates a resource in Cognigy.AI
 * @param resourceType the type of resources to restore
 */
export const translate = async ({ resourceType, resourceName, fromLanguage, targetLanguage, translator, apiKey, timeout }): Promise<void> => {
    // check if project exists on Cognigy.AI and the APIKey can retrieve it
    await checkProject();

    // check agent directory
    checkAgentDir();

    if (resourceType !== 'flow') {
        console.log('Currently only flows can be translated');
        process.exit(0);
    }

    if (!['google', 'microsoft'].includes(translator)) {
        console.log("Please use 'google' or 'microsoft' as translation tool");
        process.exit(0);
    }

    if (!apiKey) {
        console.log(`Please provide an API Key for ${translator} translate`);
        process.exit(0);
    }

    await translateFlow(resourceName, fromLanguage, targetLanguage, translator, apiKey, timeout);

    console.log(`\nTranslating ${upperFirst(resourceName)} on Cognigy.AI ended - Enjoy.`);

    return;
};