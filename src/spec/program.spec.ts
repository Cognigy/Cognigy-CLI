/* Node modules */
import { expect } from "chai";
import * as sinon from "sinon";

/* Custom Modules */
import { program } from '../program';
import * as  init from '../commands/init';
import * as  restore from '../commands/restore';
import * as  diff from '../commands/diff';
import * as  clone from '../commands/clone';
import * as  push from '../commands/push';
import * as  pull from '../commands/pull';
import * as  train from '../commands/train';
import * as  create from '../commands/create';
import * as  exportcsv from '../commands/exportcsv';
import * as  importcsv from '../commands/importcsv';
import * as  localize from '../commands/localize';
import * as translate from '../commands/translate';
import * as execute from '../commands/execute';

describe("cognigy CLI commands", () => {
    const sandbox: sinon.SinonSandbox = sinon.createSandbox();

    let stdOutWriteStub: sinon.SinonStub;
    
	beforeEach(() => {
		sinon.restore();

        stdOutWriteStub = sandbox.stub(process, "stdout");
	});

	afterEach(() => {
		sandbox.restore();
	});

    describe("INIT CMD", () => {
        let initStub: sinon.SinonStub;

        beforeEach(() => {
            initStub = sandbox.stub(init, "init");
        });

        it("Should call the init method", () => {
            program.parse(["", "cognigy", "init"]);

            expect(initStub.called).to.be.true;
        });
    });

    describe("CLONE CMD", () => {
        let cloneStub: sinon.SinonStub;

        beforeEach(() => {
            cloneStub = sandbox.stub(clone, "clone");
        });

        it("Should call the clone method and pass basic compulsory params resourceType", () => {
            program.parse(["", "cognigy", "clone", "-t", "flow"]);

            expect(cloneStub.called).to.be.true;
            expect(cloneStub.firstCall.args[0].resourceType, "Clone function should have the correct params").to.be.equal('flow');
        });
    });

    describe("RESTORE CMD", () => {
        let restoreStub: sinon.SinonStub;

        beforeEach(() => {
            restoreStub = sandbox.stub(restore, "restore");
        });

        it("Should call the restore method and pass basic compulsory params resourceType", () => {
            program.parse(["", "cognigy", "restore","-t", "flow"]);

            expect(restoreStub.called).to.be.true;
            expect(restoreStub.firstCall.args[0].resourceType, "Restore function should have the correct params").to.be.equal('flow');
        });
    });

    describe("DIFF CMD", () => {
        let diffStub: sinon.SinonStub;

        beforeEach(() => {
            diffStub = sandbox.stub(diff, "diff");
        });

        it("Should call the diff method and pass basic compulsory params resourceType and resourceId", () => {
            program.parse(["", "cognigy", "diff","flow", "6273f386ae217b0de51b3995"]);
            expect(diffStub.called).to.be.true;
            expect(diffStub.firstCall.args[0], "diff function should have the correct params").to.be.equal('flow');
            expect(diffStub.firstCall.args[1], "diff function should have the correct params").to.be.equal('6273f386ae217b0de51b3995');
        });
    });

    describe("PUSH CMD", () => {
        let pushStub: sinon.SinonStub;

        beforeEach(() => {
            pushStub = sandbox.stub(push, "push");
        });

        it("Should call the push method and pass basic compulsory params resourceType and resourceName", () => {
            program.parse(["", "cognigy", "push","flow", "main"]);

            expect(pushStub.called).to.be.true;
            expect(pushStub.firstCall.args[0].resourceType, "Push function should have the correct params").to.be.equal('flow');
            expect(pushStub.firstCall.args[0].resourceName, "Push function should have the correct params").to.be.equal('main');
        });
    });

    describe("PULL CMD", () => {
        let pullStub: sinon.SinonStub;

        beforeEach(() => {
            pullStub = sandbox.stub(pull, "pull");
        });

        it("Should call the pull method and pass basic compulsory params resourceType and resourceName", () => {
            program.parse(["", "cognigy", "pull","flow", "main"]);

            expect(pullStub.called).to.be.true;
            expect(pullStub.firstCall.args[0].resourceType, "Pull function should have the correct params").to.be.equal('flow');
            expect(pullStub.firstCall.args[0].resourceName, "Pull function should have the correct params").to.be.equal('main');
        });
    });

    describe("TRAIN CMD", () => {
        let trainStub: sinon.SinonStub;

        beforeEach(() => {
            trainStub = sandbox.stub(train, "train");
        });

        it("Should call the train method and pass basic compulsory params resourceName", () => {
            program.parse(["", "cognigy", "train", "flow", "main"]);

            expect(trainStub.called).to.be.true;
            expect(trainStub.firstCall.args[0].resourceName, "Train function should have the correct params").to.be.equal('main');        });
    });

    describe("CREATE CMD", () => {
        let createStub: sinon.SinonStub;

        beforeEach(() => {
            createStub = sandbox.stub(create, "create");
        });

        it("Should call the create method and pass basic compulsory params resourceType and resourceName", () => {
            program.parse(["", "cognigy", "create","flow", "main"]);

            expect(createStub.called).to.be.true;
            expect(createStub.firstCall.args[0].resourceType, "Create function should have the correct params").to.be.equal('flow');
            expect(createStub.firstCall.args[0].resourceName, "Create function should have the correct params").to.be.equal('main');
        });
    });

    describe("EXPORTCSV CMD", () => {
        let exportCSVStub: sinon.SinonStub;

        beforeEach(() => {
            exportCSVStub = sandbox.stub(exportcsv, "exportcsv");
        });

        it("Should call the exportcsv method and pass basic compulsory params resourceType", () => {
            program.parse(["", "cognigy", "exportcsv","flow"]);

            expect(exportCSVStub.called).to.be.true;
            expect(exportCSVStub.firstCall.args[0].resourceType, "ExportCSV function should have the correct params").to.be.equal('flow');
        });
    });

    describe("IMPORTCSV CMD", () => {
        let importCSVStub: sinon.SinonStub;

        beforeEach(() => {
            importCSVStub = sandbox.stub(importcsv, "importcsv");
        });

        it("Should call the importcsv method and pass basic compulsory params resourceType", () => {
            program.parse(["", "cognigy", "importcsv","flow"]);

            expect(importCSVStub.called).to.be.true;
            expect(importCSVStub.firstCall.args[0].resourceType, "ImportCSV function should have the correct params").to.be.equal('flow');
        });
    });

    describe("LOCALIZE CMD", () => {
        let localizeStub: sinon.SinonStub;

        beforeEach(() => {
            localizeStub = sandbox.stub(localize, "localize");
        });

        it("Should call the localize method and pass basic compulsory params resourceType and resourceName", () => {
            program.parse(["", "cognigy", "localize","flow", "main"]);

            expect(localizeStub.called).to.be.true;
            expect(localizeStub.firstCall.args[0].resourceType, "Localize function should have the correct params").to.be.equal('flow');
            expect(localizeStub.firstCall.args[0].resourceName, "Localize function should have the correct params").to.be.equal('main');

        });
    });

    describe("TRANSLATE CMD", () => {
        let translateStub: sinon.SinonStub;

        beforeEach(() => {
            translateStub = sandbox.stub(translate, "translate");
        });

        it("Should call the translate method and pass basic compulsory params resourceType and resourceName", () => {
            program.parse(["", "cognigy", "translate","flow", "main"]);

            expect(translateStub.called).to.be.true;
            expect(translateStub.firstCall.args[0].resourceType, "Translate function should have the correct params").to.be.equal('flow');
            expect(translateStub.firstCall.args[0].resourceName, "Translate  function should have the correct params").to.be.equal('main');

        });
    });

    describe("EXECUTE CMD", () => {
        let executeStub: sinon.SinonStub;

        beforeEach(() => {
            executeStub = sandbox.stub(execute, "execute");
        });

        it("Should call the execute method and pass basic compulsory params resourceType and resourceName", () => {
            program.parse(["", "cognigy", "execute", "readFlow", "-d", '{"flowId": "5f5618bce35138ed3ab9ab9a"}']);
            console.log(JSON.parse(executeStub.firstCall.args[0].options.data))
            console.log(JSON.parse(executeStub.firstCall.args[0].options.data).flowId)
            expect(executeStub.called).to.be.true;
            expect(executeStub.firstCall.args[0].command, "Execute function should have the correct params").to.be.equal('readFlow');
            expect(JSON.parse(executeStub.firstCall.args[0].options.data).flowId, "Execute function should have the correct params").to.be.equal('5f5618bce35138ed3ab9ab9a');
        });
    });
})