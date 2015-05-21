var io = require('socket.io');

module.exports = function(server) {
    var socketIO = io(server);
    socketIO.on('connection', function (socket) {
        console.log('user connected');
        socket.on('template', function(msg){
            socketIO.emit('template', msg);
        });
        socket.on('disconnect', function() {
            console.log('user disconnected');
        });
    });
}