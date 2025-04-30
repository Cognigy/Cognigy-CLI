import Cognigy from '@cognigy/rest-api-client';
import * as fs from 'fs';
import * as path from 'path';
import CONFIG from './config';
import { RestAdapter } from './RestAdapter';

// Read package.json to get the CLI version
let cliVersion = 'unknown';
try {
  const packageJsonPath = path.join(__dirname, '..', '..', 'package.json');
  const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
  cliVersion = JSON.parse(packageJsonContent).version;
} catch (error) {
  console.error('Error reading package.json for CLI version:', error);
}

const CognigyClient = new Cognigy({
  httpAdapter: new RestAdapter(
    {},
    { retries: 10 },
    cliVersion,
    CONFIG.agent // Assuming CONFIG.agent is the project/agent ID
  ),
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
