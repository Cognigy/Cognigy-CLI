/** Node Modules */
import axios from 'axios';
import * as fs from 'fs';
import FormData from 'form-data';

/** Custom Modules */
import { IExtractOptions } from './IExtractorOptions';
import { splitText } from '../../../utils/textSplitter';

interface IUnstructuredResponseElement {
  element_id: string;
  text: string;
  type: string;
  metadata: {
    page_number: number;
    filename: string;
  };
}

interface IUnstructuredResponse {
  data: IUnstructuredResponseElement[];
}

/**
 * Extract text from a file using the Unstructured API
 * @param fileName The path and name of the file to extract text from
 * @returns
 */
async function postData(
  fileName: string
): Promise<IUnstructuredResponseElement[] | null> {
  const url = 'https://api.unstructured.io/general/v0/general';

  const form = new FormData();
  form.append('files', fs.createReadStream(fileName));
  form.append('strategy', 'fast');

  const config = {
    headers: {
      accept: 'application/json',
      'Content-Type': `multipart/form-data; boundary=${form.getBoundary()}`,
      ...form.getHeaders(),
    },
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  };

  try {
    const response: IUnstructuredResponse = await axios.post(url, form, config);
    return response.data;
  } catch (error: any) {
    console.log(
      `Error when extracting content from ${fileName} via API: ${error.message}`
    );
    return null;
  }
}

/**
 * Clean the data returned from the Unstructured API
 * @param data The data returned from the Unstructured API
 * @returns
 */
async function cleanData(
  data: IUnstructuredResponseElement[],
  options?: IExtractOptions
): Promise<string> {
  let result = '';

  data.forEach((item: IUnstructuredResponseElement) => {
    if (
      item.type === 'NarrativeText' &&
      (!options?.excludeString ||
        !item.text
          .toLowerCase()
          .includes(options?.excludeString?.toLocaleLowerCase()))
    ) {
      result += `${item.text}\n\n`;
    }
  });

  // if splitter, use it, otherwise rely on splits coming from unstructured.io
  if (options?.splitter) {
    result = (await splitText(result, options)).join('\n\n');
  }

  return result;
}

/**
 * Attempts content extraction from the Unstructured API
 */
export const unstructuredExtractor = async (
  options: IExtractOptions
): Promise<string | null> => {
  const { inputFile } = options;
  const data = await postData(inputFile);
  if (data) {
    const text = await cleanData(data, options);
    return text;
  } else {
    // we return null to allow fallback to local processing (e.g. via langchain)
    return null;
  }
};
