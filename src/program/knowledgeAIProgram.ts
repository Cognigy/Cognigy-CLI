/** Node Modules*/
import { Command } from 'commander';
import {
    ingestCMD,
    handleSizeCMD,
    IExtractOptions,
    updateKnowledgeStoreCMD,
    extractCMD,
    createKnowledgeAIResourceCMD,
    deleteKnowledgeAIResourceCMD,
    indexKnowledgeAIResourcesCMD,
    readKnowledgeAIResourceCMD
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
    $ cognigy knowledge-ai ingest --help

    Ingest a single ".txt" file:
    $ cognigy knowledge-ai ingest --projectId 643689fb81236ff450744d51 --language en-US --knowledgeStoreId 12389fb81236ff450744321 --input "~/path/to/my/file.txt"

    Ingest all ".txt" files within a directory:
    $ cognigy knowledge-ai ingest --projectId 643689fb81236ff450744d51 --language en-US --knowledgeStoreId 12389fb81236ff450744321 --input "~/path/to/my/directory"

    Delete all paragraphs of a single file:
    $ cognigy knowledge-ai delete-document --knowledgeStoreId 12389fb81236ff450744321 --documentUrl "/absolute/path/to/my/file.txt"

    Delete a knowledge store:
    $ cognigy knowledge-ai delete-store --knowledgeStoreId 12389fb81236ff450744321`
        );

    knowledgeAI
        .command("create <resourceType> <resourceName> [resourceDescription]")
        .description(`Creates knowledgeAI resources type [store, source] for a project with the specified name and description. Names must be unique.`)
        .option("-p, --projectId <string>", "Project ID")
        .option("-k, --knowledgeStoreId <string>", "Knowledge Store ID")
        .option("-l, --language <string>", "Language")
        .option("-u, --url <string>", "Url")
        .option("-t, --type <string>", "Source type e.g. manual, website")
        .action(async (resourceType, resourceName, resourceDescription = 'Cognigy.AI CLI', options) => {
            try {
                await createKnowledgeAIResourceCMD({
                    resourceType,
                    name: resourceName,
                    description: resourceDescription,
                    projectId: options.projectId,
                    language: options.language,
                    knowledgeStoreId: options.knowledgeStoreId,
                    type: options.type,
                    url: options.url
                });
            } catch (e) {
                console.log(e.message);
            }
        })
        .on('--help', () => {
            console.log(`
Examples:
    Create a knowledge store:
    $ cognigy knowledge-ai create store --projectId 643689fb81236ff450744d51 --language en-US --name "General Information" --description "General information about my business"
    
    Create a knowledgeAI source:
    $ cognigy knowledge-ai create source test-cli-source -k 64b66622b8641100718bcf06 -t manual`
            )
        });

    knowledgeAI
        .command("delete <resourceType>")
        .description(`Deletes knowledgeAI resource type [store, source].`)
        .option("-s, --sourceId <string>", "Source ID")
        .option("-k, --knowledgeStoreId <string>", "Knowledge Store ID")
        .action(async (resourceType, options) => {
            try {
                await deleteKnowledgeAIResourceCMD({
                    resourceType,
                    knowledgeStoreId: options.knowledgeStoreId,
                    sourceId: options.sourceId
                });
            } catch (e) {
                console.log(e.message);
            }
        })
        .on('--help', () => {
            console.log(`
Examples:
    Delte a knowledge store:
    $ cognigy knowledge-ai delete store --knowledgeStoreId 643689fb81236ff450744d51"
    Delte a knowledge source:
    $ cognigy knowledge-ai delete source --knowledgeStoreId 643689fb81236ff450744d51 --sourceId 643689fb81236ff450744d52`
            )
        });

    knowledgeAI
        .command("index <resourceType>")
        .description(`List all the knowledge stores for a project.`)
        .option("-p, --projectId <string>", "Project ID")
        .option("-k, --knowledgeStoreId <string>", "Knowledge Store ID")
        .action(async (resourceType, options) => {
            try {
                await indexKnowledgeAIResourcesCMD({
                    resourceType,
                    knowledgeStoreId: options.knowledgeStoreId,
                    projectId: options.projectId
                });
            } catch (e) {
                console.log(e.message);
            }
        })
        .on('--help', () => {
            console.log(`
Examples:
    Index a knowledge store:
    $ cognigy knowledge-ai index store --projectId 643689fb81236ff450744d51"
    Index a knowledge source:
    $ cognigy knowledge-ai index source --knowledgeStoreId 643689fb81236ff450744d51`
            )
        });

    knowledgeAI
        .command("read <resourceType>")
        .description(`Get a knowledgeAI store/source.`)
        .option("-s, --sourceId <string>", "Source ID")
        .option("-k, --knowledgeStoreId <string>", "Knowledge Store ID")
        .action(async (resourceType, options) => {
            try {
                await readKnowledgeAIResourceCMD({
                    resourceType,
                    knowledgeStoreId: options.knowledgeStoreId,
                    sourceId: options.sourceId
                });
            } catch (e) {
                console.log(e.message);
            }
        })
        .on('--help', () => {
            console.log(`
Examples:
    Read a knowledge store:
    $ cognigy knowledge-ai read store --sourceId 643689fb81236ff450744d51"
    Read a knowledge source:
    $ cognigy knowledge-ai read source --knowledgeStoreId 643689fb81236ff450744d51`
            )
        });

    knowledgeAI
        .command("ingest")
        .description(`Takes as "--input" a directory or ".txt" file. In case "--input" is a path to a directory, all ".txt" files 
            found within will be ingested one after another. Subfolders will be ignored. For each file the paragraphs are
            expected to be separated by two newline characters. Each paragraph will be ingested into the referenced
            knowledge store of the specified project and language.`)
        .option("-n --name <string>", "Name of the knowledge store for file retrieval")
        .option("-k, --knowledgeStoreId <string>", "Knowledge Store ID")
        .requiredOption("-i, --input <path>", "Path to file or directory")
        .action(async (options) => {
            try {
                await ingestCMD(
                    options.knowledgeStoreId,
                    options.input,
                    options.name,
                );
            } catch (e) {
                console.log(e.message);
            }
        })
        .on('--help', () => {
            console.log(`
Examples:
    Ingest a File:
    $ cognigy knowledge-ai ingest --knowledgeStoreId 643689fb81236ff450744d51 -i /home/Downloads/file.txt
    Ingest all files in a directory:
    $ cognigy knowledge-ai ingest  --knowledgeStoreId 643689fb81236ff450744d51 -i /home/Downloads`
            )
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