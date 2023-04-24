import CONFIG from '../utils/config';
import CognigyClient from '../utils/cognigyClient';
import * as fs from 'fs';

interface Playbook {
    playbookId: string;
    entrypoint: string;
    flowId: string;
    localeId: string;
};

interface PlaybookRun { 
    playbookId: string;
    taskId: string;
}

/**
 * Runs all playbooks in the playbooks.json or provided file
 * @param playbookFile The file containing the playbooks to run - optional
 */
export const runPlaybooks = async (playbookFile: string): Promise<void> => {
    const playbooksFile = playbookFile || "./playbooks.json";

    if (!fs.existsSync(playbooksFile)) {
        console.log(`File ${playbookFile} not found. Exiting.`);
        process.exit(99);
    }
    
    // Read the playbooks.json file
    const playbooksArray: Playbook[] = JSON.parse(fs.readFileSync(playbooksFile).toString());;

    const scheduledPlaybookRuns: { playbookId: string, taskId: string }[] = [];

  // Schedule all playbooks
  for (const playbook of playbooksArray) {
    const result = await CognigyClient.schedulePlaybook(playbook);
    scheduledPlaybookRuns.push({ playbookId: playbook.playbookId, taskId: result._id });
  }

  // Check the status of all playbooks
  const playbookRunResults = await checkPlaybookRuns(scheduledPlaybookRuns, 0);

  fs.writeFileSync("playbookRunResults.json", JSON.stringify(playbookRunResults.playbookRunStatuses, null, 2));

  // Display the runstatus
  if (playbookRunResults.status === "successful") {
    console.log(`SUCCESS - all ${playbookRunResults.playbookRunStatuses.length} playbooks were executed successfully.`);
    process.exit(0);
  } else if (playbookRunResults.status === "failure"){
    console.log(`FAILURE - see playbookRunResults.json for details`);
    process.exit(1);
  } else {
    console.log(`TIMEOUT - couldn't process all playbooks within the allotted time. You can adjust the timeout in the config.json file.`);
    process.exit(2);
  }
};

/**
 * Checks the status of all playbook runs
 * @param scheduledPlaybookRuns The scheduled runs
 * @param counter The current counter for this operation
 * @param realResolve The resolve function to use after
 * @returns Promise<{ status: string, playbookRunStatuses: any }>
 */
async function checkPlaybookRuns (scheduledPlaybookRuns: PlaybookRun[], counter: number, realResolve?: Function): Promise<{ status: string, playbookRunStatuses: any }> {
    counter++;
    return new Promise((resolve) => {
        const resolver = realResolve || resolve;
        setTimeout(async () => {
            const playbookRunStatuses = [];
        
            // Check the status of all playbooks
            for (const scheduledPlaybookRun of scheduledPlaybookRuns) {
                const task = await CognigyClient.readTask({ taskId: scheduledPlaybookRun.taskId });
                const playbookRun = await CognigyClient.readPlaybookRun({ playbookId: scheduledPlaybookRun.playbookId, playbookRunId: task.data.playbookRunId });
                playbookRunStatuses.push({
                    playbookId: scheduledPlaybookRun.playbookId,
                    playbookRunId: playbookRun._id,
                    status: playbookRun.status,
                    steps: playbookRun.stepResults }
                );
            }
        
            // If all playbooks were successful, resolve success
            if (playbookRunStatuses.every(pbRun => pbRun.status === 'successful')) {
                resolver({
                    status: "successful",
                    playbookRunStatuses
                });
            // If all playbooks were either successful or failed, resolve failed
            } else if (playbookRunStatuses.every(pbRun => pbRun.status === 'successful' || pbRun.status === 'failed')) { 
                resolver({
                    status: "failure",
                    playbookRunStatuses
                });
            // Otherwise try again if the timeout has not been reached
            } else {
                if (counter < (CONFIG.playbookTimeoutSeconds || 10)) {
                    await checkPlaybookRuns(scheduledPlaybookRuns, counter, resolve);   
                } else {
                    resolver({
                        status: "timeout",
                        playbookRunStatuses
                    });
                }
            }
        }, 1000);
    });
}