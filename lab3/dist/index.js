"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require('express');
var app = express();
var metrics = require('./metrics');
var path = require('path');
app.use(express.static(path.join(__dirname, 'public')));
app.set('port', 1337);
app.set('views', __dirname + "/views");
app.set('view engine', 'ejs');
app.get('/hello/:name', function (req, res) { return res.render('hello.ejs', { name: req.params.name }); });
app.post('/', function (req, res) {
    // POST
});
app
    .put('/', function (req, res) {
    // PUT
})
    .delete('/', function (req, res) {
    // DELETE
});
app.get('/metrics.json', function (req, res) {
    metrics.get(function (err, data) {
        if (err)
            throw err;
        res.status(200).json(data);
    });
});
app.listen(app.get('port'), function () { return console.log("server listening on " + app.get('port')); });
