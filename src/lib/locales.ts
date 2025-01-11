import * as fs from 'fs';
import chalk = require('chalk');

import CognigyClient from '../utils/cognigyClient';
import CONFIG from '../utils/config';
import { indexAll } from '../utils/indexAll';

import { TNLULanguage_2_0 } from '@cognigy/rest-api-client';
import { ILocaleIndexItem_2_0 } from '@cognigy/rest-api-client';

/**
 * Updates locales definitons from server (every x seconds)
 * @param cacheTime Seconds to cache locales
 */
export const pullLocales = async (
  cacheTime: number = 10
): Promise<ILocaleIndexItem_2_0[]> => {
  const localesLocation = CONFIG.agentDir + '/flows/locales.json';

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
      projectId: CONFIG.agent,
    });
    locales = localeResult.items;

    fs.writeFileSync(
      localesLocation,
      JSON.stringify(localeResult.items, undefined, 4)
    );
  } else {
    locales = JSON.parse(fs.readFileSync(localesLocation).toString());
  }

  return locales;
};

/**
 * Creates a new locale in a project
 * @param localeName The name of the new locale
 * @param fallbackLocale Fallback Locale to use
 * @param nluLanguage NLU Language to set
 */
export const createLocale = async (
  localeName: string,
  fallbackLocale: string,
  nluLanguage: TNLULanguage_2_0
) => {
  try {
    await CognigyClient.createLocale({
      name: localeName,
      nluLanguage: nluLanguage,
      fallbackLocaleReference: fallbackLocale,
      projectId: CONFIG.agent,
    });

    await pullLocales();

    console.log(
      `\n[${chalk.green('success')}] Created Locale ${localeName} on Cognigy.AI - Enjoy.`
    );
  } catch (err) {
    console.log(`\n[${chalk.red('error')}] ${err.message}`);
    process.exit(0);
  }
};
