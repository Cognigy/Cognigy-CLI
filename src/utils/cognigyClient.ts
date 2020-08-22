import Cognigy from '@cognigy/rest-api-client';
import CONFIG from './config';

const CognigyClient = new Cognigy({
    "baseUrl": CONFIG.baseUrl
});

CognigyClient.setCredentials({
    "type": "ApiKey",
    "apiKey": CONFIG.apiKey
});

export default CognigyClient;