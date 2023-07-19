/** Custom Modules */
import { handleIngest } from "../../lib/knowledgeAI/handleIngest";

export const ingestCMD = async (
	knowledgeStoreId: string,
	input: string,
	name?: string,
) => {
	await handleIngest(
		knowledgeStoreId,
		input,
		name,
	);
}