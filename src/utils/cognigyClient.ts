import Cognigy from '@cognigy/rest-api-client';
import { RequestPromiseAdapter } from '../utils/RequestPromiseAdapter';
import CONFIG from './config';


const CognigyClient = new Cognigy({
    httpAdapter: new RequestPromiseAdapter({
        "baseUrl": CONFIG.baseUrl,
        // @ts-ignore
        numberOfRetries: 10
    }),
    "baseUrl": CONFIG.baseUrl,
    numberOfRetries: 10
});

CognigyClient.setCredentials({
    "type": "ApiKey",
    "apiKey": CONFIG.apiKey
});

export default CognigyClient;