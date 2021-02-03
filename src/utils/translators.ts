import chalk = require("chalk");
import { ExecFileOptionsWithStringEncoding } from "child_process";

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

interface ISentence {
	_id: string;
	slots: any[];
	text: string;
	localeReference: string;
	createdAt: string;
	lastChangedBy: string;
	feedbackReport: any
}

export const translateIntentExampleSentence = async (sentence: ISentence , language: string, translator: 'google' | 'microsoft' | 'deepl', apikey: string, fromLanguage?: string) => {

	sentence.text = await translate(sentence.text, language, translator, apikey);
	// Return the translated example sentence
	return sentence;
}

const translateFlowNode = async (flowNode: IFlowNode, targetLanguage: string, translator: 'google' | 'microsoft' | 'deepl', apiKey: string): Promise<IFlowNode> => {
	const { type, config } = flowNode;

	try {
		// Check type of node
		switch (type) {
			case 'optionalQuestion':
				flowNode.config.say = await translateSayNode(config.say, targetLanguage, translator, apiKey);
				break;

			case 'question':
				flowNode.config.say = await translateSayNode(config.say, targetLanguage, translator, apiKey);
				if (flowNode.config.validationMessage) flowNode.config.validationMessage = await translate(flowNode.config.validationMessage, targetLanguage, translator, apiKey);
				if (flowNode.config.datepicker_eventName) flowNode.config.datepicker_eventName = await translate(flowNode.config.datepicker_eventName, targetLanguage, translator, apiKey);
				if (flowNode.config.datepicker_openPickerButtonText) flowNode.config.datepicker_openPickerButtonText = await translate(flowNode.config.datepicker_openPickerButtonText, targetLanguage, translator, apiKey);
				if (flowNode.config.datepicker_cancelButtonText) flowNode.config.datepicker_cancelButtonText = await translate(flowNode.config.datepicker_cancelButtonText, targetLanguage, translator, apiKey);
				if (flowNode.config.datepicker_submitButtonText) flowNode.config.datepicker_submitButtonText = await translate(flowNode.config.datepicker_submitButtonText, targetLanguage, translator, apiKey);
				break;

			case 'say':
				flowNode.config.say = await translateSayNode(config.say, targetLanguage, translator, apiKey);
				break;

			// Skip all other nodes
			default:
				break;
		}
		return flowNode;
	} catch (error) {
		console.log(error);
		process.exit(0);
	}
}

export async function translateSayNode(data, language, translator, apikey) {

	// Check if type is text
	if (data.text) {

		// Translate plain text SAY Node
		for (let sentence of data.text) {
			// Get the index of the current sentence in the list of sentences called 'text'
			let index = data.text.indexOf(sentence);
			// Translate the text
			data.text[index] = await translate(data.text[index], language, translator, apikey);

		}
		// Check if type is buttons
	} 
	
	if (data?._cognigy?._default?._buttons?.buttons) {
		/** Translate fallback message */
		if (data._cognigy._default._buttons.fallbackText) {
			data._cognigy._default._buttons.fallbackText = await translate(data._cognigy._default._buttons.fallbackText, language, translator, apikey);
		}

		// Loop through the buttons
		for (let button of data._cognigy._default._buttons.buttons) {

			// Get the index of the current sentence in the list of sentences called 'text'
			let index = data._cognigy._default._buttons.buttons.indexOf(button);

			// Check type of button
			if (button.type === 'postback') {
				// Translate button title
				data._cognigy._default._buttons.buttons[index].title = await translate(data._cognigy._default._buttons.buttons[index].title, language, translator, apikey);
			}

			// Translate the text of the button message
			data._cognigy._default._buttons.text = await translate(data._cognigy._default._buttons.text, language, translator, apikey);

		}

		/** Translate data */

		// Loop through the buttons
		for (let button of data._data._cognigy._default._buttons.buttons) {

			// Get the index of the current sentence in the list of sentences called 'text'
			let index = data._data._cognigy._default._buttons.buttons.indexOf(button);

			// Check type of button
			if (button.type === 'postback') {
				// Translate button title
				data._data._cognigy._default._buttons.buttons[index].title = await translate(data._data._cognigy._default._buttons.buttons[index].title, language, translator, apikey);

			}

			// Translate the text of the button message
			data._data._cognigy._default._buttons.text = await translate(data._data._cognigy._default._buttons.text, language, translator, apikey);

		}
	} 

	// Check if type is quick replies
	if (data?._cognigy?._default?._quickReplies?.quickReplies) {

		/** Translate message */
		if (data._cognigy._default._quickReplies.fallbackText) {
			data._cognigy._default._quickReplies.fallbackText = await translate(data._cognigy._default._quickReplies.fallbackText, language, translator, apikey);
		}

		// Loop through the quick replies
		for (let quickReply of data._cognigy._default._quickReplies.quickReplies) {

			// Get the index of the current sentence in the list of sentences called 'text'
			let index = data._cognigy._default._quickReplies.quickReplies.indexOf(quickReply);

			// Check type of button
			if (quickReply.contentType === 'postback') {
				// Translate quick reply
				data._cognigy._default._quickReplies.quickReplies[index].title = await translate(data._cognigy._default._quickReplies.quickReplies[index].title, language, translator, apikey);
				data._cognigy._default._quickReplies.quickReplies[index].payload = await translate(data._cognigy._default._quickReplies.quickReplies[index].payload, language, translator, apikey);

			}

			// Translate the text of the quick reply text
			data._cognigy._default._quickReplies.text = await translate(data._cognigy._default._quickReplies.text, language, translator, apikey)

		}

		/** Translate data */

		// Loop through the quick replies
		for (let quickReply of data._data._cognigy._default._quickReplies.quickReplies) {

			// Get the index of the current sentence in the list of sentences called 'text'
			let index = data._data._cognigy._default._quickReplies.quickReplies.indexOf(quickReply);

			// Check type of quick reply
			if (quickReply.contentType === 'postback') {
				// Translate quick reply
				data._data._cognigy._default._quickReplies.quickReplies[index].title = await translate(data._data._cognigy._default._quickReplies.quickReplies[index].title, language, translator, apikey);
				data._data._cognigy._default._quickReplies.quickReplies[index].payload = await translate(data._data._cognigy._default._quickReplies.quickReplies[index].payload, language, translator, apikey);

			}

			// Translate the text of the quick reply text
			data._data._cognigy._default._quickReplies.text = await translate(data._data._cognigy._default._quickReplies.text, language, translator, apikey)

		}
	} 
	
	if (data?._cognigy?._default?._gallery) {
		// Translate Fallback Text
		if (data._cognigy._default._gallery.fallbackText && data._cognigy._default._gallery.fallbackText !== "") {
			data._cognigy._default._gallery.fallbackText = await translate(data._cognigy._default._gallery.fallbackText, language, translator, apikey);
		}

		// Loop through gallery cards
		for (let item of data._cognigy._default._gallery.items) {

			// Translate title & subtitle
			item.title = await translate(item.title, language, translator, apikey);
			item.subtitle = await translate(item.subtitle, language, translator, apikey);


			// Check for buttons and translate them
			if (item.buttons && item.buttons.length > 0) {
				for (let button of item.buttons) {
					// Translate button title & payload
					if (button.type === 'postback') {
						button.title = await translate(button.title, language, translator, apikey);
						button.payload = await translate(button.payload, language, translator, apikey);
					}
				}
			}
		}

		/** Translate data */

		// Translate Fallback Text
		if (data?._data?._cognigy?._default?._gallery?.fallbackText !== "") {
			data._data._cognigy._default._gallery.fallbackText = await translate(data._data._cognigy._default._gallery.fallbackText, language, translator, apikey);

		}

		// Loop through gallery cards
		for (let item of data._data._cognigy._default._gallery.items) {

			// Translate title & subtitle
			item.title = await translate(item.title, language, translator, apikey);
			item.subtitle = await translate(item.subtitle, language, translator, apikey);

			// Check for buttons and translate them
			if (item.buttons && item.buttons.length > 0) {
				for (let button of item.buttons) {
					// Translate button title & payload
					if (button.type === 'postback') {
						button.title = await translate(button.title, language, translator, apikey);
						button.payload = await translate(button.payload, language, translator, apikey);
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
			url: `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=${language}&textType=html`,
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
	try {
		// Creates a client
		const translate = new Translate({
			key: apiKey
		});

		let [translations] = await translate.translate(text, language);
		translations = Array.isArray(translations) ? translations : [translations];

		// Returns the translated sentence only
		return translations[0];
	} catch (err) {
		console.log(`${chalk.red(`error`)}: ${err.message}`);
	}
}

async function deepLTranslate(text: string, language: string, apiKey) {
	try {
		const response = await axios({
			method: 'post',
			url: `https://api.deepl.com/v2/translate?auth_key=${apiKey}&text=${text}&target_lang=${language}`,
			headers: {
				'Accept': '*/*',
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		});

		// Return the translated sentence only
		return response.data.translations[0].text;
	} catch (error) {
		console.log(error);
		process.exit(0);
	}
}

/**
 * Perform the actual translation
 * @param text Text to translate (can be HTML)
 * @param language Language to translate
 * @param translator Translator to use
 * @param apiKey API Key to use
 */
const translate = async (text: string, language: string, translator: 'google' | 'microsoft' | 'deepl', apiKey: string) => {
	if (typeof text !== "string") return text;

	// Format the locale to a valid language id
	language = formatLocaleToTranslateLId(language);

	// format text so CS and snippets won't be translated
	let { text: newText, tokens } = tokenizeText(text);

	try {
		// Check which translator should be used and translate the current sentence
		switch (translator) {
			case 'google':
				newText = await googleTranslate(newText, language, apiKey);
				break;
			case 'microsoft':
				newText = await microsoftTranslate(newText, language, apiKey);
				break;
			case 'deepl':
				newText = await deepLTranslate(newText, language, apiKey);
				break;
		}
	} catch (err) {
		console.log(err.message);
	}

	// Return CognigyScript and Snippets into the text
	text = untokenizeText(tokens, newText);

	// Return the translated text
	return text;
}

/**
 * Replaces CognigyScript and Snippets (Tokens) with a notranslate tag
 * So Translation Engines disregard them
 * 
 * @param text 
 */
const tokenizeText = (text: string): { tokens: string[], text: string } => {
	// check if the text contains Cognigy Snippets (e.g. [[snippet-eyJsYWJlbCI6InRleHQiLCJzY3JpcHQiOiJjaS50ZXh0IiwidHlwZSI6ImlucHV0In0=]])
	const snippetMatches = text.match(/\[\[snippet\-(([a-f0-9]{8}\-[a-f0-9]{4}\-[a-f0-9]{4}\-[a-f0-9]{4}\-[a-f0-9]{12}\-)|([a-fA-F0-9]{24}\-)){0,1}[a-zA-Z0-9+\/]+={0,2}\]\]/g);

	// check if the text contains CognigyScript (e.g. {{ input.intent }})
	const csMatches = text.match(/\{\{(.*?)[\}\)\s]*\}\}/g);

	// if no snippets and no cs, return
	if (!csMatches && !snippetMatches) {
		return {
			tokens: null,
			text
		};
	} else {
		let count = 0;
		let tokens = [];

		// iterate through all found cognigyscript codes and replace with token
		if (csMatches) {
			for(let match of csMatches) {
				tokens.push(match);
				text = text.replace(match, `<i class=notranslate>${count}</i>`);
				count++;
			}
		}

		// iterate through all found snippets and replace with token
		if (snippetMatches) {
			for(let match of snippetMatches) {
				tokens.push(match);
				text = text.replace(match, `<i class=notranslate>${count}</i>`);
				count++;
			}
		}

		return {
			tokens,
			text
		};
	}
}

/**
 * Replaces the tokens with their original CognigyScript or Snippet Code
 * @param tokens Original Tokens
 * @param text Text
 */
const untokenizeText = (tokens: string[], text: string): string => {
	if (!tokens || tokens.length === 0)
		return text;

	let count = 0;

	for (let token of tokens) {
		text = text.replace(`<i class=notranslate>${count}</i>`, token);
		count++;
	}

	return text;
}


export default translateFlowNode;
