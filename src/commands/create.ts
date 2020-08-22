import CONFIG from '../utils/config';
import { createSnapshot } from '../lib/snapshots';
import { checkProject } from '../utils/checks';
import { upperFirst } from '../utils/stringUtils';

import * as chalk from 'chalk';

/**
 * Pushes a single resource from disk to Cognigy.AI
 * @param resourceType the type of resources to restore
 */
export const create = async ({ resourceType, resourceName, description, timeout = 100000, skipDownload = false }): Promise<void> => {
    // check if project exists on Cognigy.AI and the APIKey can retrieve it
    await checkProject();

    if (resourceType !== 'snapshot') {
        console.log('Currently only snapshots can be created');
        process.exit(0);
    }

    try {
        await createSnapshot(resourceName, description, timeout, skipDownload);
    } catch (err) {
        console.log(`\n[${chalk.red("error")}] ${err.message}`);
        process.exit(0);
    }

    if (!skipDownload) console.log(`\n[${chalk.green("success")}] Created Snapshot ${resourceName} and downloaded it to ./agent/snapshots/${resourceName}.csnap - Enjoy.`);
    else console.log(`\n[${chalk.green("success")}] Created Snapshot ${resourceName} on Cognigy.AI - Enjoy.`);

    return;
};