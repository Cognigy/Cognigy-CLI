#!/usr/bin/env node

import './utils/checkConfig';

import { Command } from 'commander';
import { clone } from './commands/clone';
import { restore } from './commands/restore';
import { diff } from './commands/diff';
import { push } from './commands/push';
import { pull } from './commands/pull';
import { init } from './commands/init';
import { train } from './commands/train';
import { create } from './commands/create';
import { exportcsv } from './commands/exportcsv';
import { importcsv } from './commands/importcsv';
import { execute } from './commands/execute';

const program = new Command();
program.version('0.3.0');

let stdin = '';

program
    .command('init')
    .description('Initializes a new Cognigy.AI CLI project')
    .action(async () => { await init(); });

program
    .command('clone')
    .option('-t, --type <resourceType>', 'what type of resource to clone')
    .option('-c, --config <configFile>', 'force the use of a specific config file')
    .option('-y, --forceYes', 'skips warnings and overwrites all content')
    .description('Clones a virtual agent from Cognigy.AI into a local directory')
    .action(async (cmdObj) => { await clone({ resourceType: cmdObj.type, forceYes: cmdObj.forceYes }); });

program
    .command('restore')
    .option('-t, --type <resourceType>', 'what type of resource to restore')
    .option('-c, --config <configFile>', 'force the use of a specific config file')
    .option('-y, --forceYes', 'skips warnings and overwrites all content')
    .description('Restores a virtual agent from disk to Cognigy.AI')
    .action(async (cmdObj) => { await restore({ resourceType: cmdObj.type, forceYes: cmdObj.forceYes }); });

program
    .command('diff <resourceType> <resourceId>')
    .option('-m, --mode <mode>', 'full or node diff mode')
    .option('-c, --config <configFile>', 'force the use of a specific config file')
    .description('Compares a local <resourceType> resource with <resourceId> to its corresponding remote resource')
    .action(async (resourceType, resourceId, cmdObj) => { await diff(resourceType, resourceId, cmdObj.mode); });

program
    .command('push <resourceType> <resourceName>')
    .option('-c, --config <configFile>', 'force the use of a specific config file')
    .option('-y, --forceYes', 'skips warnings and overwrites all content')
    .description('Pushes a resource from disk to Cognigy.AI')
    .action(async (resourceType, resourceName, cmdObj) => { await push({ resourceType, resourceName, forceYes: cmdObj.forceYes }); });

program
    .command('pull <resourceType> [resourceName]')
    .option('-c, --config <configFile>', 'force the use of a specific config file')
    .option('-y, --forceYes', 'skips warnings and overwrites all content')
    .description('Pulls a resource from Cognigy.AI to disk')
    .action(async (resourceType, resourceName, cmdObj) => { await pull({ resourceType, resourceName, forceYes: cmdObj.forceYes }); });

program
    .command('train [resourceName]')
    .description('Trains the intent models ')
    .option('-t, --timeout <ms>', 'timeout for training')
    .action(async (resourceName, cmdObj) => { await train({ resourceName, timeout: cmdObj.timeout }); });

program
    .command('create <resourceType> <resourceName> [resourceDescription]')
    .description('Creates a Snapshot and downloads it or creates a Locale')
    .option('-c, --config <configFile>', 'force the use of a specific config file')
    .option('-t, --timeout <ms>', 'timeout for creating the snapshot')
    .option('-s, --skipDownload', 'skip downloading the snapshot')
    .option('-lf, --fallbackLocale <localeId>', 'fallback locale ID')
    .option('-lnlu, --nluLanguage <languageCode>', 'NLU to use')
    .action(async (resourceType, resourceName, resourceDescription = 'Cognigy.AI CLI', cmdObj) => { 
        await create({ resourceType, resourceName, description: resourceDescription, timeout: cmdObj.timeout, skipDownload: cmdObj.skipDownload, fallbackLocale: cmdObj.fallbackLocale, nluLanguage: cmdObj.nluLanguage }); 
    });

program
    .command('exportcsv <resourceType> [resourceName]')
    .option('-c, --config <configFile>', 'force the use of a specific config file')
    .option('-y, --forceYes', 'skips warnings and overwrites all content')
    .description('Exports the content of a Flow to CSV')
    .action(async (resourceType, resourceName, cmdObj) => { await exportcsv({ resourceType, resourceName }); });

program
    .command('importcsv <resourceType> [resourceName]')
    .option('-c, --config <configFile>', 'force the use of a specific config file')
    .option('-y, --forceYes', 'skips warnings and overwrites all content')
    .description('Imports the content of a Flow from CSV')
    .action(async (resourceType, resourceName, cmdObj) => { await importcsv({ resourceType, resourceName }); });

program
    .command('execute <command>')
    .option('-c, --config <configFile>', 'force the use of a specific config file')
    .option('-d, --data <data>', 'the JSON data to pass to the command')
    .option('-l, --list', 'lists all available commands')
    .description('Executes a command of the Cognigy API client')
    .action(async (command, cmdObj) => {
        await execute({ command, options: cmdObj, stdin });
    });

// enables piping of information into the CLI through stdin
if (process.stdin.isTTY) {
    program.parse(process.argv);
} else {
    process.stdin.on('readable', () => {
        const chunk = process.stdin.read();
        if (chunk !== null) {
           stdin += chunk;
        }
    });

    process.stdin.on('end', () => {
        program.parse(process.argv);
    });
}
