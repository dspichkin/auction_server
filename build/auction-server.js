var express = require('express');
var path = require('path');
var ws_1 = require('ws');
var model_1 = require('./model');
var port = 8080;
var app = express();
app.use('/', express.static(path.join(__dirname, '..', 'client')));
app.use('/node_modules', express.static(path.join(__dirname, '..', 'node_modules')));
// Add headers
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
});
app.get('/products', function (req, res) {
    res.json(model_1.getProducts());
});
app.get('/products/:id', function (req, res) {
    res.json(model_1.getProductById(parseInt(req.params.id, 10)));
});
app.get('/products/:id/reviews', function (req, res) {
    res.json(model_1.getReviewsByProductId(parseInt(req.params.id)));
});
var httpServer = app.listen(port, 'localhost', function () {
    var address = httpServer.address().address;
    var port = httpServer.address().port;
    console.log('Listening on http://localhost:' + port);
});
// Create the WebSocket server listening to the same port as HTTP server
var wsServer = new ws_1.Server({ server: httpServer });
wsServer.on('connection', function (ws) {
    ws.on('message', function (message) {
        var subscriptionRequest = JSON.parse(message);
        subscribeToProductBids(ws, subscriptionRequest.productId);
    });
});
setInterval(function () {
    generateNewBids();
    broadcastNewBidsToSubscribers();
}, 2000);
// The map key is a reference to WebSocket connection that represents a user.
var subscriptions = new Map();
function subscribeToProductBids(client, productId) {
    var products = subscriptions.get(client) || [];
    subscriptions.set(client, products.concat([productId]));
}
// Bid generator
var currentBids = new Map();
function generateNewBids() {
    model_1.getProducts().forEach(function (p) {
        var currentBid = currentBids.get(p.id) || p.price;
        var newBid = random(currentBid, currentBid + 5); // Max bid increase is $5
        currentBids.set(p.id, newBid);
    });
}
function broadcastNewBidsToSubscribers() {
    subscriptions.forEach(function (products, ws) {
        if (ws.readyState === 1) {
            var newBids = products.map(function (pid) { return ({
                productId: pid,
                bid: currentBids.get(pid)
            }); });
            ws.send(JSON.stringify(newBids));
        }
        else {
            subscriptions.delete(ws);
        }
    });
}
function random(low, high) {
    return Math.random() * (high - low) + low;
}
