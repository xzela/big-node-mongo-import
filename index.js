
var fs = require('fs'),
	path = require('path'),
	MongoClient = require('mongodb').MongoClient,
	JSONstream = require('JSONstream');

var filepath = path.join(__dirname, 'test.json');

var stream = fs.createReadStream(filepath, {encoding: 'UTF-8'});

var buff = '';
var parser = JSONstream.parse([/./]);

var list = [];
var i = 0;
var g = 0;
var url = 'mongodb://127.0.0.1:27017/bigtest';

MongoClient.connect(url, function (err, db) {
	var big = db.collection('big');
	// ensure an index
	big.ensureIndex({id: 1}, {unique: true, name: 'id_index'});
	stream.pipe(parser);

	stream.on('error', function (err) {
		throw err;
	});

	parser.on('data', function (json) {
		i++;
		parser.pause();
		// console.log(json);

		if (i > 100) {
			var bulk = big.initializeUnorderedBulkOp();
			g += i;
			console.log('inserting documents #', g);

			for (var j in list) {
				var item = list[j];
				// console.log(item);
				var query = {
					id: item.id
				};
				var doc = {
					'$set': item
				};
				var args = {
					upsert: true
				};
				// querylist.push(query);
				bulk.find({id: item.id}).upsert().updateOne(doc);
				// bulk.insert(item);
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
