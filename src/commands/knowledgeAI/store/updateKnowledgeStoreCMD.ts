import { updateKnowledgeStore } from '../../../lib/knowledgeAI';

export const updateKnowledgeStoreCMD = (
  knowledgeStoreId: string,
  name: string,
  description: string
): Promise<void> => {
  return updateKnowledgeStore(knowledgeStoreId, name, description);
};
