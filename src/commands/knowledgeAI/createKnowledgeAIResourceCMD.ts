/* Custom Modules */
import { createKnowledgeSourceCMD } from "./source/createKnowledgeSourceCMD";
import { createKnowledgeStoreCMD } from "./store/createKnowledgeStoreCMD";

/** Types */
import { TResourceType } from "./IResourceType";

export const createKnowledgeAIResourceCMD = (data: {
	resourceType: TResourceType,	
	name: string,
	description: string,
    projectId?: string,
	language?: string,
	knowledgeStoreId?: string,
    type?: "file" | "manual" | "website",
    url?: string
}): Promise<void> => {

	const { resourceType, name, description } = data;

	if (resourceType === "store") {
		const { projectId, language } = data;
		return createKnowledgeStoreCMD(projectId, language, name, description);
	}
	else if (resourceType === "source") {
		const {knowledgeStoreId, type, url } = data;
		return createKnowledgeSourceCMD(knowledgeStoreId, name, description, type, url);
	}
	else {
		throw new Error (`Inavalid resourceType for the command 'cognigy knowdledge-ai create',  wrong type: ${resourceType}`)
	}
};