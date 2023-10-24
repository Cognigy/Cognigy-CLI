export const runInParallel = async <T> (
        fn: (args: T) => void,
        array: T[],
        numParallelJobs: number) => {
    const iter = array.values();

    const run = async () => {
        for (;;) {
            const { value, done } = iter.next();

            if (done)
                break;

            await fn(value);
        }
    };

    await Promise.all(Array.apply(null, Array(numParallelJobs)).map(_ => run()));
}