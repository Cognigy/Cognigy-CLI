import Cognigy from '@cognigy/rest-api-client';
import CONFIG from './config';
import { RestAdapter } from './RestAdapter';

const CognigyClient = new Cognigy({
  httpAdapter: new RestAdapter({}, { retries: 10 }),
  baseUrl: CONFIG.baseUrl,
  numberOfRetries: 10,
  versions: {
    administration: '2.0',
    external: '2.0',
    metrics: '2.0',
    resources: '2.0',
    sessions: '2.0',
  },
});

CognigyClient.setCredentials({
  type: 'ApiKey',
  apiKey: CONFIG.apiKey,
});

export default CognigyClient;
