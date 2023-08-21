/** Node Modules */
import * as fs from "fs";

/* Custom  Modules */
import CognigyClient from '../../../utils/cognigyClient';
import CONFIG from '../../../utils/config';
import { checkCreateDir, checkProject } from '../../../utils/checks';

export const createKnowledgeStore = async (
	projectId: string,
	language: string,
	name: string,
	description: string): Promise<void> => {
	try {
		// check if project exists on Cognigy.AI and the APIKey can retrieve it
		await checkProject();

		const store = await CognigyClient.createKnowledgeStore({
			projectId,
			language,
			name,
			description
		});

		// check if agent directory exists and if not, create it
		await checkCreateDir(CONFIG.knowledgeAIStoreDir);
		fs.writeFileSync(`./${CONFIG.knowledgeAIStoreDir}/knowledgeStore_${name}.json`, JSON.stringify(store, undefined, 4));

		console.log(`\n\nKnowledgeAI Store with name: ${name} has been created!\n store: ${JSON.stringify(store, null, 2)}`);
	} catch (err) {
		console.error(`Error creating the the store for KnowledgeAI,\nerr: ${err}`);
		throw err;
	}
};
