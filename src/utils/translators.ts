// Imports the Google Cloud client library
const { Translate } = require('@google-cloud/translate').v2;
const axios = require('axios');
const uuid = require('uuid');

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
		throw new Error(error.message);
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

export default translate;