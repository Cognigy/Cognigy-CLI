import * as cliProgress from 'cli-progress';

let progressBar: cliProgress.SingleBar = null;
let progress = 0;
const max = 100;

/**
 * Instantiates a graphical progress bar
 * @param max Maximum progress count
 */
export const startProgressBar = (max: number = 100) => {
  progressBar = new cliProgress.SingleBar(
    {},
    cliProgress.Presets.shades_classic
  );
  progressBar.start(max, 0);
  progress = 0;
  max = max;
};

/**
 * Adds a count to the progress bar and updates
 * @param add The value to add
 */
export const addToProgressBar = (add: number) => {
  progress = progress + add;
  progressBar.update(Math.round(progress));
};

/**
 * Sets progress to the max value and stops the progress bar
 */
export const endProgressBar = () => {
  progressBar.update(max);
  progressBar.stop();
};
