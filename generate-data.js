var fs = require('fs'),
	path = require('path');
	var data = [];

for (var i = 0; i < 1000000; i++) {
	var item = {
		id: i,
		// name: Math.random().toString(36),
		name: "name_" + Math.random(),
		value: Math.random().toString(24)
	};
	data.push(item);
}
data = JSON.stringify(data, null, 4);
fs.writeFile(path.join(__dirname, 'test.json'), data, function (err) {
	if (err) throw err;
});
