import inquirer from './inquirer';

(async () => {
  console.log('\n\nCognigy.AI Knowledge Search CLI Simulator');
  console.log('------------------------');
  console.log('  (used for debugging)');
  console.log('\n');

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'command',
      message: `What is the command?`,
      default: `extract`,
    },
    {
      type: 'input',
      name: 'options',
      message: `What are other options?`,
      default: `pdf -i ./sources/example.pdf -o ./articles/pdf.txt`,
    },
  ]);

  process.argv[2] = answers.command;

  if (answers.options) {
    // find part of the answers.options which are encapuslated in "" and replace spaces in them with a _
    let matches = answers.options.match(/"(.*?)"/g);
    if (matches) {
      matches.forEach((m: string) => {
        let replaced = m.replace(/ /g, '_');
        answers.options = answers.options.replace(m, replaced);
      });
    }

    let splits = answers.options.split(' ');
    let x = 2;
    splits.forEach((s: string) => {
      x++;
      process.argv[x] = s.replace(/_/g, ' ').replace(/"/g, '');
    });
  }

  require('../index');
})();
