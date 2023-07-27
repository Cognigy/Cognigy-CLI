/** Custom Modules */
import * as splitters from "langchain/text_splitter";

/** Interfaces */
import { IExtractOptions } from "../lib/knowledgeAI/extractionProvider/IExtractorOptions";

export async function splitDocs(
	document: any,
	options: IExtractOptions,
	defaultSplitter?: string
) {
	let splitter;

	const splitterToUse = options.splitter || defaultSplitter;
	
	/**
	 * Chunk size in No. of tokens (https://js.langchain.com/docs/modules/indexes/text_splitters/)
	 * 
	 * Why chunk size is subtracted by 1000, here?
	 * 
	 * With the limit set to say 2000, langchain still creates chunks that are larger than 2000 characters (issues on their end).
	 * This results in errors from service-resources.
	 * This was the case even when decreasing the limit to 1800, does not work and finally decided to make it margined by 1000, so that there is a large enough margin.
	 */
	const chunkMaxSize = (options.chunkSize || 2000) - 1000;
	const chunkSize = chunkMaxSize > 0 ? chunkMaxSize : 1000;

	// We check if chunkOverlap was defined, because when chunkOverlap is 0, we do not want to default to 200.
	const chunkOverlap = 0;

	switch (splitterToUse) {
		case "CharacterTextSplitter":
			splitter = new splitters.CharacterTextSplitter({
				chunkSize,
				chunkOverlap,
			});
			break;

		case "MarkdownTextSplitter":
			splitter = new splitters.MarkdownTextSplitter({
				chunkSize,
				chunkOverlap,
			});
			break;

		case "TokenTextSplitter":
			splitter = new splitters.TokenTextSplitter({
				chunkSize,
				chunkOverlap,
			});
			break;

		case "RecursiveCharacterTextSplitter":
			splitter = new splitters.RecursiveCharacterTextSplitter({
				chunkSize,
				chunkOverlap,
			});
			break;

		default:
			splitter = new splitters.RecursiveCharacterTextSplitter({
				chunkSize,
				chunkOverlap,
			});
	}

	const splitParagraphs = await splitter.splitDocuments(document);

	return splitParagraphs.filter((paragraph) => !options.excludeString || !paragraph.pageContent.includes(options.excludeString));
}

export async function splitText(
	text: string,
	options: IExtractOptions,
	defaultSplitter?: string
): Promise<string[]> {
	let splitter;

	const splitterToUse = options.splitter || defaultSplitter;

	const chunkSize = options.chunkSize || 2000;

	// We check if chunkOverlap was defined, because when chunkOverlap is 0, we do not want to default to 200.
	const chunkOverlap =
		typeof options.chunkOverlap !== "undefined" ? options.chunkOverlap : 200;

	switch (splitterToUse) {
		case "CharacterTextSplitter":
			splitter = new splitters.CharacterTextSplitter({
				chunkSize,
				chunkOverlap,
			});
			break;

		case "MarkdownTextSplitter":
			splitter = new splitters.MarkdownTextSplitter({
				chunkSize,
				chunkOverlap,
			});
			break;

		case "TokenTextSplitter":
			splitter = new splitters.TokenTextSplitter({
				chunkSize,
				chunkOverlap,
			});
			break;

		case "RecursiveCharacterTextSplitter":
			splitter = new splitters.RecursiveCharacterTextSplitter({
				chunkSize,
				chunkOverlap,
			});
			break;

		default:
			splitter = new splitters.RecursiveCharacterTextSplitter({
				chunkSize,
				chunkOverlap,
			});
	}

	const splitParagraphs = await splitter.splitText(text);

	return splitParagraphs.filter((paragraph) => !options.excludeString || !paragraph.includes(options.excludeString));
}
