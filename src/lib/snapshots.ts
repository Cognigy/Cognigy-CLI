import CONFIG from '../utils/config';
import CognigyClient from '../utils/cognigyClient';
import { checkCreateDir, checkTask } from '../utils/checks';
import { Spinner }  from 'cli-spinner';

import axios from 'axios';
import * as fs from 'fs';

/**
 * Creates a Snapshot
 */
export const createSnapshot = async (name: string, description: string, timeout: number, skipDownload: boolean): Promise<void> => {
    const snapshotDir = CONFIG.agentDir + "/snapshots";
    await checkCreateDir(snapshotDir);

    const spinner = new Spinner(`Creating Cognigy.AI Snapshot ${name} ... %s`);
    spinner.setSpinnerString('|/-\\');
    try {
        spinner.start();

        const createSnapshotTask = await CognigyClient.createSnapshot({
            projectId: CONFIG.agent,
            description: description || 'Created by Cognigy.AI CLI',
            name: name
        });

        await checkTask(createSnapshotTask._id, timeout);

        const allSnapshots = await CognigyClient.indexSnapshots({
            projectId: CONFIG.agent
        });

        let snap = allSnapshots.items.find((snap) => snap.name === name );
        if (!snap) throw(new Error("Snapshot can't be found remotely"));

        if (!skipDownload) {
            const prepareSnapshotTask = await CognigyClient.packageSnapshot({
                snapshotId: snap._id
            });

            spinner.setSpinnerTitle(`Packaging Snapshot for download... %s`);

            await checkTask(prepareSnapshotTask._id, timeout);

            const downloadLink = await CognigyClient.composeSnapshotDownloadLink({
                snapshotId: snap._id
            });

            spinner.setSpinnerTitle(`Downloading Snapshot ... %s`);
            const snapshotFile = (await axios.get(downloadLink.downloadLink, {responseType: 'arraybuffer'})).data;

            fs.writeFileSync(snapshotDir + '/' + snap.name + '.csnap', snapshotFile);
        }

        spinner.stop();
        return;
    } catch (err) {
        spinner.stop();
        throw(err);
    }
};
