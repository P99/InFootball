(function ( $ ) {

  var context = {};

  $.socket = function (namespace) {
    console.log("socketForNamespace: " + namespace);
    for (var name in context) {
      if (name == namespace) {
        console.log("socketForNamespace: " + namespace + " > reuse");
        return context[namespace];
      }
    }

    console.log("socketForNamespace: " + namespace + " > new");
    var socket = io( document.location.hostname + ':' + port + '/' + namespace);

    socket.on('rest', $.rest.handler);
    socket.on('football', $.football.handler);

    context[namespace] = socket;
    return socket;
  }

}( jQuery ));