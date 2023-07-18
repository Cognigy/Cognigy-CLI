/** Node Modules*/
import { Command } from 'commander';
import {
    createKnowledgeStoreCMD,
    indexKnowledgeStoresCMD,
    deleteKnowledgeStoreCMD,
    deleteDocumentCMD,
    ingestCMD,
    deleteAllDocumentsCMD,
    handleSizeCMD,
    IExtractOptions,
    readKnowledgeStoreCMD,
    updateKnowledgeStoreCMD,
    extractCMD
} from '../commands/knowledgeAI';

export const makeKnowledgeAIProgram = () => {
    const knowledgeAI = new Command();

    knowledgeAI
        .name('knowledge-ai')
        .description('CLI to manage data ingestion and removal of the knowledge AI.');

    knowledgeAI
        .addHelpText('after', `
Examples:
    Print more information about a specific command:
    $ knowledge-ai ingest --help

    Create a knowledge store:
    $ knowledge-ai create-store --projectId 643689fb81236ff450744d51 --language en-US --name "General Information" --description "General information about my business"
    
    Ingest a single ".txt" file:
    $ knowledge-ai ingest --projectId 643689fb81236ff450744d51 --language en-US --knowledgeStoreId 12389fb81236ff450744321 --input "~/path/to/my/file.txt"

    Ingest all ".txt" files within a directory:
    $ knowledge-ai ingest --projectId 643689fb81236ff450744d51 --language en-US --knowledgeStoreId 12389fb81236ff450744321 --input "~/path/to/my/directory"

    Delete all paragraphs of a single file:
    $ knowledge-ai delete-document --knowledgeStoreId 12389fb81236ff450744321 --documentUrl "/absolute/path/to/my/file.txt"

    Delete a knowledge store:
    $ knowledge-ai delete-store --knowledgeStoreId 12389fb81236ff450744321`
    );

    knowledgeAI
        .command("create-store")
        .description(`Creates a knowledge store for a project with the specified name and description. Knowledge store names must be unique.`)
        .requiredOption("-p, --projectId <string>", "Project ID")
        .requiredOption("-l, --language <string>", "Language")
        .requiredOption("-n, --name <string>", "Name")
        .requiredOption("-d, --description <string>", "Description")
        .action(async (options) => {
            try {
                await createKnowledgeStoreCMD(
                    options.projectId,
                    options.language,
                    options.name,
                    options.description,
                );
            } catch (e) {
                console.log(e.message);
            }
        });

    knowledgeAI
        .command("index-stores")
        .description(`List all the knowledge stores for a project`)
        .option("-p, --projectId <string>", "Project ID")
        .action(async (options) => {
            try {
                await indexKnowledgeStoresCMD(
                    options.projectId,
                );
            } catch (e) {
                console.log(e.message);
            }
        });

    knowledgeAI
        .command("read-store")
        .description(`Get a store given its store id`)
        .requiredOption("-k, --knowledgeStoreId <string>", "Knowledge Store ID")
        .action(async (options) => {
            try {
                await readKnowledgeStoreCMD(
                    options.knowledgeStoreId,
                );
            } catch (e) {
                console.log(e.message);
            }
        });

    knowledgeAI
        .command("update-store")
        .description(`Get a store given its store id`)
        .requiredOption("-k, --knowledgeStoreId <string>", "Knowledge Store ID.")
        .option("-n --name <string>", "Name of the knowledge store.")
        .option("-d --description <string>", "Description of the knowledge store.")
        .action(async (options) => {
            try {
                await updateKnowledgeStoreCMD(
                    options.knowledgeStoreId,
                    options.name,
                    options.description,
                );
            } catch (e) {
                console.log(e.message);
            }
        });

    knowledgeAI
        .command("ingest")
        .description(`Takes as "--input" a directory or ".txt" file. In case "--input" is a path to a directory, all ".txt" files 
            found within will be ingested one after another. Subfolders will be ignored. For each file the paragraphs are
            expected to be separated by two newline characters. Each paragraph will be ingested into the referenced
            knowledge store of the specified project and language.`)
        .option("-n --name <string>", "Name of the knowledge store for file retrieval")
        .option("-p, --projectId <string>", "Project ID")
        .option("-l, --language <string>", "Language")
        .option("-k, --knowledgeStoreId <string>", "Knowledge Store ID")
        .requiredOption("-i, --input <path>", "Path to file or directory")
        .option("-e, --collectErroredParagraphs", "Path to file or directory", false)
        .option("-v, --verbose", "Print detailed logs", false)
        .action(async (options) => {
            try {
                await ingestCMD(
                    options.projectId,
                    options.language,
                    options.knowledgeStoreId,
                    options.input,
                    options.name,
                    options.collectErroredParagraphs,
                    options.verbose
                );
            } catch (e) {
                console.log(e.message);
            }
        });

    knowledgeAI
        .command("delete-document")
        .description(`Deletes all paragraphs of a previously ingested document from a knowledge store.`)
        .requiredOption("-k, --knowledgeStoreId <string>", "Knowledge Store ID")
        .requiredOption("-d, --documentUrl <string>", "Absolute document URL, i.e. the full path to the file that was ingested.")
        .option("-v, --verbose", "Print detailed logs", false)
        .action(async (options) => {
            try {
                await deleteDocumentCMD(options.knowledgeStoreId, options.documentUrl, options.verbose);
            } catch (e) {
                console.log(e.message);
            }
        });

    knowledgeAI
        .command("delete-store")
        .description(`Deletes a knowledge store and all paragraphs assigned to it.`)
        .requiredOption("-k, --knowledgeStoreId <string>", "Knowledge Store ID")
        .action(async (options) => {
            try {
                await deleteKnowledgeStoreCMD(options.knowledgeStoreId);
            } catch (e) {
                console.log(e.message);
            }
        });

    knowledgeAI
        .command("delete-all")
        .description(`Deletes all paragraphs from all knowledge stores of a project. Also deletes knowledge stores that had paragraphs assigned.`)
        .requiredOption("-p, --projectId <string>", "Project ID")
        .requiredOption("-l, --language <string>", "Language")
        .option("-v, --verbose", "Print detailed logs", false)
        .action(async (options) => {
            try {
                await deleteAllDocumentsCMD(options.projectId, options.language, options.verbose);
            } catch (e) {
                console.log(e.message);
            }
        });

    knowledgeAI
        .command("size")
        .description(`Checks the number of tokens in a file.`)
        .option("-i, --inputFile <string>", "Input File Path")
        .action(async (options: IExtractOptions) => {
            try {
                await handleSizeCMD(options.inputFile);
            } catch (e) {
                console.log(e.message);
            }
        });

    knowledgeAI
        .command("extract <type>")
        .description(`Converts "diffbot" output into text files parsing the output as paragraphs as expected as input for the "ingest" command.`)
        .option("-i, --inputFile <string>", "Input File Path")
        .option("-o, --outputFile <string>", "Output File Path")
        .option("-u --url <string>", "Target URL (for web based extraction)")
        .option("-e, --excludeString <string>", "Resulting paragraphs will be excluded if they contain this string")
        .option("-s, --splitter <string>", "Name of the splitter to use, leave empty for default")
        .option("-cs, --chunkSize <number>", "Chunksize to use, default 2000")
        .option("-co, --chunkOverlap <number>", "Chunk overlap to use, default 200")
        .option("-ap --additionalParameters <string>", "Additional parameters to send to the extractor")
        .option("-fl, --forceLocal", "Forces local processing of files")
        .option("-v, --verbose", "Print detailed logs", false)
        .action(async (type: string, options: IExtractOptions) => {
            try {
                await extractCMD(type, options);
            } catch (e: any) {
                console.log(e.message);
            }
        });
    return knowledgeAI;
}