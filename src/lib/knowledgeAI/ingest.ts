/* Custom Modules*/
import CognigyClient from "../../utils/cognigyClient";

export const ingest = (
    projectId: string,
	language: string,
	knowledgeStoreId: string,
	input: string,
	name?: string,
	shouldCreateFilesForFailedIngestions: boolean = false,
	verbose: boolean = false
) => {}