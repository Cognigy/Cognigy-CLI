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

const program = new Command();
program.version('0.2.2');

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
    .description('Creates a Snapshot and downloads it')
    .option('-t, --timeout <ms>', 'timeout for creating the snapshot')
    .option('-s, --skipDownload', 'skip downloading the snapshot')
    .action(async (resourceType, resourceName, resourceDescription = 'Cognigy.AI CLI', cmdObj) => { await create({ resourceType: 'snapshot', resourceName, description: resourceDescription, timeout: cmdObj.timeout, skipDownload: cmdObj.skipDownload }); });

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

program.parse(process.argv);
console.log();