var mongoose = require('mongoose');
var gameModel = require('../models/game');
var questionModel = require('../models/question');
var context = {};

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
      // The room is named after the gameId
      room = 'football-' + msg.uri;
      socket.join(room);

      var game = context[room];
      if (game) {
        socket.emit('football', { action: "MATCH", uri: msg.uri, data: game });
      } else {
        gameModel.findById( msg.uri, function( err, game ) {
          if (!err) {
            // Update global context to save database operations
            context[room] = { game: game, questions: [] };
            // Reply "MATCH" with the whole match data (teams)
            // Todo inflate the game object with template etc
            socket.emit('football', { action: "MATCH", uri: msg.uri, data: game });
          }
        });
      }
      break;
    case "LEAVE":
      // Todo: cleanup the context
      socket.leave('football-' + msg.uri);
      break;
    case "SEND":
      // Send to all players
      var question = msg.data;
      if (questionModel.containsMetadata(question)) {
        io.of('operator').to(room).emit('football', { action: "EDIT", data: question });
      } else {
        context[room]['questions'][question._id] = question;
        io.of('operator').to(room).emit('football', { action: "SENT", data: question });
        io.of('player').to(room).emit('football', { uri: 'question', data: question });
      }
      break;
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
      gameModel.find({'_id': { $in: games } }, function(err, docs) {
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
