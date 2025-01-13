import * as fs from 'fs';
import { splitParagraphsByTokenLength } from '../../../utils/paragraphSplitter';

export interface IDiffbotExtractorParams {
  inputFile: string;
  outputFile: string;
  excludeString?: string;
}

interface DiffbotPage {
  diffbotUri: string;
  siteName: string;
  pageUrl: string;
  type: 'article' | 'faq';
  title: string;
  docId: number;
  fromSeedUrl: string;
  seedUrlHash32: number;
  parentUrlDocId: number;
  gburl: string;
  lastCrawlTimeUTC: number;
  timestamp: string;
}

interface DiffbotArticlePage extends DiffbotPage {
  breadcrumb: Array<{ link: string; name: string }>;
  humanLanguage: string;
  icon: string;
  html: string;
  text: string;
}

interface DiffbotFAQPage extends DiffbotPage {
  faqs: Array<{
    q: string;
    a: string;
  }>;
}

/**
 * Read JSON array from file
 * @param filePath The path of the file to read
 * @returns
 */
function readJsonArrayFromFile(filePath: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(JSON.parse(data));
      }
    });
  });
}

/**
 * Extracts Diffbot Article type pages from a JSON array
 * @param jsonArray
 * @param excludeString We will skip extraction if article contains this string
 * @returns
 */
function extractArticles(
  jsonArray: DiffbotArticlePage[],
  excludeString?: string
): string {
  let result = '';
  jsonArray.forEach((article) => {
    if (article.text) {
      const paragraphs = splitParagraphsByTokenLength(
        article.title,
        article.text,
        `[url: ${article.pageUrl}]`
      );

      paragraphs.forEach((paragraph, index) => {
        result +=
          !excludeString || (excludeString && paragraph.includes(excludeString))
            ? paragraph + '\n'
            : '';

        if (index !== jsonArray.length - 1) {
          result += '\n';
        }
      });
    }
  });
  return result;
}

/**
 * Extracts Diffbot FAQ type pages from a JSON array
 * @param jsonArray
 * @param excludeString We will skip extraction if article contains this string
 * @returns
 */
function extractFAQs(
  jsonArray: DiffbotFAQPage[],
  excludeString?: string
): string {
  let result = '';
  jsonArray.forEach((faqPage, index) => {
    try {
      const faqs = faqPage.faqs;
      faqs.forEach((faq: any) => {
        result +=
          faq.q &&
          faq.a &&
          (!excludeString ||
            (excludeString &&
              !faq.q.includes(excludeString) &&
              !faq.a.includes(excludeString)))
            ? `${faq.q}\n${faq.a}\n[url: ${faqPage.pageUrl}]\n`
            : '';

        if (index !== jsonArray.length - 1) {
          result += '\n';
        }
      });
    } catch (err) {}
  });
  return result;
}

export const diffbotExtractor = async (config: IDiffbotExtractorParams) => {
  if (!config.inputFile || !config.outputFile) {
    console.error('input (-i) and output file (-o) parameters are required');
    process.exit(1);
  }

  const jsonArray = await readJsonArrayFromFile(config.inputFile);

  let output;
  if (jsonArray[0].faqs) {
    output = extractFAQs(jsonArray, config.excludeString);
  } else {
    output = extractArticles(jsonArray, config.excludeString);
  }

  return output;
};
