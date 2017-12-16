let fs = require('fs');
let {pathConcat} = require('../data');

function filereader(fsRef, path) {
	return new Promise(function (resolve, reject) {
		fsRef.readFile(path, 'utf8', function (e, d) {

			if (e) reject(e);

			else resolve(JSON.parse(d));
		});
	});
}

function getCourses(req, res) {
	let path = pathConcat('api/collections/courses/get.json');
	let servicePromise = filereader(fs, path);

	servicePromise
		.then((response) => {
			res.json(response);
		});
}

module.exports = {getCourses};