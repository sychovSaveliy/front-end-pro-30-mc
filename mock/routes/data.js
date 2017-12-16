let fs = require('fs');
let path = './mock';

function pathConcat(pathname) {
	return path + '/' + pathname;
}

function filereader(fsRef, path) {
	return new Promise(function (resolve, reject) {
		fsRef.readFile(path, 'utf8', function (e, d) {

			if (e) reject(e);

			else resolve(JSON.parse(d));
		});
	});
}

function get(req, res) {
	let path = pathConcat('api/data/get.json');
	let servicePromise = filereader(fs, path);

	servicePromise
		.then((response) => {
			res.json(response);
		});
}


module.exports = {get, pathConcat};