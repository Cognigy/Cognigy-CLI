import { trainFlow } from '../lib/flows';
import { checkProject } from '../utils/checks';
import { upperFirst } from '../utils/stringUtils';

/**
 * Pushes a single resource from disk to Cognigy.AI
 * @param resourceType the type of resources to restore
 */
export const train = async ({ resourceName, timeout }): Promise<void> => {
  // check if project exists on Cognigy.AI and the APIKey can retrieve it
  await checkProject();

  await trainFlow(resourceName, timeout);

  console.log(
    `\nTraining for ${upperFirst(resourceName)} on Cognigy.AI ended - Enjoy.`
  );

  return;
};
