/* Custom Modules */
import { TKnowledgeSourceType } from "@cognigy/rest-api-client";
import { createKnowledgeSource } from "../../../lib/knowledgeAI";

export const createKnowledgeSourceCMD = (
    knowledgeStoreId: string,
    name: string,
    description: string,
    type: TKnowledgeSourceType,
    url?: string
): Promise<void> => {
    if (!knowledgeStoreId || knowledgeStoreId === "" || !name || name === "") {
        throw new Error(`Missing required parameters for the command 'cognigy knowdledge-ai create source',  wrong parameters: ${knowledgeStoreId}, ${name}`)
    }

    if (["pdf", "docx", "txt", "ctxt"].includes(type)) {
        throw new Error(`For creating an knowlege Source with the Type = "pdf", "docx", "txt" or "ctxt" use the 'cognigy knowleddge-ai ingest' command`);
    }

    if (type === "url" && (!url || url === "")) {
        throw new Error('For creating an knowlegeAI Source with the Type = url you need to pass a url');
    }

    return createKnowledgeSource(knowledgeStoreId, name, description, type, url);
};