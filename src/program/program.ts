/** Node Modules*/
import { Command } from 'commander';

/** Custom Modules */
import '../utils/checkConfig';
import { clone } from '../commands/clone';
import { restore } from '../commands/restore';
import { diff } from '../commands/diff';
import { push } from '../commands/push';
import { pull } from '../commands/pull';
import { init } from '../commands/init';
import { train } from '../commands/train';
import { create } from '../commands/create';
import { exportcsv } from '../commands/exportcsv';
import { importcsv } from '../commands/importcsv';
import { execute } from '../commands/execute';
import { translate } from '../commands/translate';
import { localize } from '../commands/localize';
import { run } from '../commands/run';
import { makeKnowledgeAIProgram } from './knowledgeAIProgram';

let stdin = '';

export const setStdIn = (input: string) => {
    stdin += input;
}

export const getStdIn = (): string => stdin;

export const program = new Command();
program.version('1.4.0');

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
    .option('-t, --timeout <ms>', 'timeout for training')
    .description('Pushes a resource from disk to Cognigy.AI')
    .action(async (resourceType, resourceName, cmdObj) => { await push({ resourceType, resourceName, options: cmdObj }); });

program
    .command('pull <resourceType> [resourceName]')
    .option('-c, --config <configFile>', 'force the use of a specific config file')
    .option('-y, --forceYes', 'skips warnings and overwrites all content')
    .description('Pulls a resource from Cognigy.AI to disk')
    .action(async (resourceType, resourceName, cmdObj) => { await pull({ resourceType, resourceName, forceYes: cmdObj.forceYes }); });

program
    .command('train <resourceType> <resourceName>')
    .description('Trains the intent models of a Flow')
    .option('-t, --timeout <ms>', 'timeout for training')
    .action(async (resourceType, resourceName, cmdObj) => { await train({ resourceName, timeout: cmdObj.timeout }); });

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
    .command('localize <resourceType> [resourceName]')
    .option('-c, --config <configFile>', 'force the use of a specific config file')
    .option('-l, --localeName <localeName>', 'locale to process')
    .option('-sl, --sourceLocale <sourceLocaleName>', 'locale to copy from')
    .option('-li, --localizeIntents', 'adds localization to Flow Intents')
    .option('-ln, --localizeNodes', 'adds localization to Flow Nodes')
    .option('-co, --contentOnly', 'adds localization only to Flow Nodes of type Say, Question and Optional Question')
    .option('-r, --reverse', 'removes the localization from the selected Flow')
    .option('-y, --forceYes', 'skips warnings and overwrites all content')
    .description('Adds missing localizations to Flow Intents and Nodes')
    .action(async (resourceType, resourceName, cmdObj) => { await localize({ resourceType, resourceName, options: cmdObj }); });

program
    .command('translate <resourceType> <resourceName>')
    .description('Translate a resource')
    .option('-l, --localeName <localeName>', 'locale to process')
    .option('-fl, --fromLanguage <fromLanguageCode>', 'language to translate from')
    .option('-tl, --toLanguage <targetLanguageCode>', 'language to translate to')
    .option('-tr, --translator <translator>', 'the translation tool, google, microsoft or deepl')
    .option('-ti, --translateIntents', 'adds localization to Flow Intents')
    .option('-tn, --translateNodes', 'adds localization to Flow Nodes')
    .option('-k, --apiKey <apiKey>', 'the translator api key')
    .option('-r, --region <region>', 'the translator api region; required by microsoft translator')
    .option('-y, --forceYes', 'skips warnings and overwrites all content')
    .action(async (resourceType, resourceName, cmdObj) => { await translate({ resourceType, resourceName, options: cmdObj }); });

program
    .command('execute [command]')
    .option('-c, --config <configFile>', 'force the use of a specific config file')
    .option('-d, --data <data>', 'the JSON data to pass to the command')
    .option('-l, --list', 'lists all available commands')
    .description('Executes a command of the Cognigy API client')
    .action(async (command, cmdObj) => {
        await execute({ command, options: cmdObj, stdin });
    });

program
    .command('run <resourceType> [playbookFile]')
    .option('-c, --config <configFile>', 'force the use of a specific config file')
    .option('-l, --list', 'lists all available commands')
    .description('Schedules one or more playbooks to run')
    .action(async (resourceType, playbookFile, cmdObj) => {
        await run({ resourceType, playbookFile, options: cmdObj });
    });

program.addCommand(makeKnowledgeAIProgram());
