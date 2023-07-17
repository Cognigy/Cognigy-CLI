/* Custom Modules*/
import CognigyClient from "../../utils/cognigyClient";

export const deleteSource = async ( data: {
	knowledgeStoreId: string;
	sourceId: string;
}) => {
	const { knowledgeStoreId, sourceId } = data;
	
	await CognigyClient.deleteKnowledgeSource({
		knowledgeStoreId,
		sourceId
	});

	console.log(`\n\nKnowledgeAI Source with sourceId: ${sourceId} and storeId: ${knowledgeStoreId} has been deleted`);
};