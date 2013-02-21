function sortedWords(input, callback) {

	var sWords = input;
	var iWordsCount = sWords.length; // count w/ duplicates

	// array of words to ignore
var ignore = ["for","with","from","about","into","over","after","beneath","under","above","the","and","that","have","not","with","she","you","this","but","his","they","say","her","because","will","their","who","get","which","when","make","can","just","him","your","it's","has","also","too","where","don't","i'm","how","was","are","what","see","would","should","like","these","those","their","out","them","ther","all","explain","response","comment","doing","going","could","any","know","our","there's","it's","than","other","through","doesn't","what's","etc","there","were","its","haven't","one"];
	
	ignore = (function(){
		var o = {}; // object prop checking > in array checking
		var iCount = ignore.length;
		for (var i=0;i<iCount;i++){
			o[ignore[i]] = true;
		}
		return o;
	}());

	var counts = {}; // object for math
	for (var i=0; i<iWordsCount; i++) {
		var sWord = sWords[i];
		if (!ignore[sWord] && sWord.length > 2) {
			counts[sWord] = counts[sWord] || 0;
			counts[sWord]++;
		}
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
