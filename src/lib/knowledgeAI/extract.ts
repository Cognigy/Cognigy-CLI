/** Node Modules */
import * as fs from 'fs';
import * as os from 'os';
import { Spinner } from 'cli-spinner';

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
  content = content.replace(/\n\n\n/gi, '\n\n');

  return new Promise((resolve, reject) => {
    fs.writeFile(outputFilePath, content, 'utf8', (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

export const extract = async (type: string, options: IExtractOptions) => {
  if (type === 'ctxt') {
    throw new Error('Can not extract from ctxt to ctxt!');
  }

  const spinner = new Spinner(`Extracting chunks into file... %s`);
  spinner.setSpinnerString('|/-\\');

  if (options.additionalParameters) {
    try {
      options.additionalParameters = JSON.parse(options.additionalParameters);
    } catch (err) {
      console.warn('Invalid JSON config passed. Using default parameters.');
    }
  }

  spinner.start();
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
        spinner.stop();
        console.error('Missing required parameter --inputFile');
        process.exit(1);
      }

      if (!options.outputFile) {
        spinner.stop();
        console.error('Missing required parameter --outputFile');
        process.exit(1);
      }

      // attempt extraction from unstructured.io APIs
      if (!options.forceLocal) {
        content = await unstructuredExtractor(options);
      }

      // if extraction fails, attempt extraction from langchain
      if (!content) {
        if (!options.forceLocal) {
          console.warn(
            `Error when attempting to extract text from ${options.inputFile} via API, falling back to local processing`
          );
        }

        content = await lsExtractor(type, options);
      }
      break;

    case 'other':
      // attempt extraction from unstructured.io APIs
      content = (await unstructuredExtractor(options)) || '';
      break;

    case 'cheerio':
    case 'playwright':
      if (!options.url && !options.inputFile) {
        spinner.stop();
        console.error('Missing required parameter --url');
        process.exit(1);
      }
      content = await lsExtractor(type, options);
      break;

    default:
      spinner.stop();
      console.error(
        `Invalid extraction type '${type}'. Please refer to the documentation.'`
      );
      process.exit(1);
  }

  spinner.stop();
  if (content) {
    // prepend ctxt version number
    const cContent = '`version: 1`\n\n' + content;

    let outputFilePath = options.outputFile;
    // make sure that whatever the user passes in, we always write a .ctxt file
    if (outputFilePath.split('.').pop() !== 'ctxt') {
      outputFilePath = outputFilePath + '.ctxt';
    }

    await writeResultsToFile(outputFilePath, cContent);
    if (options.verbose) {
      console.log('Paragraphs written to file: ', outputFilePath);
    }
  } else {
    console.error("Content couldn't be extracted, no output file written.");
  }
};
