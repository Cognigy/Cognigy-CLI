/* Custom Modules */
import { createKnowledgeSource } from "../../../lib/knowledgeAI";

export const createKnowledgeSourceCMD = (
    knowledgeStoreId: string,
    name: string,
    description: string,
    type: "file" | "manual" | "website",
    url?: string
): Promise<void> => {
    return createKnowledgeSource(knowledgeStoreId, name, description, type, url);
};