import * as fs from 'fs';
import chalk from '../utils/chalk';

import CognigyClient from '../utils/cognigyClient';
import CONFIG from '../utils/config';
import { indexAll } from '../utils/indexAll';

import { IExtensionIndexItem_2_0 } from '@cognigy/rest-api-client';
import { checkCreateDir } from '../utils/checks';

/**
 * Updates Extensions definitons from server (every x seconds)
 * @param cacheTime Seconds to cache locales
 */
export const pullExtensions = async (
  cacheTime: number = 10
): Promise<IExtensionIndexItem_2_0[]> => {
  // make sure all directories exist
  checkCreateDir(CONFIG.agentDir);
  checkCreateDir(CONFIG.agentDir + '/extensions');

  const extensionsLocation = CONFIG.agentDir + '/extensions/extension.json';

  let extensionsAge = cacheTime + 1;
  let extensions = [];

  /* Check if Extensions folder exists */
  if (fs.existsSync(extensionsLocation)) {
    const stats = fs.statSync(extensionsLocation);
    const mtime = stats.mtime;
    extensionsAge = (new Date().getTime() - mtime.getTime()) / 1000;
  }

  /* If Extensions are stale, update them from server */
  if (extensionsAge > cacheTime) {
    const extensionsResult = await indexAll(CognigyClient.indexExtensions)({
      projectId: CONFIG.agent,
    });

    for (let extensionItem of extensionsResult.items) {
      const extension = await CognigyClient.readExtension({
        extensionId: extensionItem._id,
      });

      extensions.push(extension);
    }

    fs.writeFileSync(
      extensionsLocation,
      JSON.stringify(extensions, undefined, 4)
    );
  } else {
    extensions = JSON.parse(fs.readFileSync(extensionsLocation).toString());
  }

  return extensions;
};
