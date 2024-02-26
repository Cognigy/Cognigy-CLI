export const chunkArray = <T>(inputArray: T[], size: number): T[][] => {
    return inputArray.reduce((resultArray, _, i) => {
        if (i % size === 0) {
            resultArray.push(inputArray.slice(i, i + size));
        }
        return resultArray;
    }, []);
};
