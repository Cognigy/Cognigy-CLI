import { expect } from 'chai';
import * as sinon from 'sinon';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import axios from 'axios';
import * as lexiconsObj from '../../lib/lexicons';
import CognigyClient from '../../utils/cognigyClient';
import * as checksObj from '../../utils/checks';
import CONFIG from '../../utils/config';

describe('Lexicons Library', () => {
  const sandbox: sinon.SinonSandbox = sinon.createSandbox();
  let tempDir: string;
  let originalAgentDir: string;

  beforeEach(() => {
    // Create a temporary directory for testing
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cognigy-cli-test-'));

    // Save original agent dir and override with temp dir
    originalAgentDir = CONFIG.agentDir;
    CONFIG.agentDir = tempDir;

    // Mock console to prevent noise
    sandbox.stub(console, 'log');
  });

  afterEach(() => {
    sandbox.restore();

    // Restore config
    CONFIG.agentDir = originalAgentDir;

    // Clean up temp directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('diffLexicons', () => {
    it('Should verify download sequence: export -> checkTask -> downloadLink -> download', async () => {
      // Test data
      const lexiconName = 'test-lexicon';
      const lexiconId = 'lexicon-123';
      const taskId = 'task-456';
      const downloadUrl = 'https://api.cognigy.ai/download/csv';
      const localContent = '"local","content"\n';
      const remoteContent = '"remote","content"\n';

      // Setup directory structure in temp dir
      const lexiconDir = path.join(tempDir, 'lexicons', lexiconName);
      fs.mkdirSync(lexiconDir, { recursive: true });

      // Write local files
      fs.writeFileSync(
        path.join(lexiconDir, 'config.json'),
        JSON.stringify({ lexiconId })
      );
      fs.writeFileSync(path.join(lexiconDir, 'keyphrases.csv'), localContent);

      // Mock Cognigy Client calls
      sandbox
        .stub(CognigyClient, 'readLexicon')
        .resolves({ _id: lexiconId } as any);

      const exportStub = sandbox
        .stub(CognigyClient, 'exportFromLexicon')
        .resolves({ _id: taskId } as any);

      const checkTaskStub = sandbox.stub(checksObj, 'checkTask').resolves();

      const downloadLinkStub = sandbox
        .stub(CognigyClient, 'composeLexiconDownloadLink')
        .resolves({ downloadLink: downloadUrl });

      // Mock Axios for file download
      const axiosStub = sandbox
        .stub(axios, 'get')
        .resolves({ data: remoteContent });

      // Execute function
      await lexiconsObj.diffLexicons(lexiconName, 'full');

      // Verify the critical sequence (The Fix)
      // 1. Should start export task
      expect(exportStub.calledOnce).to.be.true;
      expect(exportStub.firstCall.args[0]).to.include({ lexiconId });

      // 2. Should wait for task completion
      expect(checkTaskStub.calledOnce).to.be.true;
      expect(checkTaskStub.firstCall.args[0]).to.equal(taskId);

      // 3. Should get download link
      expect(downloadLinkStub.calledOnce).to.be.true;
      expect(downloadLinkStub.firstCall.args[0]).to.deep.equal({ lexiconId });

      // 4. Should download the actual content using the link
      expect(axiosStub.calledOnce).to.be.true;
      expect(axiosStub.firstCall.args[0]).to.equal(downloadUrl);
    });
  });
});
