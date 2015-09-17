var mongoose = require('mongoose');
var gameModel = require('../models/game');
var questionModel = require('../models/question');

module.exports = function(namespace, io, socket, msg) {
  console.log("[football] namespace=" + namespace + " msg: " + JSON.stringify(msg));
  switch(namespace) {
    case "operator":
      operatorHandler(io, socket, msg);
      break;
    case "player":
      playerHandler(io, socket, msg);
      break;
    default:
      console.log("Un-handled namespace: " + namespace);
  }
}

function operatorHandler(io, socket, msg) {
  var room = socket.rooms.filter(function(key) { return key.indexOf('football-') == 0; });
  switch  (msg.action) {
    case "JOIN":
      gameModel.findById( msg.uri, function( err, doc ) {
        if (!err) {
          // Create the room after the gameId
          socket.join('football-' + msg.uri); 
          // Reply "MATCH" with the whole match data (teams)
          // Todo inflate the game object with template etc
          socket.emit('football', {action: "MATCH", uri: msg.uri, data: doc});
        }
      });
      break;
    case "LEAVE":
      // Todo: cleanup the context
      socket.leave('football-' + msg.uri);
      break;
    case "SELECT":
      // Todo: Grab the question from the database
      // Send to all players
      questionModel.findById( msg.data, function ( err, doc) {
        if (!err) {
          console.log("Sending question to players in room " + room + ": " + JSON.stringify(doc));
          //io.sockets.in('player').emit("Questions");
          //io.of('player').to('room').emit('football', {uri: msg.uri, data: doc});
          io.of('player').to(room).emit('football', {uri: 'question', data: doc});
        }
      });
      break
    default:
      console.log("Un-handled action: " + msg.action);
  }
}

function playerHandler(io, socket, msg) {
  switch  (msg.action) {
    case "HELLO":
      // Retreive ongoing games
      // Todo: Filter rooms named after actual games
      console.log("Known rooms: " + JSON.stringify(io.of('operator').adapter.rooms));
      var games = [];
      for (var key in io.of('operator').adapter.rooms) {
        if (!key.indexOf("football-")) {
          games.push(key.slice(9));
        }
      }
      console.log("Games IDs: " + JSON.stringify(games));
      gameModel.find({'_id': { $in: games}}, function(err, docs) {
        if (!err) {
          console.log("Games: " + JSON.stringify(docs));
          socket.emit('football', { uri: 'games', data: docs });
        }
      });
      break;
    case "JOIN":
      socket.join('football-' + msg.uri); 
      break;
    case "LEAVE":
      socket.leave('football-' + msg.uri);
      break;
    default:
      console.log("Un-handled action: " + msg.action);
  }
}
