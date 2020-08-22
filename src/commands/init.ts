import * as inquirer from 'inquirer';
import * as fs from 'fs';

/**
 * Inits a new Cognigy.AI CLI
 */
export const init = async (): Promise<void> => {
    console.log(`Welcome to the Cognigy.AI CLI. The init function will set up a config.json file for you, after which you can use all other commands.\n`);

    // collect all necessary data from user
    const answers = await inquirer
    	.prompt([
            {
                type: 'input',
                name: 'name',
                message: `What is your name for your configuration?`
            },
            {
                type: 'input',
                name: 'apiKey',
                message: `What is your Cognigy.AI API Key?`
            },
            {
                type: 'input',
                name: 'agent',
                message: `What is the ID of the Virtual Agent you'd like to work with?`
            },
            {
                type: 'input',
                name: 'baseUrl',
                message: `What is the base URL to connect to (e.g. https://api-trial.cognigy.ai)?`,
                default: `https://api-trial.cognigy.ai`
            }
            ,
            {
                type: 'input',
                name: 'agentDir',
                message: `This will delete all  data you have stored currently locally. Do you want to proceed?`,
                default: `./agent`
            },
            {
                type: 'input',
                name: 'filePath',
                message: `The path where your configuration will be stored (if it exists, it will be overwritten)?`,
                default: `./config.json`
            }
        ]);

    if (fs.existsSync(answers.filePath)) fs.unlinkSync(answers.filePath);
    fs.writeFileSync(answers.filePath, JSON.stringify(answers, undefined, 4));

    console.log(`\nWe've successfully initialized your project configuration. You can use all Cognigy.AI CLI commands now.\nEnter 'cognigy -h' for more information.`)
    return;
};