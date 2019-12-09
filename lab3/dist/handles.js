"use strict";
// ./handles.js
// Necessary imports
var url = require('url');
var qs = require('querystring');
module.exports = {
    serverHandle: function (req, res) {
        var route = url.parse(req.url);
        var path = route.pathname;
        var params = qs.parse(route.query);
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        if (path === '/hello' && 'name' in params) {
            res.write('Hello ' + params['name']);
        }
        else {
            res.write('Hello anonymous');
        }
        res.end();
    }
};
