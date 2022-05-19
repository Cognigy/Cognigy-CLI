export const sortUtils = {
	sortObj: (unordered, sortArrays = false) => {
		if (!unordered || typeof unordered !== 'object') {
			return unordered;
		}

		if (Array.isArray(unordered)) {
			const newArr = unordered.map((item) => sortUtils.sortObj(item, sortArrays));
			if (sortArrays) {
				newArr.sort(sortUtils.sortI);
			}
			return newArr;
		}

		const ordered = {};
		Object.keys(unordered)
			.sort(sortUtils.sortI)
			.forEach((key) => {
				ordered[key] = sortUtils.sortObj(unordered[key], sortArrays);
			});
		return ordered;
	},

	sortI: (a, b) => {
		var nameA = a.toUpperCase(); // ignore upper and lowercase
		var nameB = b.toUpperCase(); // ignore upper and lowercase
		if (nameA < nameB) {
			return -1;
		}
		if (nameA > nameB) {
			return 1;
		}

		// names must be equal
		return 0;
	},
	sortIByNameKey: (a, b) => {
		var nameA = a.name.toUpperCase(); // ignore upper and lowercase
		var nameB = b.name.toUpperCase(); // ignore upper and lowercase
		if (nameA < nameB) {
			return -1;
		}
		if (nameA > nameB) {
			return 1;
		}

		// names must be equal
		return 0;
	},
	sortLexiconCsv: (csvData: string) => {
		let csvArr = csvData.split("\n");

		csvArr = csvArr.sort(sortUtils.sortI);
		let sortedCsvArr = [];

		csvArr.forEach(line => {
			const splitByNonNestedDoubleQuotes = /[,](?=(?:[^"]|"[^"]*")*$)/g;
			const lineArr = line.split(splitByNonNestedDoubleQuotes);

			// remove leading and trailing " for each csv column
			const keyphrase = lineArr[0].slice(1, -1);
			const slots = lineArr[1].slice(1, -1);
			const synonyms = lineArr[2].slice(1, -1);
			const slotsArr = sortUtils.sortStringByNonNestedComma(slots);
			const synonymsArr = sortUtils.sortStringByNonNestedComma(synonyms);

			sortedCsvArr.push('"' + keyphrase + '","' + slotsArr.join(',') + '","' + synonymsArr.join(',') + '",');
		});

		return sortedCsvArr.join("\n");
	},
	sortStringByNonNestedComma: (str: string) => {
		const splitByNonNestedSingleQuotes = /[,](?=(?:[^']|'[^']*')*$)/g;
		const strList = str.split(splitByNonNestedSingleQuotes);
		let sortedStrList = strList.sort(sortUtils.sortI);
		return sortedStrList;
	}
};
