import { indexKnowledgeStores } from '../../../lib/knowledgeAI';

export const indexKnowledgeStoresCMD = (projectId: string): Promise<void> => {
  return indexKnowledgeStores(projectId);
};
