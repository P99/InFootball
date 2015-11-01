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
  var question = msg.data;
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
      if (questionModel.containsMetadata(question)) {
        question.status = "edit";
        io.of('operator').to(room).emit('football', { action: "EDIT", data: question });
      } else {
        // question id has to be unique (could be sent several times)
        question._id = Math.random().toString(36).substr(2);
        question.created = Date.now();
        question.status = "sent";
        context[room]['questions'][question._id] = {};
        io.of('operator').to(room).emit('football', { action: "SENT", data: question });
        io.of('player').to(room).emit('football', { uri: 'question', data: question });
      }
      break;
    case "SELECT":
      question.status = "validated";
      break;
    case "CANCEL":
      question.status = "cancelled";
      io.of('player').to(room).emit('football', { uri: 'question', data: question });
      break;
    default:
      console.log("Un-handled action: " + msg.action);
  }
  // Save any context update
  if (question && context[room]['questions'][question._id]) {
    context[room]['questions'][question._id] = question;
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
    case "ANSWER":
      console.log("Receiving answer from: " + socket.user.username + " questionID is " + msg.uri + " answer is " + msg.data);
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
