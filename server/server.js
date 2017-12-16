let http = require('http');
let static = require('node-static');
let file = new static.Server('.');
let port = 7272;

http.createServer(function (req, res) {
	file.serve(req, res);
}).listen(port);

console.log('Server running on port ' + port);