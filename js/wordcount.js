function sortedWords(input, callback) {

	var sWords = input;
	var iWordsCount = sWords.length; // count w/ duplicates

	// array of words to ignore
	var counts = {},
		i = 0;
	while(i < iWordsCount) {
		var sWord = sWords[i];
		if (sWord.length > 2) {
			counts[sWord] = counts[sWord] || 0;
			counts[sWord]++;
		}
		i++;
	}

	var arr = []; // an array of objects to return
	for (sWord in counts) {
		arr.push({
			text: sWord,
			frequency: counts[sWord]
		});
	}

	// sort array by descending frequency | http://stackoverflow.com/a/8837505
	var finished = arr.sort(function(a,b){
		return (a.frequency > b.frequency) ? -1 : ((a.frequency < b.frequency) ? 1 : 0);
	});

	callback(finished);
}
