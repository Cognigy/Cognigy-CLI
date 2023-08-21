/* Custom Modules */
import { deleteKnowledgeSource } from "../../../lib/knowledgeAI";

export const deleteKnowledgeSourceCMD = (
    knowledgeStoreId: string,
    sourceId: string
): Promise<void> => {
    if (!knowledgeStoreId || !sourceId) {
        throw new Error(`Missing required params knowledgeStoreId: ${knowledgeStoreId}, sourceId: ${sourceId}`);
    }

    return deleteKnowledgeSource(knowledgeStoreId, sourceId);
};