
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

	stream.pipe(parser);

	stream.on('error', function (err) {
		throw err;
	});

	parser.on('data', function (json) {
		i++;
		parser.pause();
		// console.log(json);

		if (i > 100) {
			var big = db.collection('big');
			g += i;
			console.log('inserting', g);
			var args = {
				// multi: true,
				// upsert: true
			};
			var querylist = [];
			for (var j in list) {
				var item = list[j];
				var query = {
					updateOne: {
						q: {
							id: item.id
						},
						u: {
							'$set': item
						},
						upsert: true
					}
				};
				querylist.push(query);
			}

			big.bulkWrite(querylist, args, function (err, d) {
				if (err) throw err;
				querylist = null;
				parser.resume();
			});

			list = [];
			i = 0;
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
