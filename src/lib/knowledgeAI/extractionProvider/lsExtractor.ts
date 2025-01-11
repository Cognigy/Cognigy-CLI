/** Node Modules */
const { convert } = require('html-to-text');
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { DocxLoader } from 'langchain/document_loaders/fs/docx';
import { CSVLoader } from 'langchain/document_loaders/fs/csv';
import {
  JSONLoader,
  JSONLinesLoader,
} from 'langchain/document_loaders/fs/json';
import { EPubLoader } from 'langchain/document_loaders/fs/epub';
import { SRTLoader } from 'langchain/document_loaders/fs/srt';
import { CheerioWebBaseLoader } from 'langchain/document_loaders/web/cheerio';
import { PlaywrightWebBaseLoader } from 'langchain/document_loaders/web/playwright';

/** Custom Modules */
import { splitDocs } from '../../../utils/textSplitter';
import { IExtractOptions } from './IExtractorOptions';

type LSDocumentLoaderTypes =
  | 'text'
  | 'pdf'
  | 'docx'
  | 'csv'
  | 'json'
  | 'jsonl'
  | 'epub'
  | 'srt'
  | 'md'
  | 'cheerio'
  | 'playwright';

const DefaultSplitters = {
  text: 'RecursiveCharacterTextSplitter',
  pdf: 'RecursiveCharacterTextSplitter',
  docx: 'RecursiveCharacterTextSplitter',
  csv: 'RecursiveCharacterTextSplitter',
  json: 'RecursiveCharacterTextSplitter',
  jsonl: 'RecursiveCharacterTextSplitter',
  epub: 'RecursiveCharacterTextSplitter',
  srt: 'RecursiveCharacterTextSplitter',
  cheerio: 'RecursiveCharacterTextSplitter',
  playwright: 'RecursiveCharacterTextSplitter',
  md: 'MarkdownSplitter',
};

export const lsExtractor = async (
  type: LSDocumentLoaderTypes,
  options: IExtractOptions
) => {
  let documentLoader;
  switch (type) {
    case 'text':
      documentLoader = new TextLoader(options.inputFile);
      break;

    case 'pdf':
      // possible config: { splitPage: true }
      // https://js.langchain.com/docs/modules/indexes/document_loaders/examples/file_loaders/pdf
      documentLoader = new PDFLoader(
        options.inputFile,
        options.additionalParameters || { splitPages: false }
      );
      break;

    case 'docx':
      // https://js.langchain.com/docs/modules/indexes/document_loaders/examples/file_loaders/docx
      documentLoader = new DocxLoader(options.inputFile);
      break;

    case 'csv':
      // possible config: columnName
      // https://js.langchain.com/docs/modules/indexes/document_loaders/examples/file_loaders/csv#usage-extracting-a-single-column
      documentLoader = new CSVLoader(
        options.inputFile,
        options.additionalParameters
      );
      break;

    case 'epub':
      // possible config: { splitChapters: false }
      // https://js.langchain.com/docs/modules/indexes/document_loaders/examples/file_loaders/epub
      documentLoader = new EPubLoader(
        options.inputFile,
        options.additionalParameters || { splitChapters: true }
      );
      break;

    case 'json':
      // possible config: pointer
      // https://js.langchain.com/docs/modules/indexes/document_loaders/examples/file_loaders/json#using-json-pointer-example
      documentLoader = new JSONLoader(
        options.inputFile,
        options.additionalParameters
      );
      break;

    case 'jsonl':
      // possible config: pointer
      // https://js.langchain.com/docs/modules/indexes/document_loaders/examples/file_loaders/jsonlines
      documentLoader = new JSONLinesLoader(
        options.inputFile,
        options.additionalParameters
      );
      break;

    case 'md':
      documentLoader = new TextLoader(options.inputFile);
      break;

    case 'srt':
      documentLoader = new SRTLoader(options.inputFile);
      break;

    case 'cheerio':
      // possible config: { selector: "p.athing" }
      // https://js.langchain.com/docs/modules/indexes/document_loaders/examples/web_loaders/web_cheerio#usage-with-a-custom-selector
      if (options.url) {
        documentLoader = new CheerioWebBaseLoader(
          options.url,
          options.additionalParameters
        );
      } else {
        // needed for local html retrieval
        documentLoader = new TextLoader(options.inputFile);
      }
      break;

    case 'playwright':
      // https://js.langchain.com/docs/modules/indexes/document_loaders/examples/web_loaders/web_playwright
      if (options.url) {
        documentLoader = new PlaywrightWebBaseLoader(
          options.url,
          options.additionalParameters
        );
      } else {
        // needed for local html retrieval
        documentLoader = new TextLoader(options.inputFile);
      }
      break;

    default:
      documentLoader = new TextLoader(options.inputFile);
  }

  // load and extract document
  const docs = await documentLoader.load();

  docs.forEach((doc) => {
    // if document is html, convert to clean text
    if (type === 'playwright' || type === 'cheerio') {
      doc.pageContent = convert(
        doc.pageContent,
        options.additionalParameters || {
          wordwrap: false,
          ignoreHref: true,
          preserveNewlines: true,
          uppercaseHeadings: false,
          singleNewLineParagraphs: true,
          selectors: [
            { selector: 'img', format: 'skip' },
            {
              selector: 'p',
              options: { leadingLineBreaks: 0, trailingLineBreaks: 1 },
            },
            {
              selector: 'pre',
              options: { leadingLineBreaks: 0, trailingLineBreaks: 1 },
            },
          ],
        }
      );
    }

    doc.pageContent = doc?.pageContent
      ?.replace(/(\s){2,}/g, ' ') // replace multiple spaces with single space
      .replace(/\r/g, '') // replace carriage return
      .replace(/\t/g, '') // replace tabs
      .replace(/\\n/g, '\n') // replace escaped newlines
      .replace(/\\t/g, '\t') // replace escaped tabs
      .replace(/(\r\n|\r|\n|\n |\n  |\n   | \n|  \n|   \n){2,}/g, '\n'); // replace multiple newlines with single newline
  });

  // split document into paragraphs according to specified or default splitter
  const splitDocuments = (
    await splitDocs(
      docs,
      options,
      DefaultSplitters[type] || 'RecursiveCharacterTextSplitter'
    )
  ).map((doc) => doc.pageContent);

  // join the paragraphs into the format we want
  const textParagraphs = splitDocuments.join('\n\n');

  return textParagraphs;
};
