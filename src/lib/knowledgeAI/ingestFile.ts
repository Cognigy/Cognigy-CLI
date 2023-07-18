/** Node Modules */
import * as fs from 'fs';
import FormData from 'form-data';

/* Custom Modules*/
import CognigyClient from "../../utils/cognigyClient";
import axios from 'axios';
import { makeAxiosRequest } from '../../utils/axiosClient';
import { Spinner } from 'cli-spinner';
import { checkTask } from '../../utils/checks';

export const ingestFile = async (
	knowledgeStoreId: string,
	filePath: string
) => {
	const spinner = new Spinner(`Uploading file ${filePath} into the knowledgeStore(${knowledgeStoreId}... %s`);
	spinner.setSpinnerString('|/-\\');

	try {
		spinner.start();
		
		const fileStream = fs.createReadStream(filePath);
	
		const formData = new FormData();
		formData.append('file', fileStream);

		// const uploadingTask = await CognigyClient.uploadKnowledgeSourceFile({
		// 	knowledgeStoreId,
		// 	file: formData.getBuffer()
		// });
		const result = await makeAxiosRequest({
			path: `/new/beta/knowledgestores/${knowledgeStoreId}/sources/upload`,
			method: 'POST',
			type: 'multipart/form-data',
			form: formData
		});

		await checkTask(result?.data?._id, 0, 100000);
		spinner.stop();

		console.log('\nFile uploaded successfully!');
	  } catch (error) {
		spinner.stop();
		console.error('Error occurred while uploading the file:', error.message);
		throw error;
	  }
}