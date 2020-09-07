# Cognigy Command Line Interface (CLI) 
> This is an unsupported alpha release. Please use with caution!

Cognigy-CLI is a series of tools meant to aid Cognigy.AI developers in maintaining local copies of their virtual agent projects.

**The CLI can currently not create resources (other than Snapshots), but only edit existing resources.**

Currently supported resources:

- Flows (clone, restore, push, pull, diff, train)
- Lexicons (clone, restore, push, pull, diff)
- Endpoints (clone, restore, push, pull, diff)
- Snapshots (create)

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
| --type | -t    | String | `agent` | Which type of resource to clone (`agent` stands for the full project) |

### Command: restore
`cognigy restore`

Restores the local agent copy back into Cognigy.AI by executing a `push` for every resource.

| Option | Alias | Type   | Default | Description                                                             |
| ------ | ----- | ------ | ------- | ----------------------------------------------------------------------- |
| --type | -t    | String | `agent` | Which type of resource to restore (`agent` stands for the full project) |

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
| --mode | -m    | String | `full`  | Full (`full`) vs Node-by-Node (`node`) comparison of the Flow |


### Command: train
`cognigy train <flowName>`

Trains the NLU model of a specified Flow on Cognigy.AI

| Option    | Alias | Type   | Default | Description                                                                                        |
| --------- | ----- | ------ | ------- | -------------------------------------------------------------------------------------------------- |
| --timeout | -t    | Number | 10000   | Timeout in ms before training progress is no longer checked (training will continue on Cognigy.AI) |

### Command: create
`cognigy create <resourceType> <resourceName> [resourceDescription]`

Creates a remote resource on Cognigy.AI and downloads it to disk.

> Currently only snapshots can be created with `cognigy create snapshot snapname "My Description"`

| Option         | Alias | Type    | Default | Description                                                                                  |
| -------------- | ----- | ------- | ------- | -------------------------------------------------------------------------------------------- |
| --timeout      | -t    | Number  | 100000  | Timeout in ms before the creation process is no longer checked (will continue on Cognigy.AI) |
| --skipDownload | -s    | Boolean | false   | Skips download of created resource (for snapshots)                                           |
