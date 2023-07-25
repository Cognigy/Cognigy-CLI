/* Custom Modules */
import { createKnowledgeStore } from "../../../lib/knowledgeAI";

export const createKnowledgeStoreCMD = (
	projectId: string,
	language: string,
	name: string,
	description: string): Promise<void> => {
	if (!projectId || projectId === "" ||
		!language || language === "" ||
		!name || name === "") {
		throw new Error(`Missing required parameters for the command 'cognigy knowdledge-ai create store',  wrong parameters: projectId: ${projectId}, language: ${language}, name: ${name}`)
	}

	return createKnowledgeStore(projectId, language, name, description);
};