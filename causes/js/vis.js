var rawData,userData;
$(function(){
	loadData('data/causes.csv');
});

loadData = function(url) {
	rawData = new Miso.Dataset({
		url : url,
		delimiter : ','
	});

	rawData.fetch({
		success : function() {
			console.log("Available Columns:" + this.columnNames());
			console.log("There are " + this.length + " rows");
			userData = [];
			this.each(function(row){ userData.push(row); });
			console.log(userData);
		}
	});
};