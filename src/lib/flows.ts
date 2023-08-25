import * as fs from 'fs';
import * as jsonDiff from 'json-diff';
import { Spinner } from 'cli-spinner';
import * as chalk from 'chalk';
import { createArrayCsvWriter } from 'csv-writer';
import csv from 'csv-parser';
import FormData from 'form-data';

import { checkTask } from '../utils/checks';

import { addToProgressBar, endProgressBar, startProgressBar } from '../utils/progressBar';
import CONFIG from '../utils/config';
import CognigyClient from '../utils/cognigyClient';
import { removeCreateDir } from '../utils/checks';
import { pullLocales } from './locales';
import translateFlowNode, { translateIntentExampleSentence, translateSayNode } from '../utils/translators';
import { makeAxiosRequest } from '../utils/axiosClient';

import { indexAll } from '../utils/indexAll';

// Interfaces
import { ILocaleIndexItem_2_0 } from '@cognigy/rest-api-client/build/shared/interfaces/restAPI/resources/locales/v2.0';
import { IIntent } from '@cognigy/rest-api-client/build/shared/interfaces/resources/intent/IIntent';
import { IIndexFlowsRestReturnValue_2_0 } from '@cognigy/rest-api-client';

/**
 * Clones Cognigy Flows to disk
 * @param availableProgress How much of the progress bar can be filled by this process
 */
export const cloneFlows = async (availableProgress: number): Promise<void> => {
    // The base directory for Flows
    const flowDir = CONFIG.agentDir + "/flows";
    await removeCreateDir(flowDir);

    // query Cognigy.AI for all Flows in this agent
    const flows = await indexAll(CognigyClient.indexFlows)({
        "projectId": CONFIG.agent
    });

    const progressPerFlow = availableProgress / flows.items.length;

    // create a sub-folder, chart.json and config.json for each Flow
    const flowsPromiseArr = []
    for (let flow of flows.items) {
        flowsPromiseArr.push(pullFlow(flow.name, progressPerFlow));
    }

    await Promise.all(flowsPromiseArr);

    return Promise.resolve();
};


/**
 * Pulls a Flow from Cognigy.AI to disk
 * @param flowName The name of the Flow to pull
 * @param availableProgress How much of the progress bar can be filled by this process
 */
export const pullFlow = async (flowName: string, availableProgress: number, _flows?: Pick<IIndexFlowsRestReturnValue_2_0, 'items' | 'total'>): Promise<void> => {
    // The base directory for Flows
    const flowsDir = CONFIG.agentDir + "/flows";
    const flowDir = flowsDir + "/" + flowName;

    await removeCreateDir(flowDir);

    let flows: Pick<IIndexFlowsRestReturnValue_2_0, 'items' | 'total'> = _flows
    
    // query Cognigy.AI for all Flows in this agent
    if (!flows) {
        flows = await indexAll(CognigyClient.indexFlows)({
            "projectId": CONFIG.agent
        });
    }

    // check if flow with given name exists
    const flow = flows.items.find((flow) => {
        if (flow.name === flowName)
            return flow;
    });

    if (!flow) {
        console.log(`\n\nFlow with name ${flowName} can't be found on Cognigy.AI. Aborting...`);
        process.exit(0);
    }

    const locales = await pullLocales();

    const progressPerLocale = availableProgress / locales.length;

    for (let locale of locales) {
        const localeDir = flowDir + "/" + locale.name;

        await removeCreateDir(localeDir);

        fs.writeFileSync(flowDir + "/config.json", JSON.stringify(flow, undefined, 4));

        const chart = await CognigyClient.readChart({
            "resourceId": flow._id,
            "resourceType": "flow",
            "preferredLocaleId": locale._id
        });

        // half of the available progress bar space is allocated to Nodes, the other half to intents
        const nodesProgressBar = progressPerLocale / 2
        const intentsProgressBar = progressPerLocale / 2;

        const progressPerNode = nodesProgressBar / chart.nodes.length;

        // iterate through all Nodes for this chart and add the information into the chart
        for (let node of chart.nodes) {
            const Node = await CognigyClient.readChartNode({
                "nodeId": node._id,
                "resourceId": flow._id,
                "resourceType": "flow",
                "preferredLocaleId": locale._id
            });
            node["config"] = Node.config;
            delete node["preview"];
            addToProgressBar(progressPerNode);
        }

        fs.writeFileSync(localeDir + "/chart.json", JSON.stringify(chart, undefined, 4));

        // console.log(`Fetching intents: ${JSON.stringify({
        //     flowId: flow._id,
        //     localeId: locale._id,
        //     format: 'json'
        // })}`);

        const flowIntents = await CognigyClient.exportIntents({
            flowId: flow._id,
            localeId: locale._id,
            format: 'json'
        });
        addToProgressBar(intentsProgressBar);

        fs.writeFileSync(localeDir + "/intents.json", JSON.stringify(flowIntents, undefined, 4));
    }

    return Promise.resolve();
};

/**
 * Restores Flows back to Cognigy.AI
 * @param availableProgress How much of the progress bar can be filled by this process
 */
export const restoreFlows = async (availableProgress: number): Promise<void> => {
    const agentFlowDir = CONFIG.agentDir + "/flows";

    // Read Flow directory
    const flowDirectories = fs.readdirSync(agentFlowDir);
    if (!flowDirectories || flowDirectories.length === 0) {
        console.log("No Flows found, aborting...\n");
        return;
    }

    const progressPerFlow = availableProgress / flowDirectories.length;

    // Go through all Flows and try to push them to Cognigy.AI
    for (let flow of flowDirectories) {
        await pushFlow(flow, progressPerFlow, { "timeout": 10000 });
    }
    return Promise.resolve();
};

/**
 * Pushes a Flow back to Cognigy.AI
 * @param flowName The name of the Flow to push
 * @param availableProgress How much of the progress bar can be filled by this process
 */
export const pushFlow = async (flowName: string, availableProgress: number, options?: any): Promise<void> => {
    const flowsDir = CONFIG.agentDir + "/flows";
    const flowDir = flowsDir + "/" + flowName;

    if (fs.existsSync(flowDir + "/config.json") && fs.existsSync(flowsDir + "/locales.json")) {
        const locales = JSON.parse(fs.readFileSync(flowsDir + "/locales.json").toString());

        for (let locale of locales) {
            // chart and config exist for this flow, proceed
            try {
                const flowConfig = JSON.parse(fs.readFileSync(flowDir + "/config.json").toString()),
                    flowChart = JSON.parse(fs.readFileSync(flowDir + "/" + locale.name + "/chart.json").toString()),
                    flowIntents: IIntent[] = JSON.parse(fs.readFileSync(flowDir + "/" + locale.name + "/intents.json").toString());

                const flowId = flowConfig._id;

                try {
                    await CognigyClient.updateFlow({
                        "flowId": flowId,
                        "name": flowConfig.name,
                        "localeId": locale._id
                    });
                } catch (err) {
                    console.error(`Error when updating Flow ${flowName} on Cognigy.AI: ${err.message}.\nAborting...`);
                    process.exit(0);
                }

                const progressPerNode = availableProgress / 2 / locales.length / flowChart.nodes.length;

                for (let node of flowChart.nodes) {
                    const { _id: nodeId, comment, config, isDisabled, isEntryPoint, label, localeReference } = node;
                    if (localeReference === locale._id) {
                        try {
                            await CognigyClient.updateChartNode({
                                resourceId: flowId,
                                resourceType: "flow",
                                nodeId,
                                comment,
                                config,
                                isDisabled,
                                isEntryPoint,
                                label,
                                localeId: localeReference
                            });
                        } catch (err) {
                            // console.log(`\nError when updating Chart Node ${nodeId} in Flow ${flowName} - ${err.message}`);
                            // process.exit(0);
                        }
                    }
                    addToProgressBar(progressPerNode);
                }

                if (flowIntents.length > 0) {
                    const form = new FormData();
                    form.append('mode', 'overwrite');
                    form.append('flowId', flowId);
                    form.append('localeId', locale._id);
                    form.append('file', fs.createReadStream(flowDir + "/" + locale.name + "/intents.json"));

                    // update Lexicon on Cognigy.AI
                    const result = await makeAxiosRequest({
                        path: `/new/v2.0/flows/${flowId}/intents/import`,
                        method: 'POST',
                        type: 'multipart/form-data',
                        form: form
                    });

                    await checkTask(result?.data?._id, 0, options?.timeout || 10000);
                }
                addToProgressBar(availableProgress / 2);

            } catch (err) {
                console.log(err.message);
            }
        }
    } else {
        // chart or config are missing, skip
        addToProgressBar(availableProgress);
    }
    return Promise.resolve();
};

/**
 * Compares two Flow JSON representations
 * @param flowName ID of the Flow to compare
 * @param mode full or node
 */
export const diffFlows = async (flowName: string, mode: string = 'full'): Promise<void> => {
    // check if a valid mode was selected
    if (['full', 'node'].indexOf(mode) === -1) {
        console.log(`Selected mode not supported. Supported modes:\n\n- full\n- node\n`);
        return;
    }

    const spinner = new Spinner(`Comparing ${chalk.green('local')} and ${chalk.red('remote')} Flow resource ${chalk.blueBright(flowName)}... %s`);
    spinner.setSpinnerString('|/-\\');
    spinner.start();

    const flowsDir = CONFIG.agentDir + "/flows";
    const flowDir = flowsDir + "/" + flowName;
    const localesFile = flowsDir + "/locales.json";

    if (!fs.existsSync(localesFile)) {
        spinner.stop();
        console.error(`\n\nMissing locales.json. Execute 'cognigy pull locales' to updates locales.`);
        return;
    }

    const locales: ILocaleIndexItem_2_0[] = JSON.parse(fs.readFileSync(flowsDir + "/locales.json").toString());

    for (let locale of locales) {
        // check whether Flow directory and chart.json for the Flow exist
        if (!fs.existsSync(flowDir) || !fs.existsSync(flowDir + "/" + locale.name + "/chart.json") || !fs.existsSync(flowDir + "/config.json")) {
            spinner.stop();
            console.error(`\nThe requested Flow (${chalk.blueBright(flowName)}) in locale ${chalk.yellow(locale.name)} couldn't be found locally or doesn't contain a valid config.json and chart.json`);
            return;
        }

        // retrieve local Flow chart
        const localChart = JSON.parse(fs.readFileSync(flowsDir + "/" + flowName + "/" + locale.name + "/chart.json").toString()),
            localConfig = JSON.parse(fs.readFileSync(flowsDir + "/" + flowName + "/config.json").toString());

        try {
            // retrieve remote Flow chart
            const remoteChart = await CognigyClient.readChart({
                "resourceId": localConfig._id,
                "resourceType": "flow",
                "preferredLocaleId": locale._id
            });

            // retrieve configuration for all Flow Chart Nodes and combine them into the chart
            for (let node of remoteChart.nodes) {
                const Node = await CognigyClient.readChartNode({
                    "nodeId": node._id,
                    "resourceId": localConfig._id,
                    "resourceType": "flow",
                    "preferredLocaleId": locale._id
                });
                node["config"] = Node.config;
                delete node["preview"];
            }

            // comparing Flows
            if (mode === "node") {
                // perform node-level comparison
                const localNodes: Map<string, any> = new Map();
                localChart.nodes.forEach((node) => {
                    localNodes.set(node._id.toString(), node);
                });

                const remoteNodes: Map<string, any> = new Map();
                remoteChart.nodes.forEach((node) => {
                    remoteNodes.set(node._id.toString(), node);
                });

                console.log("\n");

                let copiesAreDifferent = false;
                let differences = "";

                // compare all local Nodes to remote Nodes
                localNodes.forEach((localNode, nodeId) => {
                    const remoteNode = remoteNodes.get(nodeId);
                    if (remoteNode) {
                        const diffString = jsonDiff.diffString(remoteNode, localNode);
                        if (diffString) {
                            differences += `Node ${nodeId} (called ${localNode.label} on ${chalk.green('local')}) differs on ${chalk.red('remote')}/${chalk.green('local')}. ${diffString}`;
                            copiesAreDifferent = true;
                        }
                    }
                });

                // check which nodes exist on local that are missing on remote
                localNodes.forEach((localNode, nodeId) => {
                    const remoteNode = remoteNodes.get(nodeId);
                    if (!remoteNode) {
                        differences += `Node ${nodeId} (${localNode.label}) only exists on ${chalk.green('local')}.`;
                        differences += chalk.green(JSON.stringify(localNode, undefined, 4));
                        copiesAreDifferent = true;
                    }
                });

                // check which nodes exist only on remote and are missing on local
                remoteNodes.forEach((remoteNode, nodeId) => {
                    const localNode = localNodes.get(nodeId);
                    if (!localNode) {
                        differences += `Node ${nodeId} (${remoteNode.label}) only exists on ${chalk.red('remote')}.`;
                        differences += chalk.red(JSON.stringify(remoteNode, undefined, 4));
                        copiesAreDifferent = true;
                    }
                });

                // show results
                if (copiesAreDifferent) {
                    console.log(`\nThe Flow ${chalk.blueBright(flowName)} in locale ${chalk.yellow(locale.name)} DIFFERS on ${chalk.green('local')} and ${chalk.red('remote')}.`);
                    console.log(differences);
                } else console.log(`\nThe Flow ${chalk.blueBright(flowName)} in locale ${chalk.yellow(locale.name)} is identical on ${chalk.green('local')} and ${chalk.red('remote')}.`);
            } else {
                // perform full comparison and output results
                const diffString = jsonDiff.diffString(remoteChart, localChart);

                if (diffString) {
                    console.log(`\nThe Flow ${chalk.blueBright(flowName)} in locale ${chalk.yellow(locale.name)} DIFFERS on ${chalk.green('local')} and ${chalk.red('remote')}.`);
                    console.log(`\n${diffString}`);
                } else console.log(`\nThe Flow ${chalk.blueBright(flowName)} in locale ${chalk.yellow(locale.name)} is identical on ${chalk.green('local')} and ${chalk.red('remote')}.`);
            }
        } catch (err) {
            spinner.stop();
            console.error(err.message);
        }
    }
    spinner.stop();
};

/**
 * Trains a Flow
 * @param flowName The name of the Flow
 */
export const trainFlow = async (flowName: string, timeout: number = 10000): Promise<void> => {
    const flowsDir = CONFIG.agentDir + "/flows";
    const flowDir = flowsDir + "/" + flowName;

    let flowConfig = null;

    try {
        flowConfig = JSON.parse(fs.readFileSync(flowDir + "/config.json").toString());
    } catch (err) {
        console.log("Flow can't be found locally, aborting...");
        process.exit(0);
    }
    const locales = await pullLocales();

    for (let locale of locales) {
        const spinner = new Spinner(`Training intents for locale ${chalk.yellow(locale.name)} ... %s`);
        spinner.setSpinnerString('|/-\\');
        spinner.start();

        const result = await CognigyClient.trainIntents({
            flowId: flowConfig._id,
            localeId: locale._id
        });

        try {
            await checkTask(result._id, 0, timeout);
            console.log(`\n[${chalk.green("success")}] Intents trained for locale ${chalk.yellow(locale.name)}`);
        } catch (err) {
            console.log(`\n[${chalk.red("error")}] Intents in ${chalk.yellow(locale)} couldn't be trained within timeout period (${5 * timeout} ms)`);
        }
        spinner.stop();
    }
};

export interface ITranslateFlowOptions {
    localeName: string;
    translator: 'google' | 'microsoft' | 'deepl';
    fromLanguage: string;
    toLanguage: string;
    translateIntents: boolean;
    translateNodes: boolean;
    apiKey: string;
    forceYes: boolean;
    locale: string;
}

/**
 * 
 * @param flowName The name of the flow
 * @param fromLanguage  The locale in the flow that should be translated
 * @param targetLanguage The target langauge to translate to
 * @param translator Whether to use google, microsoft or deepl translate
 * @param apiKey The google, microsoft or deepl translate API Key
 * @param timeout The timeout for execution
 */
export const translateFlow = async (flowName: string, options: ITranslateFlowOptions): Promise<void> => {
    const { toLanguage, translator, apiKey } = options;

    const flowsDir = CONFIG.agentDir + "/flows";
    const flowDir = flowsDir + "/" + flowName;

    const localeName = options.localeName;

    const translateAll = (!options.translateIntents && !options.translateNodes);
    const translateIntents = (translateAll || options.translateIntents);
    const translateNodes = (translateAll || options.translateNodes);

    try {
        const flowConfig = JSON.parse(fs.readFileSync(flowDir + "/config.json").toString()),
            flowChart = JSON.parse(fs.readFileSync(flowDir + "/" + localeName + "/chart.json").toString());

        const targetLocale = (await pullLocales()).find((locale) => locale.name === localeName);
        const flowIntents = (await CognigyClient.indexIntents({
            flowId: flowConfig._id,
            preferredLocaleId: targetLocale._id,
            includeChildren: true
        })).items;

        // localize intents
        if (translateIntents) {
            console.log(`\nTranslating ${flowIntents.length} Intents in Flow '${flowName}'...\n`);
            startProgressBar(100);
            for (let intent of flowIntents) {
                try {
                    if (intent.localeReference === targetLocale._id) {
                        await translateIntent(intent, flowConfig._id, targetLocale, toLanguage, translator, apiKey);
                    }
                } catch (err) {
                    // if a localization throws an error, we skip
                }
                addToProgressBar(100 / flowIntents.length);
            }
            endProgressBar();
        }

        // localize Flow Nodes
        if (translateNodes) {
            console.log(`\nTranslating Flow Nodes in Flow '${flowName}'...\n`);

            startProgressBar(100);
            for (let node of flowChart.nodes) {
                const { _id: nodeId, localeReference, type } = node;
                try {
                    if (localeReference === targetLocale._id) {
                        if (['say', 'question', 'optionalQuestion'].indexOf(type) > -1) {
                            const flowNode = await translateFlowNode(node, toLanguage, translator, apiKey);
                            // update node in Cognigy.AI
                            await CognigyClient.updateChartNode({
                                nodeId: flowNode._id,
                                config: flowNode.config,
                                localeId: targetLocale._id,
                                resourceId: flowConfig._id,
                                resourceType: 'flow'
                            })
                        }
                    }
                } catch (err) {
                    console.error(err)
                    // if a localization throws an error, we skip
                }
                addToProgressBar(100 / flowChart.nodes.length);
            }
            endProgressBar();
        }

    } catch (err) {
        console.log(err);
    }
};

/**
 * Exports all strings from a Flow as CSV
 * @param availableProgress How much of the progress bar can be filled by this process
 */
export const exportFlowCSV = async (flowName: string, availableProgress: number): Promise<void> => {
    const flowsDir = CONFIG.agentDir + "/flows";
    const flowDir = flowsDir + "/" + flowName;

    if (fs.existsSync(flowDir + "/config.json") && fs.existsSync(flowsDir + "/locales.json")) {
        const locales = JSON.parse(fs.readFileSync(flowsDir + "/locales.json").toString());

        for (let locale of locales) {
            // chart and config exist for this flow, proceed
            try {
                const flowChart = JSON.parse(fs.readFileSync(flowDir + "/" + locale.name + "/chart.json").toString());

                const csvWriterContent = createArrayCsvWriter({
                    path: flowDir + "/" + locale.name + "/content.csv",
                    header: [
                        "id",
                        "label",
                        "type",
                        "subtype",
                        "localized",
                        "content"
                    ]
                });

                const contentRecords = [];

                for (let node of flowChart.nodes) {
                    const localized = (locale._id === node.localeReference);
                    switch (node.type) {
                        case "question":
                        case "optionalQuestion":
                        case "say":
                            switch (node.config.say.type) {
                                case "text":
                                    if (node.config.say.text.length === 1)
                                        contentRecords.push([
                                            node._id,
                                            node.label,
                                            node.type,
                                            node.config.say.type,
                                            localized,
                                            node.config.say.text[0]
                                        ]);
                                    else
                                        contentRecords.push([
                                            node._id,
                                            node.label,
                                            node.type,
                                            node.config.say.type,
                                            localized,
                                            JSON.stringify(node.config.say.text)
                                        ]);
                                    break;
                                default:
                                    contentRecords.push([
                                        node._id,
                                        node.label,
                                        node.type,
                                        node.config.say.type,
                                        localized,
                                        JSON.stringify(node.config.say._data)
                                    ]);
                            }
                            break;
                    }
                }

                await csvWriterContent.writeRecords(contentRecords);

            } catch (err) {

            }
        }
    }

    return Promise.resolve();
};

/**
 * Import all strings from a CSV to a Flow
 * @param availableProgress How much of the progress bar can be filled by this process
 */
export const importFlowCSV = async (flowName: string, availableProgress: number): Promise<void> => {
    const flowsDir = CONFIG.agentDir + "/flows";
    const flowDir = flowsDir + "/" + flowName;

    if (fs.existsSync(flowDir + "/config.json") && fs.existsSync(flowsDir + "/locales.json")) {
        const locales = JSON.parse(fs.readFileSync(flowsDir + "/locales.json").toString());

        for (let locale of locales) {
            // chart and config exist for this flow, proceed
            try {
                if (!fs.existsSync(flowDir + "/" + locale.name + "/content.csv"))
                    break;

                // create Map of Nodes in CSV
                const nodeMap = new Map();
                await new Promise((resolve, reject) => {
                    fs.createReadStream(flowDir + "/" + locale.name + "/content.csv")
                        .pipe(csv())
                        .on('data', (data) => {
                            nodeMap.set(data.id, data);
                        })
                        .on('end', () => resolve(null));
                });

                const flowChart = JSON.parse(fs.readFileSync(flowDir + "/" + locale.name + "/chart.json").toString());

                for (let node of flowChart.nodes) {
                    const localized = (locale._id === node.localeReference);
                    if (localized) {
                        const csvData = nodeMap.get(node._id);
                        if (csvData) {
                            try {
                                let parsedContent = csvData.content;
                                try {
                                    parsedContent = JSON.parse(csvData.content);
                                } catch (err) { }

                                switch (node.type) {
                                    case "question":
                                    case "optionalQuestion":
                                    case "say":
                                        switch (node.config.say.type) {
                                            case "text":
                                                if (Array.isArray(parsedContent))
                                                    node.config.say.text = parsedContent;
                                                else
                                                    node.config.say.text = [parsedContent];
                                                break;

                                            default:
                                                if (typeof parsedContent === 'object') {
                                                    node.config.say._cognigy = parsedContent?._cognigy;
                                                }
                                        }
                                        break;
                                }
                            } catch (err) {
                                console.log(`\n[${chalk.red("error")}] Failed to update Node ${node._id} in ${chalk.yellow(locale.name)} with error ${err.message}`);
                            }
                        }
                    }
                }

                fs.writeFileSync(flowDir + "/" + locale.name + "/chart.json", JSON.stringify(flowChart, undefined, 4));

            } catch (err) {

            }
        }
    }

    return Promise.resolve();
};

/**
 * Adds localization to Flow Intents and Nodes
 * @param availableProgress How much of the progress bar can be filled by this process
 */
export const localizeFlow = async (flowName: string, availableProgress: number, options): Promise<void> => {
    const flowsDir = CONFIG.agentDir + "/flows";
    const flowDir = flowsDir + "/" + flowName;

    const localeName = options.localeName;
    const sourceLocaleName = options.sourceLocale;

    const localizeAll = (!options.localizeIntents && !options.localizeNodes);
    const localizeIntents = (localizeAll || options.localizeIntents);
    const localizeNodes = (localizeAll || options.localizeNodes);

    try {
        const primaryLocale = (await pullLocales()).find((locale) => locale.primary === true);
        const targetLocale = (await pullLocales()).find((locale) => locale.name === localeName);
        const sourceLocale = (await pullLocales()).find((locale) => locale.name === sourceLocaleName);

        const flowConfig = JSON.parse(fs.readFileSync(flowDir + "/config.json").toString()),
            flowChart = JSON.parse(fs.readFileSync(flowDir + "/" + localeName + "/chart.json").toString()),
            flowIntents: IIntent[] = JSON.parse(fs.readFileSync(flowDir + "/" + primaryLocale.name + "/intents.json").toString());

        if (sourceLocaleName && !sourceLocale) {
            console.log(`\nSource Locale ${sourceLocaleName} doesn't exist. Please check the spelling and try again.\n`);
            process.exit(0);
        }

        // localize intents
        if (localizeIntents) {

            let allIntents = await indexAll(CognigyClient.indexIntents)({
                flowId: flowConfig._id,
                preferredLocaleId: primaryLocale._id
            });

            console.log(`\n${options.reverse ? 'Removing localization from' : 'Adding localization to'} Intents...\n`);
            startProgressBar(100);
            for (let intent of allIntents.items) {
                try {
                    if (options.reverse) {
                        await CognigyClient.removeIntentLocalization({
                            flowId: flowConfig._id,
                            intentId: intent._id,
                            localeId: targetLocale._id
                        });
                    } else {
                        await CognigyClient.addIntentLocalization({
                            flowId: flowConfig._id,
                            intentId: intent._id,
                            localeId: targetLocale._id,
                            inheritFromLocaleId: sourceLocale?._id
                        });
                    }
                } catch (err) {
                    // if a localization throws an error, we skip
                }
                addToProgressBar(100 / flowIntents.length);
            }
            endProgressBar();
        }

        // localize Flow Nodes
        if (localizeNodes) {
            const onlyLocalizeContentNodes = options.contentOnly;

            console.log(`\n${options.reverse ? 'Removing localization from' : 'Adding localization to'} Flow Nodes...\n`);

            startProgressBar(100);
            for (let node of flowChart.nodes) {
                const { _id: nodeId, localeReference, type } = node;
                try {
                    if (options.reverse) {
                        if (localeReference === targetLocale._id) {
                            await CognigyClient.removeChartNodeLocalization({
                                localeId: targetLocale._id,
                                nodeId,
                                resourceId: flowConfig._id,
                                resourceType: 'flow'
                            });
                        }
                    } else {
                        if (localeReference !== targetLocale._id) {
                            if (!onlyLocalizeContentNodes || ['say', 'question', 'optionalQuestion'].indexOf(type) > -1) {
                                await CognigyClient.addChartNodeLocalization({
                                    localeId: targetLocale._id,
                                    nodeId,
                                    resourceId: flowConfig._id,
                                    resourceType: 'flow',
                                    inheritFromLocaleId: sourceLocale?._id
                                });
                            }
                        }
                    }
                } catch (err) {
                    // if a localization throws an error, we skip
                }
                addToProgressBar(100 / flowChart.nodes.length);
            }
            endProgressBar();
        }

    } catch (err) {

    }

    return Promise.resolve();
};

/**
 * Translates an Intent
 * @param intent The Intent to translate
 * @param flowId Flow ID where the Intent lives
 * @param targetLocale Target locale to manipulate
 * @param toLanguage Language to translate to
 * @param translator Translator to use
 * @param apiKey apikey for the translator
 */
export const translateIntent = async (intent: any, flowId, targetLocale, toLanguage, translator, apiKey): Promise<void> => {
    const intentData = await CognigyClient.readIntent({
        intentId: intent._id,
        flowId,
        preferredLocaleId: targetLocale._id
    });

    // translate default reply
    if (intentData.data) {
        try {
            intentData.data = await translateSayNode(intentData.data, toLanguage, translator, apiKey);
            await CognigyClient.updateIntent({
                intentId: intent._id,
                flowId,
                localeId: targetLocale._id,
                data: intentData.data
            });
        } catch (err) {
            console.log(`${chalk.red('error')}: ${err.message}`);
        }
    }

    const flowIntentSentences = await indexAll(CognigyClient.indexSentences)({
        flowId,
        intentId: intent._id,
        preferredLocaleId: targetLocale._id
    });

    let intentSentences: any[] = [];
    if (flowIntentSentences && flowIntentSentences.items && flowIntentSentences.items.length > 0) {
        intentSentences = await Promise.all(
            flowIntentSentences.items.map(async sentence => {
                return await CognigyClient.readSentence({
                    flowId,
                    intentId: intent._id,
                    sentenceId: sentence._id
                });
            })
        );
    }

    try {
        for (let sentence of intentSentences) {
            // translate the current example sentence of the current intent
            sentence = await translateIntentExampleSentence(sentence, toLanguage, translator, apiKey)

            try {
                // update example sentence in Cognigy.AI
                // @ts-ignore
                await CognigyClient.updateSentence({
                    flowId,
                    intentId: intent._id,
                    sentenceId: sentence._id,
                    text: sentence.text
                });
            } catch (error) {
                console.log(JSON.stringify(error))
                console.log(`Failed to update ${intent.name} intent`);
            }
        }
    } catch (err) { }
};
