import CONFIG from '../utils/config';
import { startProgressBar, endProgressBar } from '../utils/progressBar';
import { exportFlowCSV } from '../lib/flows';
import { checkCreateDir, checkProject } from '../utils/checks';
import { upperFirst } from '../utils/stringUtils';

/**
 * Exports all strings from a Flow as CSV
 * @param resourceType the type of resources to restore
 */
export const exportcsv = async ({
  resourceType,
  resourceName,
}): Promise<void> => {
  // check if project exists on Cognigy.AI and the APIKey can retrieve it
  await checkProject();

  // check if agent directory exists and if not, create it
  await checkCreateDir(CONFIG.agentDir);

  console.log(
    `Starting to export CSV from ${upperFirst(resourceType)} ${resourceName} ... \n`
  );
  startProgressBar(100);

  switch (resourceType) {
    case 'flow':
      await exportFlowCSV(resourceName, 100);
      break;

    default:
      console.log(
        `Resource type ${resourceType} can't be used for CSV export.`
      );
  }

  endProgressBar();
  console.log(
    `\nWe've successfully exported the content of ${upperFirst(resourceType)} ${resourceName || ''} to CSV - Enjoy.`
  );

  return;
};
