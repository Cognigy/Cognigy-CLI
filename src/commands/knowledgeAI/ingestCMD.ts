import { ingestFile } from "../../lib/knowledgeAI";

export const ingestCMD = async (
    projectId: string,
	language: string,
	knowledgeStoreId: string,
	input: string,
	name?: string,
	shouldCreateFilesForFailedIngestions: boolean = false,
	verbose: boolean = false
) => {
	await ingestFile(knowledgeStoreId, input);
}