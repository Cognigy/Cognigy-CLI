/* Node modules */
import { expect } from "chai";
import * as sinon from "sinon";

/* Custom Modules */
import { program } from '../program';
import * as  init from '../commands/init';
import * as  restore from '../commands/restore';
import * as  clone from '../commands/clone';
import * as  push from '../commands/push';
import * as  pull from '../commands/pull';
import * as  train from '../commands/train';
import * as  create from '../commands/create';

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

    describe.only("CLONE CMD", () => {
        let cloneStub: sinon.SinonStub;

        beforeEach(() => {
            cloneStub = sandbox.stub(clone, "clone");
        });

        it("Should call the clone method and pass basic compulsory params resourceType and resourceName", () => {
            program.parse(["", "cognigy", "clone","flow", "main"]);

            console.log(cloneStub.firstCall.args)
            expect(cloneStub.called).to.be.true;
            expect(cloneStub.firstCall.args[0].resourceType, "Clone function should have the correct params").to.be.equal('flow');
            expect(cloneStub.firstCall.args[0].resourceName, "Clone function should have the correct params").to.be.equal('main');
        });
    });

    describe("RESTORE CMD", () => {
        let restoreStub: sinon.SinonStub;

        beforeEach(() => {
            restoreStub = sandbox.stub(restore, "restore");
        });

        it("Should call the restore method and pass basic compulsory params resourceType", () => {
            program.parse(["", "cognigy", "restore","flow"]);

            expect(restoreStub.called).to.be.true;
            expect(restoreStub.firstCall.args[0].resourceType, "Restore function should have the correct params").to.be.equal('flow');
        });
    });

    describe("DIFF CMD", () => {
        let diffStub: sinon.SinonStub;

        beforeEach(() => {
            diffStub = sandbox.stub(restore, "restore");
        });

        it("Should call the diff method and pass basic compulsory params resourceType and resourceId", () => {
            program.parse(["", "cognigy", "diff","flow", "6273f386ae217b0de51b3995"]);

            expect(diffStub.called).to.be.true;
            expect(diffStub.firstCall.args[0].resourceType, "diff function should have the correct params").to.be.equal('flow');
            expect(diffStub.firstCall.args[0].resourceId, "diff function should have the correct params").to.be.equal('6273f386ae217b0de51b3995');
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

        it("Should call the train method and pass basic compulsory params resourceType and resourceName", () => {
            program.parse(["", "cognigy", "train","flow", "main"]);

            expect(trainStub.called).to.be.true;
            expect(trainStub.firstCall.args[0].resourceType, "Train function should have the correct params").to.be.equal('flow');
            expect(trainStub.firstCall.args[0].resourceName, "Train function should have the correct params").to.be.equal('main');
        });
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
    })
})