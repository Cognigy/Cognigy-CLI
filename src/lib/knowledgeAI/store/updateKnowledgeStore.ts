import CognigyClient from '../../../utils/cognigyClient';

export const updateKnowledgeStore = async (	
	knowledgeStoreId: string,
	name?: string,
	description?: string): Promise<void> => {
		const store = await CognigyClient.updateKnowledgeStore({
			knowledgeStoreId,
			name,
			description
        });

		console.log(`\n\nKnowledgeAI Store updated!`);
	};