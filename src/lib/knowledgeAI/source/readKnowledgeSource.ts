/* Custom  Modules */
import CognigyClient from '../../../utils/cognigyClient';

export const readKnowledgeSource = async (
	knowledgeStoreId: string,
	sourceId: string
): Promise<void> => {
	try {
		const source = await CognigyClient.readKnowledgeSource({
			knowledgeStoreId,
			sourceId
		});

		console.log(`\n\nKnowledgeAI store(${knowledgeStoreId}) source: ${JSON.stringify(source, null, 2)}`);
	} catch (err) {
		console.error(`Error getting the the source for KnowledgeAI store(${knowledgeStoreId})/source(${sourceId}),\nerr: ${err}`);
		throw err;
	}
};