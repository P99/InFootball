var socketIO = require('socket.io');
var security = require('../passport/token');
var rest = require('./rest');
var football = require('./football');

module.exports = function(server) {
    var io = socketIO(server);

    ["player", "operator", "admin"].forEach(createNamespace);

    function createNamespace(namespace) {
        console.log("createNamespace: " + namespace);
        var handler = io.of(namespace);
        handler.use(security.authenticate(namespace));

        handler.on('connection', function(socket) {
            // Iterate through plugins
            socket.on('rest', function(msg) {
                rest(namespace, io, socket, msg);
            });
            socket.on('football', function(msg) {
                football(namespace, io, socket, msg);
            });
            socket.on('disconnect', function() {
                console.log("[" + namespace + "] user disconnected");
            });
        });
    }
}
