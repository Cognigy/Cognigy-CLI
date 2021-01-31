import CONFIG from '../utils/config';
import { startProgressBar, endProgressBar } from '../utils/progressBar';
import { exportFlowCSV, localizeFlow } from '../lib/flows';
import { checkCreateDir, checkProject } from '../utils/checks';
import { upperFirst } from '../utils/stringUtils';
import { pullLocales } from '../lib/locales';
import { WSASERVICE_NOT_FOUND } from 'constants';

/**
 * Adds localizations to Flow Nodes and Intents
 * @param localeName The name of the Cognigy Locale to process
 * @param resourceName The name of the Cognigy Flow to process
 */
export const localize = async ({ resourceType, resourceName, options }): Promise<void> => {

    if (resourceType !== "flow") {
        console.log(`\nLocalization of resource type ${resourceType} is not supported.`);
        process.exit(0);
    }

    // check if a locale was provided and if it actually exists
    await checkLocale(options.localeName);

    // check if project exists on Cognigy.AI and the APIKey can retrieve it
    await checkProject();

    // start localization process
    console.log(`Starting to add localizations to Flow ${resourceName} ... \n`);
    
    startProgressBar(100);
    await localizeFlow(resourceName, 100, options);
    endProgressBar();

    console.log(`\nWe've successfully added localizations to Flow ${resourceName || ''} - Enjoy.`);

    return;
};

/**
 * Checks if a locale name was provided and if the locale actually exists on the server
 * @param localeName 
 */
const checkLocale = async (localeName: string): Promise<boolean> => {
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