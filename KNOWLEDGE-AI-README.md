# CognigyAI KnowledgeAI Introduction

This tool is used to manage data for the knowledge search feature. It can be used to create and delete knowledge stores as well as ingest data into and delete data from knowledge stores.

## Usage

### Background

This section aims to give you a brief idea of the underlying data model and how to make use of it in your Cognigy.AI project.

In the backend we use the term `knowledgeAI store` to refer to an entity `KnowledgeAI source` which is used to reference to `documents` stored in your project. Each knowledgeAI store can reference one or multiple sources and can be used as a higher level element to order your ingested documents in your project. Each project can have one or multiple knowledgeAI stores.

The term `KnowledgeAI source` references the actual file which contains one or more `chunks`. Each chunk within a document will be ingested as a separate object into the database, but the document's URL will be used as a reference in a knowledge store.

Currently we only support ingesting plain text `.txt` files, where the paragraphs are separated by a blank line as in the following example:

```
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Aenean mi nulla, fermentum id finibus nec, lacinia nec ipsum. Nullam rhoncus augue in magna vulputate, ac porttitor justo posuere. Integer at risus ut libero scelerisque vehicula a eget sapien. Integer feugiat nulla leo, a elementum arcu consequat at. In hac habitasse platea dictumst. Ut ut sem condimentum, tempus enim vel, maximus est. Suspendisse commodo interdum ullamcorper. In pulvinar quam ut elementum tempus. Maecenas feugiat risus ac magna tincidunt maximus. Ut vestibulum congue elit ac finibus. Vivamus aliquet auctor risus, vel euismod felis pulvinar sit amet. Cras nec molestie enim, in ultricies justo. Integer a pretium dui. Cras in bibendum velit, a laoreet metus.

Vestibulum orci enim, rutrum nec quam in, iaculis hendrerit eros. Maecenas ultrices, felis at luctus fringilla, elit risus auctor erat, sit amet posuere nunc augue sed elit. Nam tempus ipsum magna, et semper ipsum rhoncus condimentum. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Aliquam feugiat vehicula magna. Praesent magna mi, lobortis et dolor mattis, tempus malesuada lacus. Nam ut eros vitae metus iaculis tristique.
```

### How to ingest documents

To ingest documents into your project, you have to follow these steps for each project where you want to use knowledge search:

1. Create a knowledge store that is bound to your project:

   ```bash
   cognigy knowledge-ai create source --projectId <projectId> --language <languageCode> --name <nameOfYourKnowledgeStore> --description <descriptionOfYourKnowledgeStore>
   ```

   To easily access your projectId, create a new agent and navigate to the dashboard. Copy the first id from the URL you see in your browser. In the following example it is encapsulated in star characters:

   > <https://dev.cognigy.ai/agent/**64467681d8170fe52ead079d**/42467681d8170f859aad079f>

   You will see that the command succeeds when a knowledge store object is printed to the terminal.

   This command will write a file `./knowledgeStore_<nameOfYourKnowledgeStore>.json`. You can use it for ingestion or as a reference for the IDs.

2. Ingest your document or a whole directory containing documents:

   ```bash
    cognigy knowledge-ai ingest --projectId <projectId> --language <languageCode> --knowledgeStoreId 64467681d8170fe52ead079d --input <pathToFileOrDirectory>
   ```

   where you have to replace the value of `--knowledgeStoreId` with the `_id` field returned by the previous command. As `--input` you can give a path pointing to a single `.txt` file or to a directory. In the latter case, the CLI tool ingests each and every `.txt` file from that directory. Currently, it does not read files located within nested sub-directories.

   Alternatively you can use the written `./knowledgeStore_<nameOfYourKnowledgeStore>.json` file by specifying it in the command. You then no longer have to provide the projectId, language and knowledgeStoreId parameters.

   ```bash
    cognigy knowledge-ai ingest --name <nameOfYourKnowledgeStore> --input <pathToFileOrDirectory>
   ```

For further instructions on how to use the specific and other commands, see the help printout at `cognigy knowledge-ai --help`.

### How to extract text from various sources

> We implement the [Langchain Document Loaders](https://js.langchain.com/docs/modules/indexes/document_loaders/) and [Text Splitters](https://js.langchain.com/docs/modules/indexes/text_splitters/). For more information, visit the Langchain JS website.

You can use the `extract` command to extract texts from various document types. Afterwards this text can be ingested using the above described method.

The syntax for the command is

```
cognigy knowledge-ai extract <type> -i path_to_input_file -o path_to_output_file
```

| Option                                | Description                                                                                                        |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `-i, --inputFile <string>`            | Input File Path                                                                                                    |
| `-o, --outputFile <string>`           | Output File Path                                                                                                   |
| `-u --url <string>`                   | Target URL (for cheerio & playwright extraction)                                                                   |
| `-e, --excludeString <string>`        | Excludes paragraphs containing this string                                                                         |
| `-s, --splitter <string>`             | Splitter to use, leave empty for default (see below)                                                               |
| `-cs, --chunkSize <number>`           | Chunk size, default 2000                                                                                           |
| `-co, --chunkOverlap <number>`        | Chunk overlap, default 200                                                                                         |
| `-ap --additionalParameters <string>` | Additional parameters for the extractor                                                                            |
| `-fl --forceLocal`                    | Skips the API call to the extraction service and forces local processing of files. Will not work with type `other` |

The following types are available:

| Type         | Description                                         | Default Splitter               |
| ------------ | --------------------------------------------------- | ------------------------------ |
| `text`       | Plain text                                          | RecursiveCharacterTextSplitter |
| `pdf`        | Portable Document Format                            | RecursiveCharacterTextSplitter |
| `docx`       | Microsoft Word Document                             | RecursiveCharacterTextSplitter |
| `csv`        | Comma Separated Values                              | RecursiveCharacterTextSplitter |
| `json`       | JavaScript Object Notation                          | RecursiveCharacterTextSplitter |
| `jsonl`      | JavaScript Object Notation Lines                    | RecursiveCharacterTextSplitter |
| `epub`       | Electronic Publication                              | RecursiveCharacterTextSplitter |
| `srt`        | SubRip Subtitle Format                              | RecursiveCharacterTextSplitter |
| `md`         | Markdown                                            | MarkdownSplitter               |
| `cheerio`    | Simple web-based content extraction                 | RecursiveCharacterTextSplitter |
| `playwright` | Web-based content extraction via browser simulation | RecursiveCharacterTextSplitter |
| `other`      | Any other file type                                 | RecursiveCharacterTextSplitter |

The `other` type can be used for virtually any file type that is not explicitly supported. We will do our best to extract the content.

Each extractor can _optionally_ be called with their own splitter defined by using the `-s <splitter_name>` option.

| Splitter                       | Description                                                                                                                                                            |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CharacterTextSplitter          | Splits by new line `\n` characters                                                                                                                                     |
| MarkdownTextSplitter           | Splits your content into documents based on the Markdown headers                                                                                                       |
| RecursiveCharacterTextSplitter | Split documents recursively by different characters - starting with `\n\n`, then `\n`, then spaces                                                                     |
| TokenTextSplitter              | Splits a raw text string by first converting the text into BPE tokens, then split these tokens into chunks and convert the tokens within a single chunk back into text |

Additional parameters applicable to each type can be checked in the [Langchain Document Loader Documentation](https://js.langchain.com/docs/modules/indexes/document_loaders/).

### Checking the token size of a source document

You can check the token size of a given document using the `size` command.

```
cognigy knowledge-ai size -i path_to_input_file
```

### Limitations

Currently, the number of tokens allowed for each paragraph is limited to `2048`. You may change this value by modifying the environmental variable `MAX_NUMBER_OF_TOKENS`.
