var express = require('express');
var app = express();
var Product = (function () {
    function Product(id, title, price) {
        this.id = id;
        this.title = title;
        this.price = price;
    }
    return Product;
})();
var products = [
    new Product(0, "F11111", 24.99),
    new Product(1, "F222", 24.99),
    new Product(2, "F3333", 24.99),
];
function getProducts() {
    return products;
}
app.get('/', function (req, res) { return res.send('Hello from Express'); });
app.get('/products', function (req, res) {
    res.json(getProducts());
});
function getProductById(productId) {
    return products.find(function (p) { return p.id === productId; });
}
app.get('/products/:id', function (req, res) {
    res.json(getProductById(parseInt(req.params.id, 10)));
});
app.get('/reviews', function (req, res) { return res.send('Got a request for reviews'); });
var server = app.listen(8080, 'localhost', function () {
    var address = server.address().address;
    var port = server.address().port;
    console.log('Listening on http://localhost:' + port);
});
