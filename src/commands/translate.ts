import { translateFlow } from '../lib/flows';
import { checkAgentDir, checkProject } from '../utils/checks';
import { upperFirst } from '../utils/stringUtils';

/**
 * Translates a resource in Cognigy.AI
 * @param resourceType the type of resources to restore
 */
export const translate = async ({ resourceType, resourceName, locale, targetLanguage, timeout }): Promise<void> => {
    // check if project exists on Cognigy.AI and the APIKey can retrieve it
    await checkProject();

    // check agent directory
    checkAgentDir();

    if (resourceType !== 'flow') {
        console.log('Currently only flows can be translated');
        process.exit(0);
    }

    await translateFlow(resourceName, locale, targetLanguage, timeout);

    console.log(`\nTranslating ${upperFirst(resourceName)} on Cognigy.AI ended - Enjoy.`);

    return;
};