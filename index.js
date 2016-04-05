'use strict';
var http = require('http');
var absProxy = require('abs-proxy');
var apiModifier = require('./clients/api-modifier.js');
var proxy = absProxy.createAbsProxy({
    host: 'search.unbxdapi.com',
    port: 80
});
var server;

proxy.onResponse(/\//,apiModifier);

server = http.createServer(function(req, res) {
    proxy.dispatch(req, res);
});

var host = 'localhost';
var port = '8080';
server.listen(port, host);