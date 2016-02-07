(function($) {

    var context = {};

    $.socket = function(namespace) {
        for (var name in context) {
            if (name == namespace) {
                return context[namespace];
            }
        }

        var socket = io(document.location.hostname + ':' + webSocketPort() + '/' + namespace, webSocketToken());

        socket.on('error', function(error) {
            // redirect user to login page perhaps?
            console.log("User's token has expired (" + error + ")");
        });

        socket.on('rest', $.rest.handler);
        socket.on('football', $.football.handler);

        context[namespace] = socket;
        return socket;
    }

}(jQuery));
