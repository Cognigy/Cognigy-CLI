/* Custom Modules */
import { readKnowledgeSource } from "../../../lib/knowledgeAI";

export const readKnowledgeSourceCMD = (
    knowledgeStoreId: string,
    sourceId: string
): Promise<void> => {
    return readKnowledgeSource(knowledgeStoreId, sourceId);
};
