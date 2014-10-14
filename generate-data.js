var args = require('minimist')(process.argv.slice(2)),
	data = [],
	filename = args.filename || 'test.json',
	fs = require('fs'),
	path = require('path'),
	size = args.size || 1000000;

if (args.help) {
	console.log("command line options");
	console.log("--size: \t number of documents to generate.");
	console.log("\t\t defaults to `1000000`");
	console.log("");
	console.log("--filename: \t the file name of the JSON document that is generated.");
	console.log("\t\t defaults to `test.json`");
	console.log("");
	console.log("example:");
	console.log("node generate-data.js --size 100 --filename foobar.json");
	console.log("");

	process.exit();
}


for (var i = 0; i < size; i++) {
	var item = {
		id: i,
		name: "name_" + Math.random(36),
		value: Math.random().toString(24)
	};
	data.push(item);
}
data = JSON.stringify(data, null, 4);
fs.writeFile(path.join(__dirname, filename), data, function (err) {
	if (err) throw err;
});
