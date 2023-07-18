import fs from "fs";
import path from "path";
import { ingestFile } from "./ingestFile";
import os from "os";
import cliProgress from "cli-progress";

let indexCreated = false; // flag to track if index has been created

const getFilePathWithSuffix = (filepath: string, suffix: string) => {
	const fileDir = path.dirname(filepath);
	const fileExt = path.extname(filepath);
	const fileName = path.basename(filepath, fileExt);
	const newFileName = `${fileName}_${suffix}${fileExt}`;
	return path.join(fileDir, newFileName);
};

export const handleIngest = async (
	projectId: string,
	language: string,
	knowledgeStoreId: string,
	input: string,
	name?: string,
	shouldCreateFilesForFailedIngestions: boolean = false,
	verbose: boolean = false
) => {
	// Collect errors thrown during "handleFile()"
	let errors: string[] = [];

	if (name) {
		const config = fs.readFileSync(`./knowledgeStore_${name}.json`, "utf-8");
		if (config) {
			try {
				const parsedConfig = JSON.parse(config);
				projectId = parsedConfig.projectReference;
				language = parsedConfig.language;
				knowledgeStoreId = parsedConfig._id;
				console.log(`Successfully read config for knowledge store '${name}' and using it for ingestion...`);
			} catch (err) {}
		} else {
			console.log(`Config file knowledgeStore_${name}.json not found. Aborting...`);
			process.exit(1);
		}

	}

	const stats = fs.statSync(input);
	if (stats.isFile() && path.extname(input) === ".txt") {
		if (verbose) {
			console.log(`Processing file: ${input}`);
		}

		const errorOutput = getFilePathWithSuffix(input, "failedIngestions");
		const returnedErrors = await handleFile(
			projectId,
			language,
			knowledgeStoreId,
			input,
			errorOutput,
			shouldCreateFilesForFailedIngestions,
			verbose
		);
		errors = errors.concat(returnedErrors);
	} else if (stats.isDirectory()) {
		const files = fs.readdirSync(input);
		const numFiles = files.length;
		let index = 0;
		for (const file of files) {
            index += 1;
			const filePath = path.join(input, file);
			const fileStats = fs.statSync(filePath);
			const errorOutput = getFilePathWithSuffix(filePath, "failedIngestions");
            let fileExtension = path.extname(filePath)
            
            if (verbose) {
                console.log(`Processing file ${index} of ${numFiles}: ${filePath}`);
            }

			if (fileStats.isFile() && fileExtension === ".txt") {
				const returnedErrors = await handleFile(
					projectId,
					language,
					knowledgeStoreId,
					filePath,
					errorOutput,
					shouldCreateFilesForFailedIngestions,
					verbose
				);
				errors = errors.concat(returnedErrors);
			} else {
                if (verbose) {
                    if (fileExtension === "") {
                        fileExtension = "directory";
                    }
                    console.log(`File format "${fileExtension}" is not supported`);
                }
            }
		}
	} else {
		throw Error(
			"Input must be a text file or a directory containing text files"
		);
	}

	if (errors.length > 0) {
		console.warn(
			"Some errors were thrown during execution. See the following list."
		);
		for (let error of errors) {
			console.warn("-", error);
		}
	}
};

// Function to handle individual file
export const handleFile = async (
	projectId: string,
	language: string,
	knowledgeStoreId: string,
	filePath: string,
	errorOutput: string,
	shouldCreateFilesForFailedIngestions: boolean,
	verbose: boolean = false
): Promise<string[]> => {
	const fileUrl = path.resolve(filePath);
	const content = fs.readFileSync(filePath, "utf-8");
	const paragraphs = content.split(os.EOL + os.EOL);
	const processed_paragraphs = [];

	const appendToErrorFile = (paragraph: string) => {
		fs.appendFileSync(errorOutput, paragraph + os.EOL + os.EOL, "utf-8");
	};

	const createIfErrorFileNotExists = () => {
		// Check if errorOutput file exists and create it if necessary
		if (!fs.existsSync(errorOutput)) {
			fs.writeFileSync(errorOutput, "", "utf-8");
		}
	};

	const errors = [];

	// Use this type of for loop instead of paragraphs.forEach(...), because forEach() would not forward Errors thrown.
	for (let [index, paragraph] of paragraphs.entries()) {
		// Increase index by one, because in the backend we start counting at 1 and not at 0.
		index += 1;

		paragraph = paragraph.trim();

		if (paragraph === "") {
			continue; // Skips the empty paragraph
		}

		processed_paragraphs.push(paragraph);
	}

	// create new progress bar
	const bar = new cliProgress.SingleBar(
		{
			format: " {bar} | {value}/{total}",
			hideCursor: true,
		},
		cliProgress.Presets.shades_classic
	);

	if (verbose) {
		bar.start(processed_paragraphs.length, 0);
	}

	for (let [index, paragraph] of processed_paragraphs.entries()) {
		// Increase index by one, because in the backend we start counting at 1 and not at 0.
		index += 1;

		try {
			await processParagraph(
				projectId,
				language,
				knowledgeStoreId,
				fileUrl,
				paragraph,
				index
			);
			if (verbose) {
				bar.increment();
			}
		} catch (error: any) {
			errors.push(
				`Failed to process paragraph ${index} in ${fileUrl}. Error: ${error.message}`
			);
			if (shouldCreateFilesForFailedIngestions) {
				createIfErrorFileNotExists();
				appendToErrorFile(paragraph);
			}
		}
	}

	if (verbose) {
		bar.stop();
	}

	return errors;
};

// Ingest the paragraph
export const processParagraph = async (
	projectId: string,
	language: string,
	knowledgeStoreId: string,
	fileUrl: string,
	paragraph: string,
	index: number
) => {
	// if (verbose) {
	// 	console.log(`Processing file: ${fileUrl}, paragraph index: ${index}`);
	// }

	if (!indexCreated) {
		// check if index has already been created
		// await createIndex(projectId, language);
		indexCreated = true; // set flag to true
	}

	await ingestFile(knowledgeStoreId, fileUrl);
};
