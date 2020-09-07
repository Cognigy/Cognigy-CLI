import Cognigy from '@cognigy/rest-api-client';
import { RequestPromiseAdapter } from '../utils/RequestPromiseAdapter';
import CONFIG from './config';

const CognigyClient = new Cognigy({
    httpAdapter: new RequestPromiseAdapter({
        "baseUrl": CONFIG.baseUrl
    }),
    "baseUrl": CONFIG.baseUrl
});

CognigyClient.setCredentials({
    "type": "ApiKey",
    "apiKey": CONFIG.apiKey
});

export default CognigyClient;