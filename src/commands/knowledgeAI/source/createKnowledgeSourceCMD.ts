/* Custom Modules */
import { createKnowledgeSource } from "../../../lib/knowledgeAI";

export const createKnowledgeSourceCMD = (
    knowledgeStoreId: string,
    name: string,
    description: string,
    type: "file" | "manual" | "website",
    url?: string
): Promise<void> => {
    if (!knowledgeStoreId || knowledgeStoreId === "" || !name || name === "") {
        throw new Error(`Missing required parameters for the command 'cognigy knowdledge-ai create source',  wrong parameters: ${knowledgeStoreId}, ${name}`)
    }

    if (type === "file") {
        throw new Error(`For creating an knowlege Source with the Type = file use the 'cognigy knowleddge-ai ingest' command`);
    }

    if (type === "website" && (!url || url === "")) {
        throw new Error('For creating an knowlegeAI Source with the Type = website you need to pass a url')
    }

    return createKnowledgeSource(knowledgeStoreId, name, description, type, url);
};