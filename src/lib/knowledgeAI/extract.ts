/** Node Modules */
import * as fs from "fs";

/** Custom Modules */
import { diffbotExtractor } from './extractionProvider/diffbotExtractor';
import { lsExtractor } from './extractionProvider/lsExtractor';
import { unstructuredExtractor } from './extractionProvider/unstructuredExtractor';

/** Interfaces */
import { IExtractOptions } from './extractionProvider/IExtractorOptions';

/**
 * Write result to file
 * @param outputFilePath
 * @param content
 * @returns
 */
function writeResultsToFile(
	outputFilePath: string,
	content: string
): Promise<void> {
	content = content.replace(/\n\n\n/gi, "\n\n");
	return new Promise((resolve, reject) => {
		fs.writeFile(outputFilePath, content, "utf8", (error) => {
			if (error) {
				reject(error);
			} else {
				resolve();
			}
		});
	});
}

export const extract = async (type: string, options: IExtractOptions) => {

    if (options.additionalParameters) {
        try {
            options.additionalParameters = JSON.parse(options.additionalParameters);
        } catch (err) {
            console.warn("Invalid JSON config passed. Using default parameters.");
        }
    }

    let content;
    switch (type) {
        case 'diffbot': 
            content = await diffbotExtractor(options);
            break;

        case 'pdf':
        case 'text':
        case 'csv':
        case 'epub':
        case 'json':
        case 'jsonl':
        case 'srt':
        case 'md':
        case 'docx':
            if (!options.inputFile) {
                console.error("Missing required parameter --inputFile");
                process.exit(1);
            }

            if (!options.outputFile) {
                console.error("Missing required parameter --outputFile");
                process.exit(1);
            }

            // attempt extraction from unstructured.io APIs
            if (!options.forceLocal) {
                content = await unstructuredExtractor(options);
            }

            // if extraction fails, attempt extraction from langchain
            if (!content) {
                if (!options.forceLocal) {
                    console.warn(`Error when attempting to extract text from ${options.inputFile} via API, falling back to local processing`);
                }
                
                content = await lsExtractor(type, options);
            }
            break;

        case 'other':
            // attempt extraction from unstructured.io APIs
            content = (await unstructuredExtractor(options)) || "";
            break;

        case 'cheerio':
        case 'playwright':
            if (!options.url && !options.inputFile) {
                console.error("Missing required parameter --url");
                process.exit(1);
            }
            content = await lsExtractor(type, options);
            break;
        
        default:
            console.error(`Invalid extraction type '${type}'. Please refer to the documentation.'`);
            process.exit(1);
    }    

    if (content) {
        await writeResultsToFile(options.outputFile, content);
        if (options.verbose) {
            console.log('Paragraphs written to file: ', options.outputFile);
        }
    } else {
        console.error("Content couldn't be extracted, no output file written.")
    }
};