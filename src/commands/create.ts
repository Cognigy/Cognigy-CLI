import CONFIG from '../utils/config';
import { createSnapshot } from '../lib/snapshots';
import { checkProject } from '../utils/checks';
import { upperFirst } from '../utils/stringUtils';

import chalk from '../utils/chalk';
import { createLocale } from '../lib/locales';

/**
 * Pushes a single resource from disk to Cognigy.AI
 * @param resourceType the type of resources to restore
 */
export const create = async ({
  resourceType,
  resourceName,
  description,
  timeout,
  skipDownload = false,
  fallbackLocale,
  nluLanguage,
}): Promise<void> => {
  // check if project exists on Cognigy.AI and the APIKey can retrieve it
  await checkProject();

  if (['snapshot', 'locale'].indexOf(resourceType) === -1) {
    console.log('Currently only snapshots or locales can be created');
    process.exit(0);
  }

  try {
    switch (resourceType) {
      case 'snapshot':
        await createSnapshot(resourceName, description, timeout, skipDownload);
        if (!skipDownload)
          console.log(
            `\n[${chalk.green('success')}] Created Snapshot ${resourceName} and downloaded it to ./agent/snapshots/${resourceName}.csnap - Enjoy.`
          );
        else
          console.log(
            `\n[${chalk.green('success')}] Created Snapshot ${resourceName} on Cognigy.AI - Enjoy.`
          );
        break;

      case 'locale':
        await createLocale(resourceName, fallbackLocale, nluLanguage);
        break;
    }
  } catch (err) {
    console.log(`\n[${chalk.red('error')}] ${err.message}`);
    process.exit(0);
  }

  return;
};
