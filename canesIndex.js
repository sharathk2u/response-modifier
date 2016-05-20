'use strict';
var http = require('http');
var absProxy = require('abs-proxy');
var apiModifier = require('./clients/api-modifier.js');
var reqModifier = require('./clients/canesReqModifier.js');
var proxy = absProxy.createAbsProxy({
    host: '54.144.155.174',
    port: 8086
});
var server;

proxy.onResponse(/\/unbxd-search/, function(data,req,res) {
	return data;
});

server = http.createServer(function(req, res) {
	reqModifier(req)
    proxy.dispatch(req, res);
});

var port = '8080';
server.listen(port);
