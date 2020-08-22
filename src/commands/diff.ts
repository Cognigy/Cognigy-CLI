import { checkAgentDir, checkProject } from '../utils/checks';
import { diffFlows } from '../lib/flows';
import { diffEndpoints } from '../lib/endpoints';
import { diffLexicons } from '../lib/lexicons';

/**
 * Provides a diff between a resource on disk and remote
 * @param resourceType the type of resource to compare (e.g. flow)
 * @param resourceId the _id of the resource to compare
 * @param mode diff mode (regular or node)
 */
export const diff = async (resourceType: string, resourceId: string, mode: string = 'full'): Promise<void> => {
    // check if project exists on Cognigy.AI and the APIKey can retrieve it
    await checkProject();

    // check agent directory
    checkAgentDir();

    switch (resourceType) {
        case "flow":
            await diffFlows(resourceId, mode);
            break;

        case "endpoint":
            await diffEndpoints(resourceId, mode);
            break;

        case "lexicon":
            await diffLexicons(resourceId, mode);
            break;

        default:
            console.log(`\n\nInvalid diff resource type ${resourceType}.`);
            return;
    }
};