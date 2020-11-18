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

	// console.log(JSON.stringify(flowNode))

	try {
		// Check type of node
		switch (type) {
			case 'say':
				flowNode.config.say = await translateSayNode(config.say, targetLanguage, translator, apiKey);
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

async function translateSayNode(data, language, translator, apikey) {

	// Check if type is text
	if (data.text && data.type === 'text') {

		// Translate plain text SAY Node
		for (let sentence of data.text) {
			// Get the index of the current sentence in the list of sentences called 'text'
			let index = data.text.indexOf(sentence);
			// Translate the text
			data.text[index] = await translate(data.text[index], language, translator, apikey)

		}
		// Check if type is buttons
	} else if (data._cognigy && data._cognigy._default && data._cognigy._default._buttons && data._cognigy._default._buttons.buttons) {

		/** Translate message */

		// Loop through the buttons
		for (let button of data._cognigy._default._buttons.buttons) {

			// Get the index of the current sentence in the list of sentences called 'text'
			let index = data._cognigy._default._buttons.buttons.indexOf(button);

			// Check type of button
			if (button.type === 'postback') {
				// Translate button title
				data._cognigy._default._buttons.buttons[index].title = await translate(data._cognigy._default._buttons.buttons[index].title, language, translator, apikey)
			}

			// Translate the text of the button message
			data._cognigy._default._buttons.text = await translate(data._cognigy._default._buttons.text, language, translator, apikey)

		}

		/** Translate data */

		// Loop through the buttons
		for (let button of data._data._cognigy._default._buttons.buttons) {

			// Get the index of the current sentence in the list of sentences called 'text'
			let index = data._data._cognigy._default._buttons.buttons.indexOf(button);

			// Check type of button
			if (button.type === 'postback') {
				// Translate button title
				data._data._cognigy._default._buttons.buttons[index].title = await translate(data._data._cognigy._default._buttons.buttons[index].title, language, translator, apikey)

			}

			// Translate the text of the button message
			data._data._cognigy._default._buttons.text = await translate(data._data._cognigy._default._buttons.text, language, translator, apikey)

		}
		// Check if type is quick replies
	} else if (data?._cognigy?._default?._quickReplies?.quickReplies) {

		/** Translate message */

		// Loop through the quick replies
		for (let quickReply of data._cognigy._default._quickReplies.quickReplies) {

			// Get the index of the current sentence in the list of sentences called 'text'
			let index = data._cognigy._default._quickReplies.quickReplies.indexOf(quickReply);

			// Check type of button
			if (quickReply.contentType === 'postback') {
				// Translate quick reply
				data._cognigy._default._quickReplies.quickReplies[index].title = await translate(data._cognigy._default._quickReplies.quickReplies[index].title, language, translator, apikey)
				data._cognigy._default._quickReplies.quickReplies[index].payload = await translate(data._cognigy._default._quickReplies.quickReplies[index].payload, language, translator, apikey)

			}

			// Translate the text of the quick reply text
			data._cognigy._default._quickReplies.text = await translate(data._cognigy._default._quickReplies.text, language, apikey, translator)

		}

		/** Translate data */

		// Loop through the quick replies
		for (let quickReply of data._data._cognigy._default._quickReplies.quickReplies) {

			// Get the index of the current sentence in the list of sentences called 'text'
			let index = data._data._cognigy._default._quickReplies.quickReplies.indexOf(quickReply);

			// Check type of quick reply
			if (quickReply.contentType === 'postback') {
				// Translate quick reply
				data._data._cognigy._default._quickReplies.quickReplies[index].title = await translate(data._data._cognigy._default._quickReplies.quickReplies[index].title, language, translator, apikey)
				data._data._cognigy._default._quickReplies.quickReplies[index].payload = await translate(data._data._cognigy._default._quickReplies.quickReplies[index].payload, language, translator, apikey)

			}

			// Translate the text of the quick reply text
			data._data._cognigy._default._quickReplies.text = await translate(data._data._cognigy._default._quickReplies.text, language, translator, apikey)

		}
	} else if (data?._cognigy?._default?._gallery) {

		// Translate Fallback Text
		if (data._cognigy._default._gallery.fallbackText && data._cognigy._default._gallery.fallbackText !== "") {
			data._cognigy._default._gallery.fallbackText = await translate(data._cognigy._default._gallery.fallbackText, language, translator, apikey)
		}

		// Loop through gallery cards
		for (let item of data._cognigy._default._gallery.items) {

			// Translate title & subtitle
			item.title = await translate(item.title, language, translator, apikey)
			item.subtitle = await translate(item.subtitle, language, translator, apikey)


			// Check for buttons and translate them
			if (item.buttons && item.buttons.length > 0) {
				for (let button of item.buttons) {
					// Translate button title & payload
					if (button.type === 'postback') {
						button.title = await translate(button.title, language, translator, apikey)
						button.payload = await translate(button.payload, language, translator, apikey)
					}
				}
			}
		}

		/** Translate data */

		// Translate Fallback Text
		if (data._data._cognigy._default._gallery.fallbackText && data._data._cognigy._default._gallery.fallbackText !== "") {
			data._data._cognigy._default._gallery.fallbackText = await translate(data._data._cognigy._default._gallery.fallbackText, language, translator, apikey)

		}

		// Loop through gallery cards
		for (let item of data._data._cognigy._default._gallery.items) {

			// Translate title & subtitle
			item.title = await translate(item.title, language, translator, apikey)
			item.subtitle = await translate(item.subtitle, language, translator, apikey)

			// Check for buttons and translate them
			if (item.buttons && item.buttons.length > 0) {
				for (let button of item.buttons) {
					// Translate button title & payload
					if (button.type === 'postback') {
						button.title = await translate(button.title, language, translator, apikey)
						button.payload = await translate(button.payload, language, translator, apikey)
					}
				}
			}
		}
	}

	// Return the translated SAY Node
	return data;
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

