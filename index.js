var args = require('minimist')(process.argv.slice(2)),
	database = args.database || 'big-mongo-test',
	collection = args.collection || 'bigdata',
	filename = args.filename || 'test.json',
	fs = require('fs'),
	JSONstream = require('JSONstream'),
	MongoClient = require('mongodb').MongoClient,
	path = require('path');

var filepath = path.join(__dirname, filename);

var stream = fs.createReadStream(filepath, {encoding: 'UTF-8'});

var parser = JSONstream.parse([/./]);

var list = [];
var i = 0;
var g = 0;
var url = 'mongodb://127.0.0.1:27017/' + database;
if (args.help) {
	console.log("command line options");
	console.log("");
	console.log("--database: \t the mongodb database you'd like to use for the import process.");
	console.log("\t\t defaults to `big-mongo-test`");
	console.log("");
	console.log("--collection: \t the mongodb collection you'd like to use for the import process.");
	console.log("\t\t defaults to `big-data`");
	console.log("");
	console.log("--filename: \t the file name of the JSON document that was generated. Did you remember it?");
	console.log("\t\t defaults to `test.json`");
	console.log("");
	console.log("example:");
	console.log("node index.js --filename foobar.json --database small-mong-test --collection small-data");
	console.log("");

	process.exit();
}

MongoClient.connect(url, function (err, db) {
	var big = db.collection(collection);
	// ensure an index
	big.ensureIndex({id: 1}, {unique: true, name: 'id_index'});
	stream.pipe(parser);

	stream.on('error', function (err) {
		throw err;
	});

	parser.on('data', function (json) {
		i++;
		parser.pause();
		if (i > 1000) {
			var bulk = big.initializeUnorderedBulkOp();
			g += i;
			console.log('inserting/upserting documents #', g);

			for (var j in list) {
				var item = list[j];
				// console.log(item);
				var query = {
					id: item.id
				};
				var doc = {
					'$set': item
				};
				// add upsert to bulk queue
				bulk.find({id: item.id}).upsert().updateOne(doc);
			}

			bulk.execute({w: 0}, function (err) {
				if (err) {
					console.log(err);
					throw err;
				}
				bulk = null;
				list = [];
				i = 0;
				parser.resume();
			});
		} else {
			list.push(json);
			parser.resume();
		}

	});

	parser.on('close', function () {
		console.log("closing stream");
	});

	parser.on('end', function () {
		console.log('ending stream');
		db.close();
	});

});
