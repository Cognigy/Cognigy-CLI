/* Custom  Modules */
import CognigyClient from '../../../utils/cognigyClient';

export const indexKnowledgeSources = async (
	knowledgeStoreId
): Promise<void> => {
	try {
		const sources = await CognigyClient.indexKnowledgeSources({
			knowledgeStoreId
		});

		console.log(`\n\nKnowledgeAI store(${knowledgeStoreId}) has ${sources.items.length} sources\n sources: ${JSON.stringify(sources.items, null, 2)}`);
	} catch (err) {
		console.error(`Error getting the list of sources for KnowledgeAI store(${knowledgeStoreId}),\nerr: ${err}`);
	}
};