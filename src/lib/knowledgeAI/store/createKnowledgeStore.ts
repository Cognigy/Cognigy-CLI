import CognigyClient from '../../../utils/cognigyClient';

export const createKnowledgeStore = async (	
    projectId: string,
	language: string,
	name: string,
	description: string): Promise<void> => {
		const store = await CognigyClient.createKnowledgeStore({
            projectId,
			language,
			name,
			description
        });

		console.log(`\n\nKnowledgeAI Store with name: ${name} has been created!\n store: ${JSON.stringify(store, null, 2)}`);
	};