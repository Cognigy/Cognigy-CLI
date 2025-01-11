/** Node Modules */
import fs from 'fs';
import path from 'path';

/** Custom Modules */
import CONFIG from '../../utils/config';
import { ingestFile } from './ingestFile';
import cliProgress from 'cli-progress';

/**
 *
 * @param knowledgeStoreId
 * @param input File path or directory path to be ingested
 * @param name
 */
export const handleIngest = async (
  knowledgeStoreId: string,
  input: string,
  name?: string
) => {
  console.clear();
  // create new progress bar
  const bar = new cliProgress.SingleBar(
    {
      format: ' {bar} | {value}/{total}',
      hideCursor: true,
    },
    cliProgress.Presets.shades_classic
  );

  // Collect errors thrown during "handleFile()"
  let errors: string[] = [];

  if (name) {
    const config = fs.readFileSync(
      `${CONFIG.knowledgeAIStoreDir}/knowledgeStore_${name}.json`,
      'utf-8'
    );
    if (config) {
      try {
        const parsedConfig = JSON.parse(config);
        knowledgeStoreId = parsedConfig._id;
        console.log(
          `Successfully read config for knowledge store '${name}' and using it for ingestion...`
        );
      } catch (err) {}
    } else {
      console.log(
        `Config file knowledgeStore_${name}.json not found. Aborting...`
      );
      process.exit(1);
    }
  }

  const stats = fs.statSync(input);
  if (stats.isFile() && path.extname(input) === '.ctxt') {
    console.log(`Processing file: ${input}`);
    bar.start(1, 0);

    await ingestFile(knowledgeStoreId, input);
    bar.increment();
    bar.stop();
  } else if (stats.isDirectory()) {
    let files = fs.readdirSync(input);
    files = files.filter((f) => f.endsWith('.ctxt'));

    const numFiles = files.length;
    let index = 0;
    bar.start(numFiles, 0);
    for (const file of files) {
      index += 1;
      const filePath = path.join(input, file);
      const fileStats = fs.statSync(filePath);
      let fileExtension = path.extname(filePath);

      console.log(`\nProcessing file ${index} of ${numFiles}: ${filePath}`);

      if (fileStats.isFile() && fileExtension === '.ctxt') {
        await ingestFile(knowledgeStoreId, filePath);
        console.clear();
      } else {
        if (fileExtension === '') {
          fileExtension = 'directory';
        }
        console.log(`File format "${fileExtension}" is not supported`);
      }
      bar.increment();
    }
    bar.stop();
    console.log(
      `All ${numFiles} files,\n${JSON.stringify(files, null, 2)}\nfrom directory ${input} have been successfully processed!`
    );
  } else {
    throw Error(
      'Input must be a text file or a directory containing text files'
    );
  }

  if (errors.length > 0) {
    console.warn(
      'Some errors were thrown during execution. See the following list.'
    );
    for (let error of errors) {
      console.warn('-', error);
    }
  }
};
