'use strict';
var http = require('http');
var absProxy = require('abs-proxy');
var apiModifier = require('./clients/api-modifier.js');
var proxy = absProxy.createAbsProxy({
    host: '127.0.0.1',
    port: 8086
});
var server;

proxy.onResponse(/\/unbxd-search/, apiModifier);

server = http.createServer(function(req, res) {
    proxy.dispatch(req, res);
});

var port = '8080';
server.listen(port);