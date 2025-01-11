/* Custom Modules */
import { readKnowledgeSource } from '../../../lib/knowledgeAI';

export const readKnowledgeSourceCMD = (
  knowledgeStoreId: string,
  sourceId: string
): Promise<void> => {
  if (!knowledgeStoreId || !sourceId) {
    throw new Error(
      `Missing compulsory parameters: storeId: ${knowledgeStoreId}, sourceId: ${sourceId}`
    );
  }

  return readKnowledgeSource(knowledgeStoreId, sourceId);
};
