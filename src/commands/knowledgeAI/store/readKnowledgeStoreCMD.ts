import { readKnowledgeStore } from '../../../lib/knowledgeAI';

export const readKnowledgeStoreCMD = (
  knowledgeStoreId: string
): Promise<void> => {
  return readKnowledgeStore(knowledgeStoreId);
};
