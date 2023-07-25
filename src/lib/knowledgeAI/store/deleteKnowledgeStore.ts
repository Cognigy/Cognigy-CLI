/* Custom Modules*/
import CognigyClient from "../../../utils/cognigyClient";

export const deleteKnowledgeStore = async (
    knowledgeStoreId: string
) => {
    await CognigyClient.deleteKnowledgeStore({
        knowledgeStoreId
    });

    console.log(`\n\nKnowledgeAI Store with id: ${knowledgeStoreId} has been deleted!`);
}