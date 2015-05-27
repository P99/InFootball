var io = require('socket.io');
var mongoose = require('mongoose');

module.exports = function(server) {
    var socketIO = io(server);
    socketIO.on('connection', function (socket) {
        console.log('user connected');
        socket.on('template', function(msg){
            var _method = msg.method;
            var _uri = msg.uri;
            var _data = msg.data;
            if ((_method === "GET") && (_uri === "templates/any?schema")) {
              socketIO.emit('template', {method: _method, uri: _uri, data: {title: "...", teams:[], contexts: []}});
            }
        });
        socket.on('disconnect', function() {
            console.log('user disconnected');
        });
    });
}