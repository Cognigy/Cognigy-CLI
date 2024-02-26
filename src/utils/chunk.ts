export const chunkArray = <T>(arr: T[], size: number): T[][] => {
    let chunkedArr = [];
    arr = arr || [];
    size = size === undefined ? 1 : size;
    for (let i = 0; i < arr.length; i += size) {
        chunkedArr.push(arr.slice(i, i + size));
    }
    return chunkedArr;
};
