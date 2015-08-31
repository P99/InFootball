(function ( $ ) {

  // Data shared by all rest instances
  var namespace;
  var socket;
  var game;

  // Public interface
  $.football = function(options) {
    namespace = options.namespace,
    socket = $.socket(options.namespace)
    return new clientInterface();
  }

  // Client interface
  function clientInterface() {
    this.join = function(gameId) {
      socket.emit('football', { action: "JOIN", uri: gameId });
      game = gameId;
    };

    this.leave = function() {
      socket.emit('football', { action: "LEAVE", uri: game });
    };

    this.select = function(questionId) {
      socket.emit('football', { action: "SELECT", uri: game, data: questionId });
    };
  }

  $.football.handler = function(msg) {
    switch (msg.action) {
      case "MATCH":
        console.log("Receive MATCH data: " + JSON.stringify(msg.data));
        break;
      default:
        console.log("Un-handled action: " + msg.action);
    }
  }

}( jQuery ));