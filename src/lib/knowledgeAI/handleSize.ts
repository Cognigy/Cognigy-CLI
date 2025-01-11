const { encode } = require('gpt-3-encoder');
import * as fs from 'fs';

export const handleSize = async (inputFile: string) => {
  const content = fs.readFileSync(inputFile, 'utf-8');
  const encoded = encode(content);
  console.log(`Your file ${inputFile} has ${encoded.length} tokens.`);
};
