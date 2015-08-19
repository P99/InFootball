var mongoose = require('mongoose');
var gameModel = require('../models/game');
var questionModel = require('../models/question');

module.exports = function(namespace, io, socket, msg) {
  console.log("[football] namespace=" + namespace + " msg: " + JSON.stringify(msg));
  switch  (msg.action) {
    case "JOIN":
      gameModel.findById( msg.uri, function( err, doc ) {
        if (!err) {
          // Create the room after the gameId
          socket.join(msg.uri); 
          // Reply "MATCH" with the whole match data (teams)
          // Todo inflate the game object with template etc
          socket.emit('football', {action: "MATCH", uri: msg.uri, data: doc});
        }
      });
      break;
    case "LEAVE":
      // Todo: cleanup the context
      socket.leave(msg.uri);
      break;
    case "SELECT":
      // Todo: Grab the question from the database
      // Send to all players
      questionModel.findById( msg.data, function ( err, doc) {
        if (!err) {
          console.log("Sending question to players: " + JSON.stringify(doc));
          //io.sockets.in('player').emit("Questions");
          //io.of('player').to('room').emit('football', {uri: msg.uri, data: doc});
          io.of('player').emit('football', {uri: msg.uri, data: doc});
        }
      });
      break
    default:
      console.log("Un-handled action: " + msg.action);
  }
}