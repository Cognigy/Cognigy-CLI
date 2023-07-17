/* Custom Modules */
import { deleteKnowledgeStore } from "../../../lib/knowledgeAI";

export const deleteKnowledgeStoreCMD = (
    knowledgeStoreId: string
) => {
    return deleteKnowledgeStore(knowledgeStoreId);
}