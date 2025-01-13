/* Node modules */
import { expect } from 'chai';
import * as sinon from 'sinon';
import { pull } from '../../commands/pull';

/* Custom Modules */
import * as flowsObj from '../../lib/flows';
import * as endpointsObj from '../../lib/endpoints';
import * as localesObj from '../../lib/locales';
import * as lexiconsObj from '../../lib/lexicons';
import * as extensionsObj from '../../lib/extensions';
import * as aiagentsObj from '../../lib/aiagents';
import * as checksObj from '../../utils/checks';

describe('Pull spec command', () => {
  const sandbox: sinon.SinonSandbox = sinon.createSandbox();

  let checkCreateDirStub: sinon.SinonStub;
  let checkProjStub: sinon.SinonStub;

  beforeEach(() => {
    sinon.restore();
    checkCreateDirStub = sandbox.stub(checksObj, 'checkCreateDir');
    checkProjStub = sandbox.stub(checksObj, 'checkProject');

    checkCreateDirStub.resolves(true);
    checkProjStub.resolves(true);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('Pull Flow', () => {
    let pullFlowSub: sinon.SinonStub;

    beforeEach(() => {
      pullFlowSub = sandbox.stub(flowsObj, 'pullFlow');
      pullFlowSub.resolves(true);
    });

    it('Should allow pulling flow resourceType', async () => {
      await pull({
        resourceType: 'flow',
        resourceName: 'flow-name',
        forceYes: true,
      });

      expect(pullFlowSub.called).to.be.true;
      expect(pullFlowSub.firstCall.args).to.be.deep.equal(['flow-name', 100]);
    });
  });

  describe('Pull endpoint', () => {
    let pullEndPointSub: sinon.SinonStub;

    beforeEach(() => {
      pullEndPointSub = sandbox.stub(endpointsObj, 'pullEndpoint');
      pullEndPointSub.resolves(true);
    });

    it('Should allow pulling endpoint resourceType', async () => {
      await pull({
        resourceType: 'endpoint',
        resourceName: 'endpoint-name',
        forceYes: true,
      });

      expect(pullEndPointSub.called).to.be.true;
      expect(pullEndPointSub.firstCall.args).to.be.deep.equal([
        'endpoint-name',
        100,
      ]);
    });
  });

  describe('Pull lexicon', () => {
    let pullLexiconStub: sinon.SinonStub;

    beforeEach(() => {
      pullLexiconStub = sandbox.stub(lexiconsObj, 'pullLexicon');
      pullLexiconStub.resolves(true);
    });

    it('Should allow pulling lexicon resourceType', async () => {
      await pull({
        resourceType: 'lexicon',
        resourceName: 'lexicon-name',
        forceYes: true,
      });

      expect(pullLexiconStub.called).to.be.true;
      expect(pullLexiconStub.firstCall.args).to.be.deep.equal([
        'lexicon-name',
        100,
      ]);
    });
  });

  describe('Pull locales', () => {
    let pullLocalesStub: sinon.SinonStub;

    beforeEach(() => {
      pullLocalesStub = sandbox.stub(localesObj, 'pullLocales');
    });

    it('Should allow pulling locales resourceType', async () => {
      await pull({
        resourceType: 'locales',
        resourceName: 'locales-name',
        forceYes: true,
      });

      expect(pullLocalesStub.called).to.be.true;
    });
  });

  describe('Pull extensions', () => {
    let pullExtensionsStub: sinon.SinonStub;

    beforeEach(() => {
      pullExtensionsStub = sandbox.stub(extensionsObj, 'pullExtensions');
      pullExtensionsStub.resolves(true);
    });

    it('Should allow pulling extensions resourceType', async () => {
      await pull({
        resourceType: 'extensions',
        resourceName: 'extensions-name',
        forceYes: true,
      });

      expect(pullExtensionsStub.called).to.be.true;
    });
  });

  describe('Pull AI Agent', () => {
    let pullAiAgentStub: sinon.SinonStub;

    beforeEach(() => {
      pullAiAgentStub = sandbox.stub(aiagentsObj, 'pullAiAgent');
      pullAiAgentStub.resolves(true);
    });

    it('Should allow pulling aiAgent resourceType with name', async () => {
      await pull({
        resourceType: 'aiAgent',
        resourceName: 'agent-name',
        forceYes: true,
      });

      expect(pullAiAgentStub.called).to.be.true;
      expect(pullAiAgentStub.firstCall.args).to.be.deep.equal(['agent-name']);
    });
  });

  describe('Pull unrecognised resourceType', () => {
    it('Should throw an error', async () => {
      try {
        await pull({
          resourceType: 'wierd-resource-type',
          resourceName: 'wierd-resource--name',
          forceYes: true,
        });
        expect.fail();
      } catch (e) {
        expect(e, 'Throws an Error').to.be.instanceOf(Error);
        expect(e.message, 'Throws an Error').to.be.equal(
          `Resource type wierd-resource-type can't be pulled.`
        );
      }
    });
  });
});
