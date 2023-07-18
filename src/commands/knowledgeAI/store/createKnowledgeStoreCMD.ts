/* Custom Modules */
import { createKnowledgeStore } from "../../../lib/knowledgeAI";

 
export const createKnowledgeStoreCMD = (	
    projectId: string,
	language: string,
	name: string,
	description: string): Promise<void> => {
		return createKnowledgeStore(projectId, language, name, description);
};