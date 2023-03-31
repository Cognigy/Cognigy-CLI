import { checkProject } from '../utils/checks';
import { runPlaybooks } from '../lib/playbooks';

/**
 * Runs a resource (e.g. Playbook) on Cognigy.AI
 * @param resourceType the type of resources to run
 */
export const run = async ({ resourceType, playbookFile, options }): Promise<void> => {
    // check if project exists on Cognigy.AI and the APIKey can retrieve it
    await checkProject();

    switch (resourceType) {
        case "playbooks":
            await runPlaybooks(playbookFile);
            break;

        default:
            console.log(`Resource type ${resourceType} can't be run.`);
    }

    return;
};