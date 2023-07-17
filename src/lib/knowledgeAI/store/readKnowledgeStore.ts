import CognigyClient from '../../../utils/cognigyClient';

export const readKnowledgeStore = async (	
		knowledgeStoreId: string
	): Promise<void> => {
		const store = await CognigyClient.readKnowledgeStore({
			knowledgeStoreId
		});

		console.log(`\n\nKnowledgeAI Store with id: ${knowledgeStoreId}\n store: ${JSON.stringify(store, null, 2)}`);
	};