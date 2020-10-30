import * as fs from 'fs';

import CONFIG from '../utils/config';
import CognigyClient from '../utils/cognigyClient';
import { indexAll } from '../utils/indexAll';
import chalk = require('chalk');

/**
 * Updates locales definitons from server (every x seconds)
 * @param cacheTime Seconds to cache locales
 */ 
export const pullLocales = async (cacheTime: number = 10) => {
    const localesLocation = CONFIG.agentDir + "/flows/locales.json";

    let localesAge = cacheTime + 1;
    let locales = null;

    /* Check if locales.json exists */
    if (fs.existsSync(localesLocation)) {
        const stats = fs.statSync(localesLocation);
        const mtime = stats.mtime;
        localesAge = (new Date().getTime() - mtime.getTime()) / 1000;
    }

    /* If locales are stale, update them from server */
    if (localesAge > cacheTime) {
        const localeResult = await indexAll(CognigyClient.indexLocales)({
            projectId: CONFIG.agent
        });
        locales = localeResult.items;

        fs.writeFileSync(localesLocation, JSON.stringify(localeResult.items, undefined, 4));
    } else {
        locales = JSON.parse(fs.readFileSync(localesLocation).toString());
    }

    return locales;
};

export const createLocale = async (localeName, fallbackLocale, nluLanguage) => {
    console.log(JSON.stringify({
        "name": localeName,
        "nluLanguage": nluLanguage,
        "fallbackLocaleReference": fallbackLocale,
        "projectId": CONFIG.agent
    }, undefined, 4));

    try {
        await CognigyClient.createLocale({
            "name": localeName,
            "nluLanguage": nluLanguage,
            "fallbackLocaleReference": fallbackLocale,
            "projectId": CONFIG.agent
        });

        await pullLocales();

        console.log(`\n[${chalk.green("success")}] Created Locale ${localeName} on Cognigy.AI - Enjoy.`);
    } catch (err) {
        console.log(`\n[${chalk.red("error")}] ${err.message}`);
        process.exit(0);
    }

}