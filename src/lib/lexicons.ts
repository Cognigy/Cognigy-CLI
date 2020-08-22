import * as fs from 'fs';
import * as jsonDiff from 'json-diff';
import { Spinner }  from 'cli-spinner';
import * as chalk from 'chalk';

import { addToProgressBar } from '../utils/progressBar';
import CONFIG from '../utils/config';
import CognigyClient from '../utils/cognigyClient';
import { checkCreateDir } from '../utils/checks';


/**
 * Clones Cognigy Lexicons to disk
 * @param availableProgress How much of the progress bar can be filled by this process
 */
export const cloneLexicons = async (availableProgress: number): Promise<void> => {
    // make sure all directories exist
    checkCreateDir(CONFIG.agentDir);
    checkCreateDir(CONFIG.agentDir + "/lexicons");

    // The base directory for Flows
    const lexiconDir = CONFIG.agentDir + "/lexicons";

    // An increment counter for the progress bar
    const progressIncrement = Math.round(availableProgress / 10);

    // remove target directory
    try {
        fs.rmdirSync(lexiconDir, { recursive: true });
        addToProgressBar(progressIncrement);
    } catch (err) { console.log(err.message); }

    // create Flow base directory
    fs.mkdirSync(lexiconDir);
    addToProgressBar(progressIncrement);

    // query Cognigy.AI for all Flows in this agent
    const lexicons = await CognigyClient.indexLexicons({
        "projectId": CONFIG.agent
    });
    addToProgressBar(progressIncrement);

    const incrementPerLexicon = 70 / lexicons.items.length;

    // create a sub-folder, chart.json and config.json for each Flow
    for (let lexicon of lexicons.items) {
        const individualLexiconDir = lexiconDir + "/" + lexicon.name;

        const lexiconDetail = await CognigyClient.readLexicon({
            lexiconId: lexicon._id
        });

        fs.mkdirSync(individualLexiconDir);
        fs.writeFileSync(individualLexiconDir + "/config.json", JSON.stringify(lexiconDetail, undefined, 4));
        addToProgressBar(incrementPerLexicon);
    }

    return Promise.resolve();
};

/**
 * Pulls a  Cognigy Lexicon to disk
 * @param lexiconName The name of the Lexicon to pull
 * @param availableProgress How much of the progress bar can be filled by this process
 */
export const pullLexicon = async (lexiconName: string, availableProgress: number): Promise<void> => {
    // make sure all directories exist
    checkCreateDir(CONFIG.agentDir);
    checkCreateDir(CONFIG.agentDir + "/lexicons");

    // The base directory for Flows
    const lexiconDir = CONFIG.agentDir + "/lexicons/" + lexiconName;

    // An increment counter for the progress bar
    const progressIncrement = Math.round(availableProgress / 10);

    // query Cognigy.AI for all Flows in this agent
    const lexicons = await CognigyClient.indexLexicons({
        "projectId": CONFIG.agent
    });
    addToProgressBar(progressIncrement);

    // check if flow with given name exists
    const lexicon = lexicons.items.find((lexicon) => {
        if (lexicon.name === lexiconName)
            return lexicon;
    });
    if (!lexicon) {
        console.log(`\n\Lexicon with name ${lexiconName} can't be found in your Virtual Agent on Cognigy.AI. Aborting...`);
        process.exit(0);
    }

    // remove target directory
    try {
        fs.rmdirSync(lexiconDir, { recursive: true });
        addToProgressBar(progressIncrement);
    } catch (err) { console.log(err.message); }

    // create Flow base directory
    fs.mkdirSync(lexiconDir);
    addToProgressBar(progressIncrement);

    // pull lexicon data from Cognigy.AI
    const lexiconDetail = await CognigyClient.readLexicon({
        lexiconId: lexicon._id
    });

    // write files to disk
    fs.writeFileSync(lexiconDir + "/config.json", JSON.stringify(lexiconDetail, undefined, 4));
    addToProgressBar(70);

    return Promise.resolve();
};

/**
 * Restores Lexicons back to Cognigy.AI
 * @param availableProgress How much of the progress bar can be filled by this process
 */
export const restoreLexicons = async (availableProgress: number): Promise<void> => {
    const agentLexiconDir = CONFIG.agentDir + "/lexicons";

    // read lexicon directories
    const lexiconDirectories = fs.readdirSync(agentLexiconDir);
    if (!lexiconDirectories || lexiconDirectories.length === 0) {
        console.log("No Lexicons found, aborting...\n");
        return;
    }

    const incrementPerLexicon = availableProgress / lexiconDirectories.length;

    // iterate through lexicons and push all to Cognigy.AI
    for (let lexicon of lexiconDirectories) {
        await pushLexicon(lexicon, incrementPerLexicon);
    }
    return Promise.resolve();
};

/**
 * Pushes an Lexicon back to Cognigy.AI
 * @param lexiconName Name of the Lexicon to push to Cognigy.aI
 * @param availableProgress How much of the progress bar can be filled by this process
 */
export const pushLexicon = async (lexiconName: string, availableProgress: number): Promise<void> => {
    const lexiconDir = CONFIG.agentDir + "/lexicons/" + lexiconName;

    if (fs.existsSync(lexiconDir + "/config.json")) {
        // config exist for this lexicon, proceed

        try {
            // read local lexicon config
            const lexiconConfig = JSON.parse(fs.readFileSync(lexiconDir + "/config.json").toString());
            lexiconConfig.lexiconId = lexiconConfig._id;
            delete lexiconConfig._id;
            delete lexiconConfig.createdAt;
            delete lexiconConfig.createdBy;
            delete lexiconConfig.lastChanged;
            delete lexiconConfig.lastChangedBy;

            // update Lexicon on Cognigy.AI
            await CognigyClient.updateLexicon({
                ...lexiconConfig
            });
        } catch (err) {
            console.error(`Error when updating Lexicon ${lexiconName} on Cognigy.AI: ${err.message}.\nAborting...`);
            process.exit(0);
        }
        addToProgressBar(availableProgress);
    } else {
        // chart or config are missing, skip
        console.log(`Lexicon ${lexiconName} can't be found in '${lexiconDir}'`);
        process.exit(0);
    }
    return Promise.resolve();
};

/**
 * Compares two Lexicon JSON representations
 * @param lexiconName ID of the Flow to compare
 * @param mode always full
 */
export const diffLexicons = async (lexiconName: string, mode: string = 'full'): Promise<void> => {
    try {
        // check if a valid mode was selected
        if (['full'].indexOf(mode) === -1) {
            console.log(`Selected mode not supported for Lexicons. Supported modes:\n\n- full\n`);
            process.exit(0);
        }

        const spinner = new Spinner(`Comparing ${chalk.green('local')} and ${chalk.red('remote')} Lexicon resource ${lexiconName}... %s`);
        spinner.setSpinnerString('|/-\\');
        spinner.start();

        const lexiconDir = CONFIG.agentDir + "/lexicons";

        // check whether Lexicon directory and config.json for the Lexicon exist
        if (!fs.existsSync(lexiconDir + "/" + lexiconName) || !fs.existsSync(lexiconDir + "/" + lexiconName + "/config.json")) {
            spinner.stop();
            console.log(`\nThe requested Lexicon resource (${lexiconName}) couldn't be found ${chalk.green('locally')}. Aborting...`);
            process.exit(0);
        }

        // retrieve local Flow chart
        const localConfig = JSON.parse(fs.readFileSync(lexiconDir + "/" + lexiconName + "/config.json").toString());

        // retrieve remote Flow chart
        const remoteConfig = await CognigyClient.readLexicon({
            "lexiconId": localConfig._id
        });

        // perform full comparison and output results
        const diffString = jsonDiff.diffString(remoteConfig, localConfig);

        spinner.stop();

        if (diffString) console.log(`\n\n ${diffString}`);
        else console.log(`\n\nThe local and remote resource are identical.`);

        return;
    } catch (err) {
        console.log(err.message);
        process.exit(0);
    }
};