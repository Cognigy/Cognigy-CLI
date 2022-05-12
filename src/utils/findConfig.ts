/**
 * Finds a dynamic config option in the process args
 * @returns Either the found config or the standard config
 */
export const findConfig = () => {
    let result = !process.env.ENVIRONMENT ? './config-test.json' :'./config.json';
    if (process.argv) {
        process.argv.forEach((arg, index) => {
            if (arg === "-c" || arg === "--config" && process.argv[index + 1])
                result = process.argv[index + 1];
        });
    }
    return result;
};