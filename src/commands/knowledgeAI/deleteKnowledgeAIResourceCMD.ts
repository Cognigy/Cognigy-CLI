/* Custom Modules */
import { deleteKnowledgeSourceCMD } from './source/deleteKnowledgeSourceCMD';
import { deleteKnowledgeStoreCMD } from './store/deleteKnowledgeStoreCMD';

/** Types */
import { TResourceType } from './IResourceType';

export const deleteKnowledgeAIResourceCMD = (data: {
  resourceType: TResourceType;
  knowledgeStoreId: string;
  sourceId?: string;
}): Promise<void> => {
  const { resourceType, knowledgeStoreId } = data;

  if (resourceType === 'store') {
    return deleteKnowledgeStoreCMD(knowledgeStoreId);
  } else if (resourceType === 'source') {
    const { sourceId } = data;
    return deleteKnowledgeSourceCMD(knowledgeStoreId, sourceId);
  } else {
    throw new Error(
      `Inavalid resourceType for the command 'cognigy knowdledge-ai delete',  wrong type: ${resourceType}`
    );
  }
};
