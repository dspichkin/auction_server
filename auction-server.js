import * as express from 'express';
import * as path from "path";
import { Server as WsServer } from 'ws';
import { getProducts, getProductById, getReviewsByProductId } from './model';
const app = express();
app.use('/', express.static(path.join(__dirname, '..', 'client')));
app.use('/node_modules', express.static(path.join(__dirname, '..', 'node_modules')));
app.get('/products', (req, res) => {
    res.json(getProducts());
});
app.get('/products/:id', (req, res) => {
    res.json(getProductById(parseInt(req.params.id, 10)));
});
app.get('/products/:id/reviews', (req, res) => {
    console.log('1111');
    res.json(getReviewsByProductId(parseInt(req.params.id)));
});
const port = 8080;
const httpServer = app.listen(port, 'localhost', () => {
    const address = httpServer.address().address;
    const port = httpServer.address().port;
    console.log('Listening on http://localhost:' + port);
});
// Create the WebSocket server listening to the same port as HTTP server
const wsServer = new WsServer({ server: httpServer });
wsServer.on('connection', ws => {
    ws.on('message', message => {
        let subscriptionRequest = JSON.parse(message);
        subscribeToProductBids(ws, subscriptionRequest.productId);
    });
});
setInterval(() => {
    generateNewBids();
    broadcastNewBidsToSubscribers();
}, 2000);
// The map key is a reference to WebSocket connection that represents a user.
const subscriptions = new Map();
function subscribeToProductBids(client, productId) {
    let products = subscriptions.get(client) || [];
    subscriptions.set(client, [...products, productId]);
}
// Bid generator
const currentBids = new Map();
function generateNewBids() {
    getProducts().forEach(p => {
        const currentBid = currentBids.get(p.id) || p.price;
        const newBid = random(currentBid, currentBid + 5); // Max bid increase is $5
        currentBids.set(p.id, newBid);
    });
}
function broadcastNewBidsToSubscribers() {
    subscriptions.forEach((products, ws) => {
        if (ws.readyState === 1) {
            let newBids = products.map(pid => ({
                productId: pid,
                bid: currentBids.get(pid)
            }));
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
