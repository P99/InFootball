var io = require('socket.io');

module.exports = function(server) {
    var socketIO = io(server);
    socketIO.on('connection', function (socket) {
        console.log('user connected');
        socket.on('chat message', function(msg){
            io.emit('chat message', msg);
        });
        socket.on('disconnect', function() {
            console.log('user disconnected');
        });
    });
}