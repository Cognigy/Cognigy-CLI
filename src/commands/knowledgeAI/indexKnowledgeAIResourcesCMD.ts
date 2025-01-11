/* Custom Modules */
import { indexKnowledgeSourcesCMD } from './source/indexKnowledgeSourcesCMD';
import { indexKnowledgeStoresCMD } from './store/indexKnowledgeStoresCMD';

/** Types */
import { TResourceType } from './IResourceType';

export const indexKnowledgeAIResourcesCMD = (data: {
  resourceType: TResourceType;
  projectId?: string;
  knowledgeStoreId?: string;
}): Promise<void> => {
  const { resourceType } = data;

  if (resourceType === 'store') {
    const { projectId } = data;
    return indexKnowledgeStoresCMD(projectId);
  } else if (resourceType === 'source') {
    const { knowledgeStoreId } = data;
    return indexKnowledgeSourcesCMD(knowledgeStoreId);
  } else {
    throw new Error(
      `Inavalid resourceType for the command 'cognigy knowdledge-ai create',  wrong type: ${resourceType}`
    );
  }
};
