import * as inquirer from 'inquirer';

console.log("\n\nCognigy.AI CLI Simulator");
console.log("------------------------");
console.log("  (used for debugging)");
console.log("\n");

(async () => {
    const answers = await inquirer
    	.prompt([
            {
                type: 'input',
                name: 'command',
                message: `What is the command?`,
                default: `run`
            },
            {
                type: 'input',
                name: 'resourceType',
                message: `what is the resource type?`,
                default: 'playbooks'
            },
            {
                type: 'input',
                name: 'resourceId',
                message: `What is the resource ID?`,
                default: ``
            },
            {
                type: 'input',
                name: 'options',
                message: `What are other options?`,
                default: ``
            }
        ]);

    process.argv[2] = answers.command;
    process.argv[3] = answers.resourceType;
    process.argv[4] = answers.resourceId;

    if (answers.options) {
        let splits = answers.options.split(" ");
        let x = 4;
        splits.forEach((s) => {
            x++;
            process.argv[x] = s;
        });
    }

    require( '../cognigy');
})();