var http = require('http');
var server = http.createServer(function (request, response) {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end('{"message": "Hello Json!"}\n');
});
var port = 8080;
server.listen(port);
console.log('Listing on http://localhost: ' + port);
