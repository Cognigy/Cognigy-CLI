/* Custom Modules */
import { deleteKnowledgeStore } from "../../../lib/knowledgeAI";

export const deleteKnowledgeStoreCMD = (
    knowledgeStoreId: string
) => {
    if (!knowledgeStoreId) {
        throw new Error(`Missing required params knowledgeStoreId: ${knowledgeStoreId}`);
    }
    return deleteKnowledgeStore(knowledgeStoreId);
}