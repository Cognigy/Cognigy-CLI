import * as fs from 'fs';
import * as jsonDiff from 'json-diff';
import { Spinner }  from 'cli-spinner';
import * as chalk from 'chalk';

import { addToProgressBar } from '../utils/progressBar';
import CONFIG from '../utils/config';
import CognigyClient from '../utils/cognigyClient';
import { checkCreateDir, removeCreateDir } from '../utils/checks';
import { indexAll } from '../utils/indexAll';


/**
 * Clones Cognigy Endpoints to disk
 * @param availableProgress How much of the progress bar can be filled by this process
 */
export const cloneEndpoints = async (availableProgress: number): Promise<void> => {
    // The base directory for Flows
    const endpointDir = CONFIG.agentDir + "/endpoints";
    await removeCreateDir(endpointDir);

    // An increment counter for the progress bar
    const progressIncrement = Math.round(availableProgress / 10);
    addToProgressBar(progressIncrement);

    // query Cognigy.AI for all Flows in this agent
    const endpoints = await indexAll(CognigyClient.indexEndpoints)({
        "projectId": CONFIG.agent
    });
    addToProgressBar(progressIncrement);

    const incrementPerEndpoint = 70 / endpoints.items.length;

    // create a sub-folder, chart.json and config.json for each Flow
    for (let endpoint of endpoints.items) {
        const individualEndpointDir = endpointDir + "/" + endpoint.name;

        const endpointDetail = await CognigyClient.readEndpoint({
            endpointId: endpoint._id
        });

        await removeCreateDir(individualEndpointDir);
        fs.writeFileSync(individualEndpointDir + "/config.json", JSON.stringify(endpointDetail, undefined, 4));
        fs.writeFileSync(individualEndpointDir + "/transformer.ts", endpointDetail.transformer.transformer);
        addToProgressBar(incrementPerEndpoint);
    }

    return Promise.resolve();
};

/**
 * Pulls a  Cognigy Endpoint to disk
 * @param endpointName The name of the Endpoint to pull
 * @param availableProgress How much of the progress bar can be filled by this process
 */
export const pullEndpoint = async (endpointName: string, availableProgress: number): Promise<void> => {
    // make sure all directories exist
    checkCreateDir(CONFIG.agentDir);
    checkCreateDir(CONFIG.agentDir + "/endpoints");

    // The base directory for Flows
    const endpointDir = CONFIG.agentDir + "/endpoints/" + endpointName;

    // An increment counter for the progress bar
    const progressIncrement = Math.round(availableProgress / 10);

    // query Cognigy.AI for all Flows in this agent
    const endpoints = await indexAll(CognigyClient.indexEndpoints)({
        "projectId": CONFIG.agent
    });
    addToProgressBar(progressIncrement);

    // check if flow with given name exists
    const endpoint = endpoints.items.find((endpoint) => {
        if (endpoint.name === endpointName)
            return endpoint;
    });
    if (!endpoint) {
        console.log(`\n\Endpoint with name ${endpointName} can't be found in your Virtual Agent on Cognigy.AI. Aborting...`);
        process.exit(0);
    }

    // remove target directory
    try {
        fs.rmdirSync(endpointDir, { recursive: true });
        addToProgressBar(progressIncrement);
    } catch (err) { console.log(err.message); }

    // create Flow base directory
    fs.mkdirSync(endpointDir);
    addToProgressBar(progressIncrement);

    // pull endpoint data from Cognigy.AI
    const endpointDetail = await CognigyClient.readEndpoint({
        endpointId: endpoint._id
    });

    // write files to disk
    fs.writeFileSync(endpointDir + "/config.json", JSON.stringify(endpointDetail, undefined, 4));
    fs.writeFileSync(endpointDir + "/transformer.ts", endpointDetail.transformer.transformer);
    addToProgressBar(70);

    return Promise.resolve();
};

/**
 * Restores Endpoints back to Cognigy.AI
 * @param availableProgress How much of the progress bar can be filled by this process
 */
export const restoreEndpoints = async (availableProgress: number): Promise<void> => {
    const agentEndpointDir = CONFIG.agentDir + "/endpoints";

    // read endpoint directories
    const endpointDirectories = fs.readdirSync(agentEndpointDir);
    if (!endpointDirectories || endpointDirectories.length === 0) {
        console.log("No Endpoints found, aborting...\n");
        return;
    }

    const incrementPerEndpoint = availableProgress / endpointDirectories.length;

    // iterate through endpoints and push all to Cognigy.AI
    for (let endpoint of endpointDirectories) {
        await pushEndpoint(endpoint, incrementPerEndpoint);
    }
    return Promise.resolve();
};

/**
 * Pushes an Endpoint back to Cognigy.AI
 * @param endpointName Name of the Endpoint to push to Cognigy.aI
 * @param availableProgress How much of the progress bar can be filled by this process
 */
export const pushEndpoint = async (endpointName: string, availableProgress: number): Promise<void> => {
    const endpointDir = CONFIG.agentDir + "/endpoints/" + endpointName;

    if (fs.existsSync(endpointDir + "/config.json")) {
        // config exist for this endpoint, proceed

        try {
            // read local endpoint config
            const endpointConfig = JSON.parse(fs.readFileSync(endpointDir + "/config.json").toString());
            endpointConfig.endpointId = endpointConfig._id;
            delete endpointConfig._id;
            delete endpointConfig.createdAt;
            delete endpointConfig.createdBy;
            delete endpointConfig.lastChanged;
            delete endpointConfig.lastChangedBy;

            // try to reinsert transformer
            try {
                const transformer = fs.readFileSync(endpointDir + "/transformer.ts").toString();
                endpointConfig.transformer.transformer = transformer;
            } catch (err) {}

            // update Endpoint on Cognigy.AI
            await CognigyClient.updateEndpoint({
                ...endpointConfig
            });
        } catch (err) {
            console.error(`Error when updating Endpoint ${endpointName} on Cognigy.AI: ${err.message}.\nAborting...`);
            process.exit(0);
        }
        addToProgressBar(availableProgress);
    } else {
        // chart or config are missing, skip
        console.log(`Endpoint ${endpointName} can't be found in '${endpointDir}'`);
        process.exit(0);
    }
    return Promise.resolve();
};

/**
 * Compares two Endpoint JSON representations
 * @param endpointName ID of the Flow to compare
 * @param mode always full
 */
export const diffEndpoints = async (endpointName: string, mode: string = 'full'): Promise<void> => {
    try {
        // check if a valid mode was selected
        if (['full'].indexOf(mode) === -1) {
            console.log(`Selected mode not supported for Endpoints. Supported modes:\n\n- full\n`);
            process.exit(0);
        }

        const spinner = new Spinner(`Comparing ${chalk.green('local')} and ${chalk.red('remote')} Endpoint resource ${endpointName}... %s`);
        spinner.setSpinnerString('|/-\\');
        spinner.start();

        const endpointDir = CONFIG.agentDir + "/endpoints";

        // check whether Endpoint directory and config.json for the Endpoint exist
        if (!fs.existsSync(endpointDir + "/" + endpointName) || !fs.existsSync(endpointDir + "/" + endpointName + "/config.json")) {
            spinner.stop();
            console.log(`\nThe requested Endpoint resource (${endpointName}) couldn't be found ${chalk.green('locally')}. Aborting...`);
            process.exit(0);
        }

        // retrieve local Flow chart
        const localConfig = JSON.parse(fs.readFileSync(endpointDir + "/" + endpointName + "/config.json").toString());

        // try to reinsert transformer
        try {
            const transformer = fs.readFileSync(endpointDir + "/" + endpointName + "/transformer.ts").toString();
            localConfig.transformer.transformer = transformer;
        } catch (err) {}

        // transpiled version will automatically be created on Cognigy.AI
        delete localConfig.transformer.transpiledTransformer;

        // retrieve remote Flow chart
        const remoteConfig = await CognigyClient.readEndpoint({
            "endpointId": localConfig._id
        });
        delete remoteConfig.transformer.transpiledTransformer;

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