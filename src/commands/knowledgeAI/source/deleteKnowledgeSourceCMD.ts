/* Custom Modules */
import { deleteKnowledgeSource } from "../../../lib/knowledgeAI";

export const deleteKnowledgeSourceCMD = (
    knowledgeStoreId: string,
    sourceId: string
): Promise<void> => {
    return deleteKnowledgeSource(knowledgeStoreId, sourceId);
};