import { trainFlow } from '../lib/flows';
import { checkProject } from '../utils/checks';
import { upperFirst } from '../utils/stringUtils';
import CognigyClient from '../utils/cognigyClient';

/**
 * Executes a Cognigy API Command
 * @param command the command to execute
 */
export const execute = async ({ command, options, stdin }): Promise<void> => {
    let data = null;

    // check if list flag was used
    if (options.list) {
        const commands = [];
        Object.keys(CognigyClient).forEach((key) => {
            commands.push(key);
        });
        commands.sort();

        console.log(`cognigy execute supports the following ${commands.length} commands:\n`);
        console.log('- ' + commands.join('\n- '));
        process.exit(0);
    }

    if (!command) {
        console.log(`error: Missing paramter 'command'`);
        process.exit(0);
    }

    // check if command exists
    if (Object.keys(CognigyClient).indexOf(command) === -1) {
        console.log(`error: Command '${command}' doesn't exist. Please execute 'cognigy execute -l' to see a list of available commands`);
        process.exit(0);
    }

    // populate data
    try {
        if (stdin)
            data = JSON.parse(stdin);

        if (options.data)
            data = JSON.parse(options.data);
    } catch (err) {
        console.log(`error: ${err.message}`);
        process.exit(0);
    }

    // execute the command
    try {
        console.log(JSON.stringify(await CognigyClient[command](data), undefined, 4));
    } catch (err) {
        console.log(`error: ${err.message}`);
    }

    return;
};