// Imports the Google Cloud client library
const { Translate } = require('@google-cloud/translate').v2;
const axios = require('axios');
const uuid = require('uuid');

interface IFlowNode {
	_id: string;
	referenceId: string;
	type: 'say' | string;
	label: string;
	comment: string;
	isDisabled: boolean;
	isEntryPoint: boolean;
	extension: '@cognigy/basic-nodes' | string;
	localeReference: string;
	config: any;
}

const translateFlowNode = async (flowNode: IFlowNode, targetLanguage: string, translator: 'google' | 'microsoft', apiKey: string): Promise<IFlowNode> => {

	const { type, config } = flowNode;

	try {
		// Check type of node
		switch (type) {
			case 'say':
				// check if node only has plain text
				if (config.say?.text?.length) {
					for (let text of config.say.text) {
						config.say.text[config.say.text.indexOf(text)] = await translate(text, targetLanguage, translator, apiKey);
					}
				}
				break;
			// Skip start and end node
			case 'start':
			case 'end':
				break;
		}


		return flowNode;
	} catch (error) {
		console.log(error);
		process.exit(0);
	}
}

function formatLocaleToTranslateLId(targetLanguage: string): string {
	switch (targetLanguage) {
		case 'en-US':
			targetLanguage = 'en';
			break;
		case 'de-DE':
			targetLanguage = 'de';
			break;
	}

	return targetLanguage;
}

async function microsoftTranslate(text: string, language: string, apiKey: string) {

	try {
		const response = await axios({
			method: 'post',
			url: `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=${language}`,
			headers: {
				'Ocp-Apim-Subscription-Key': apiKey,
				'Content-type': 'application/json',
				'Accept': 'application/json',
				'X-ClientTraceId': uuid.v4().toString()
			},
			data: [
				{
					text
				}
			]
		});

		// Return the translated sentence only
		return response.data[0].translations[0].text;
	} catch (error) {
		console.log(error);
		process.exit(0);
	}
}

async function googleTranslate(text: string, language: string, apiKey) {

	// Creates a client
	const translate = new Translate({
		key: apiKey
	});

	let [translations] = await translate.translate(text, language);
	translations = Array.isArray(translations) ? translations : [translations];

	// Returns the translated sentence only
	return translations[0];
}

const translate = async (text: string, language: string, translator: 'google' | 'microsoft', apiKey: string) => {

	// Format the locale to a valid language id
	language = formatLocaleToTranslateLId(language);

	// Check which translator should be used and translate the current sentence
	switch (translator) {
		case 'google':
			text = await googleTranslate(text, language, apiKey);
			break;
		case 'microsoft':
			text = await microsoftTranslate(text, language, apiKey);
			break;
	}

	// Return the translated text
	return text;
}

export default translateFlowNode;