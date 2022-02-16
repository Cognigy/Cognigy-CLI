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
	  }
};
