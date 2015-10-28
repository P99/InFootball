(function ( $ ) {

  // Data shared by all rest instances
  var namespace;
  var socket;
  var game;
  var listeners = [];

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

    this.send = function(question) {
      socket.emit('football', { action: "SEND", uri: game, data: question });
    };

    this.cancel = function(question) {
      socket.emit('football', { action: "CANCEL", uri: game, data: question });
    };

    this.select = function(question) {
      socket.emit('football', { action: "SELECT", uri: game, data: question });
    };

    this.on = function(event, callback) {
      if (typeof callback == "function") {
        listeners.push({ event: event, callback: callback });
      }
    }
  }

  function notify(event, data) {
    listeners.forEach(function(item) {
      if (item.event == event) {
         item.callback(data);
      }
    });
  }

  $.football.handler = function(msg) {
    switch (msg.action) {
      case "MATCH":
        console.log("Received MATCH data: " + JSON.stringify(msg.data));
        break;
      case "EDIT":
        notify("edit", msg.data);
        break;
      case "SENT":
        notify("sent", msg.data);
        break;
      default:
        console.log("Un-handled action: " + msg.action);
    }
  }

}( jQuery ));