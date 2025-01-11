/* Custom Modules */
import { readKnowledgeSourceCMD } from './source/readKnowledgeSourceCMD';
import { readKnowledgeStoreCMD } from './store/readKnowledgeStoreCMD';

/** Types */
import { TResourceType } from './IResourceType';

export const readKnowledgeAIResourceCMD = (data: {
  resourceType: TResourceType;
  knowledgeStoreId: string;
  sourceId?: string;
}): Promise<void> => {
  const { resourceType, knowledgeStoreId } = data;

  if (resourceType === 'store') {
    return readKnowledgeStoreCMD(knowledgeStoreId);
  } else if (resourceType === 'source') {
    const { sourceId } = data;
    return readKnowledgeSourceCMD(knowledgeStoreId, sourceId);
  } else {
    throw new Error(
      `Inavalid resourceType for the command 'cognigy knowdledge-ai delete',  wrong type: ${resourceType}`
    );
  }
};
