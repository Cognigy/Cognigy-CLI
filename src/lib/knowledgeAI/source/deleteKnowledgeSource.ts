/* Custom  Modules */
import CognigyClient from '../../../utils/cognigyClient';

export const deleteKnowledgeSource = async (
	knowledgeStoreId: string,
	sourceId: string
): Promise<void> => {
	try {
		await CognigyClient.deleteKnowledgeSource({
			knowledgeStoreId,
			sourceId
		});

		console.log(`\n\nKnowledgeAI Source with id: ${knowledgeStoreId} has been deleted!\n`);
	} catch (err) {
		console.error(`Error deleting the KnowledgeAI store(${knowledgeStoreId})/source(${sourceId}), err: ${err}`);
		throw err;
	}
};