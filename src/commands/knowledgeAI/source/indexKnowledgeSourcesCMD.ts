/* Custom Modules */
import { indexKnowledgeSources } from '../../../lib/knowledgeAI';

export const indexKnowledgeSourcesCMD = (
  knowledgeStoreId: string
): Promise<void> => {
  return indexKnowledgeSources(knowledgeStoreId);
};
