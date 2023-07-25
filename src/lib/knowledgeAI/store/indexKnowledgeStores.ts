/** Custom Modules */
import CognigyClient from '../../../utils/cognigyClient';
import CONFIG from '../../../utils/config';

export const indexKnowledgeStores = async (	
    projectId: string
	): Promise<void> => {
		const stores = await CognigyClient.indexKnowledgeStores({
            "projectId": projectId ?? CONFIG.agent
        });

		console.log(`\n\nKnowledgeAI has ${stores.items.length} store\n stores: ${JSON.stringify(stores.items, null, 2)}`);
	};