# Cognigy Command Line Interface (CLI)

Cognigy CLI offers a series of tools and functionalities in order to interact with your Cognigy.AI virtual agent projects from the command line.

**The CLI can only create Snapshots and Locales right now - no other resources. It is meant for changing already existing resources and manipulating their state.**

Currently supported resources (`<resourceType>`):

- Flows (clone, restore, push, pull, diff, train)
- Lexicons (clone, restore, push, pull, diff)
- Endpoints (clone, restore, push, pull, diff)
- Snapshots (create)
- Extensions (pull)

For Endpoints, Transformers will be separately stores as TypeScript files

## Installation

### Install globally
 
We recommend to install the Cognigy.AI CLI globally to use wherever you like. In order to so, perform the following step.

`npm install -g @cognigy/cognigy-cli`

### Use locally

Alternatively you can use a local copy by performing the following steps:

1. Clone the repo
2. Run `npm ci`
3. Run `npm run build`
4. Run `node build/cognigy init`
5. (optional) Run `npm link` to enable running `cognigy` globally

### Proxy Configuration

The Cognigy CLI will respect the HTTP_PROXY/http_proxy and HTTPS_PROXY/https_proxy and NO_PROXY/no_proxy environment variables.

If you're behind a proxy, you might need to configure NPM separately to use it. You can do that using the commands below.

```
npm config set proxy http://usr:pwd@proxy.company.com:8080
npm config set https-proxy http://usr:pwd@proxy.company.com:8080
```

## Configuration

Configuration can be provided either as environment variables or inside a config.json file. The config.json can be created by executing `cognigy init`.

The Cognigy.AI CLI needs the following configuration:

| Key      | Description                                          | Environment Var |
| -------- | ---------------------------------------------------- | --------------- |
| baseUrl  | The base URL of your Cognigy.AI environment API      | CAI_BASEURL     |
| apiKey   | The Cognigy.AI API Key to use                        | CAI_APIKEY      |
| agent    | The ID of your agent project                         | CAI_AGENT       |
| agentDir | The folder where you want to store the agent locally | CAI_AGENTDIR    |
| playbookTimeoutSeconds | Timeout for checking playbook runs | CAI_PLAYBOOK_TIMEOUT_SECONDS |

Both environment configuration and file-based configuration can be used together. Environment configuration takes priority.

## Commands

### General Commands

#### Help

To get help on any command, use the `-h` flag.

`cognigy -h` or `cognigy <command> -h`

#### Forcing configuration files

By default the CLI will use the ./config.json configuration file. 
You can force the use of another configuration file by using the `-c` flag.

`cognigy <command> -c ./config2.json` or `cognigy <command> --config ./config2.json`

#### Forcing execution without warnings

By default the CLI will reconfirm if data is overwritten locally or on Cognigy.AI.
You can force these checks to be skipped with the `-y` flag.

Example: `cognigy clone -y` or `cognigy clone --forceYes`

### Command: init

`cognigy init`

Initializes a new Cognigy.AI CLI project

### Command: clone

`cognigy clone`

Clones a Virtual Agent from Cognigy.AI to disk

| Option | Alias | Type   | Default | Description                                                           |
| ------ | ----- | ------ | ------- | --------------------------------------------------------------------- |
| <nobr>--type</nobr> | -t    | String | `agent` | Which type of resource to clone (`agent` stands for the full project) |

### Command: restore

`cognigy restore`

Restores the local agent copy back into Cognigy.AI by executing a `push` for every resource.

| Option | Alias | Type   | Default | Description                                                             |
| ------ | ----- | ------ | ------- | ----------------------------------------------------------------------- |
| <nobr>--type</nobr> | -t    | String | `agent` | Which type of resource to restore (`agent` stands for the full project) |

### Command: pull

`cognigy pull <resourceType> <resourceName>`

Pulls a specific remote resource from Cognigy.AI

### Command: push

`cognigy push <resourceType> <resourceName>`

Pushes a specific remote resource to Cognigy.AI

> You can't create resources or agents by pushing. Resources must already exist on Cognigy.AI
> 
> For Flows, only Intents and Node configurations will be updated, not Flow structure

### Command: diff

`cognigy diff <resourceType> <resourceName>`

Compares a local resource to a remote resource

| Option | Alias | Type   | Default | Description                                                   |
| ------ | ----- | ------ | ------- | ------------------------------------------------------------- |
| <nobr>--mode</nobr> | -m    | String | `full`  | Full (`full`) vs Node-by-Node (`node`) comparison of the Flow |


### Command: train

`cognigy train flow <flowName>`

Trains the NLU model of a specified Flow on Cognigy.AI

| Option    | Alias | Type   | Default | Description                                                                                        |
| --------- | ----- | ------ | ------- | -------------------------------------------------------------------------------------------------- |
| <nobr>--timeout</nobr> | -t    | Number | 10000   | Timeout in ms before training progress is no longer checked (training will continue on Cognigy.AI) |

### Command: create

`cognigy create snapshot <resourceName> [resourceDescription]`

Creates a remote resource on Cognigy.AI and downloads it to disk.

> Currently only Snapshots and Locales can be created
> For Snapshots, use `cognigy create snapshot snapname "My Description"`
> For Locales, use `cognigy create locale localename`

| Option   | Alias | Type    | Default | Description                                                                                  |
| -------------- | ----- | ------- | ------- | -------------------------------------------------------------------------------------------- |
| <nobr>--timeout</nobr>      | -t    | Number  | 100000  | Timeout in ms before the creation process is no longer checked (will continue on Cognigy.AI) |
| <nobr>--skipDownload</nobr> | -s    | Boolean | false   | Skips download of created resource (for snapshots)                                           |
| <nobr>--fallbackLocale</nobr>      | -lf    | String  | - | ID (not Reference ID) of Locale to use for new Locale |
| <nobr>--nluLanguage</nobr>      | -lnlu    | String  | -  | NLU Language to set for new Locale |

### Command: exportcsv

`cognigy exportcsv flow <flowName>`

Exports the content of a Flow to CSV.

This command will go through all Flows in all Locales and create a `content.csv` file next to the JSON. This file can be used to update content.

### Command: importcsv

`cognigy importcsv flow <flowName>`

Imports the content of a CSV back into a Flow.

This command will go through all Flows in all Locales and check if a valid  `content.csv` exists. If yes, it will go through the Flow Chart and update all localized Nodes with the content from the CSV.

### Command: localize

`cognigy localize flow <flowName>`

Adds localization to Flow Intents and Nodes in bulk.

This command will go through all Intents and Nodes in a given Locale and will add a localization if not already present.

| Option   | Alias | Type    | Default | Description                                                                                  |
| -------------- | ----- | ------- | ------- | -------------------------------------------------------------------------------------------- |
| <nobr>--localName</nobr>      | -l    | String  | - | Locale to add localizations to |
| <nobr>--sourceLocale</nobr> | -sl    | String | - | Source Locale to create localization from (optional) |
| <nobr>--sourceLocale</nobr> | -sl    | String | - | Source Locale to create localization from (optional) |
| <nobr>--localizeIntents</nobr> | -li    | Boolean | true | Whether to localize intents (if active, localizeNodes default is false) |
| <nobr>--localizeNodes</nobr> | -ln    | Boolean | true | Whether to localize Nodes (if active, localizeIntents default is false) |
| <nobr>--contentOnly</nobr> | -co    | Boolean | false | Only localize Say, Question and Optional Question Nodes (optional) |
| <nobr>--reverse</nobr> | -r    | Boolean | false | Removes the localization from the selected Flow (can be combined with -li and -ln) |

### Command: translate

`cognigy translate <resourceType> <resourceName>`

Translates the plain text of a chosen resource, such all Nodes inside a Flow.

| Option    | Alias | Type   | Default | Description                                                                                        |
| --------- | ----- | ------ | ------- | -------------------------------------------------------------------------------------------------- |
| <nobr>--localeName</nobr> | -l    | String | -   | The locale to process |
| <nobr>--fromLanguage</nobr> | -fl    | String | -   | The language to translate from |
| <nobr>--toLanguage</nobr> | -tl    | String | -   | The language to translate to |
| <nobr>--translator</nobr> | -tr    | String | -   | The translation tool that should be used. 'google', 'microsoft' or 'deepl' |
| <nobr>--translateIntents</nobr> | -ti   | Boolean | false   | Whether to add localization to Flow Intents |
| <nobr>--translateNodes</nobr> | -tn   | Boolean | false  | Whether to add localization to Flow Nodes|
| <nobr>--apiKey</nobr> | -k | String | -  | The API Key for the chosen translation tool |
| <nobr>--forceYes</nobr> | -y | Boolean | false  | Whether to skip warnings and overwrite all content |

### Command: execute

`cognigy execute <command>`

Executes a command of the [Cognigy REST API Client](https://www.npmjs.com/package/@cognigy/rest-api-client). For more information on API calls, please see our [OpenAPI documentation](https://api-trial.cognigy.ai/openapi).

Supports injecting payloads either through pipes or the -d (--data) option:

- `echo '{"flowId": "5f5618bce35138ed3ab9ab9a"}' | cognigy execute readFlow`
- `cognigy execute readFlow -d '{"flowId": "5f5618bce35138ed3ab9ab9a"}'`

This command uses the `baseUrl` and `apiKey` parameters of your configuration.

| Option   | Alias | Type    | Default | Description                                                                                  |
| -------------- | ----- | ------- | ------- | -------------------------------------------------------------------------------------------- |
| <nobr>--list</nobr>      | -l    | -  | -  | Lists all available commands |
| <nobr>--data</nobr> | -d    | string | -   | Injects a data payload (must be in JSON format)                                           |

### Command: run
`cognigy run playbooks <playbookFile>`

Schedules runs of one or more playbooks and checks their status.

Will either use a `./playbooks.json` file or any other file you point it to. Format:

```
[
    {
        "playbookId": "",
        "entrypoint": "", // snapshot ID or agent ID (if no snapshot is used)
        "flowId": "", // this is the flow reference ID
        "localeId": "" // this is the locale reference ID
    },
    {
        "playbookId": "",
        "entrypoint": "",
        "flowId": "",
        "localeId": ""
    }
]
```

The run command outputs the status of the playbook runs and exits:

| Output | Exit Code |
|--------|-----------|
| SUCCESS | 0 |
| FAILURE | 1 |
| TIMEOUT | 2 |

All details are written to `./playbookRunResults.json`


## Contributing

### Commiting

Commit using the commitizen hook with semantic naming convetion promt 

```bash
npx cz
```

### Pull Requests

Create PR with any kind of feature/bugfix folloving the [semantic message format](https://github.com/semantic-release/semantic-release#commit-message-format) to the develop branch.

Any PRs to develop needs to be merged as squash merges.

### Release

Create a PR from develop to main and do a merge commit. This will automatically trigger a new release.
To make the release publish a new minor version to the npm registry, the commit message needs to follow the [semantic message format] and having at least one of the commits to main from the last release with a fix.
