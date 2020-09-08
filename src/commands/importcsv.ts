import CONFIG from '../utils/config';
import { startProgressBar, endProgressBar } from '../utils/progressBar';
import { importFlowCSV } from '../lib/flows';
import { checkCreateDir, checkProject } from '../utils/checks';
import { upperFirst } from '../utils/stringUtils';

/**
 * Imports strings from a CSV to a Flow
 * @param resourceType the type of resources to restore
 */
export const importcsv = async ({ resourceType, resourceName }): Promise<void> => {
    // check if project exists on Cognigy.AI and the APIKey can retrieve it
    await checkProject();

    // check if agent directory exists and if not, create it
    await checkCreateDir(CONFIG.agentDir);

    console.log(`Starting to import CSVs into ${upperFirst(resourceType)} ${resourceName} ... \n`);
    startProgressBar(100);

    switch (resourceType) {
        case "flow":
            await importFlowCSV(resourceName, 100);
            break;

        default:
            console.log(`Resource type ${resourceType} can't be used for CSV import.`);
    }

    endProgressBar();
    console.log(`\nWe've successfully updated the content of ${upperFirst(resourceType)} ${resourceName || ''} from CSV - Enjoy.`);

    return;
};