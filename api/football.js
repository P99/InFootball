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
            context[room] = { game: game, questions: {}, players: {} };
            // Reply "MATCH" with the whole match data (teams)
            // Todo inflate the game object with template etc
            socket.emit('football', { action: "MATCH", uri: msg.uri, data: game });
          }
        });
      }
      break;
    case "LEAVE":
      // Todo: cleanup the context
      socket.leave(room);
      break;
    case "SEND":
      // Send to all players
      if (questionModel.containsMetadata(question)) {
        // question id has to be unique (could be sent several times)
        question._id = Math.random().toString(36).substr(2);
        question.created = Date.now();
        question.status = "edit";
        io.of('operator').to(room).emit('football', { action: "EDIT", data: question });
      } else {
        question.expires = Date.now() + 10000; // Now + 10 seconds
        question.status = "live";
        context[room]['questions'][question._id] = {};
        io.of('operator').to(room).emit('football', { action: "SENT", data: question });
      }
      break;
    case "ANSWER":
      question.status = "validated";
      break;
    case "CANCEL":
      question.status = "cancelled";
      break;
    default:
      console.log("Un-handled action: " + msg.action);
  }
  // Save any context update
  if (question && context[room]['questions'][question._id]) {
    context[room]['questions'][question._id] = question;
    io.of('player').to(room).emit('football', { uri: 'question', data: question });
    scoreHandler(room);
  }
}

function playerHandler(io, socket, msg) {
  var room = socket.rooms.filter(function(key) { return key.indexOf('football-') == 0; });
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
      context[room]['players'][socket.user._id]['answers'].push({ 
        questionID: msg.uri.slice(10),
        answer: msg.data,
        timestamp: Date.now()
      });
      break;
    case "JOIN":
      room = 'football-' + msg.uri;
      socket.join(room);
      var user = { 
        profile: socket.user,
        score: 0,
        answers: []
      };
      context[room]['players'][socket.user._id] = user;
      break;
    case "LEAVE":
      socket.leave('football-' + msg.uri);
      // Todo: Tear down, if player got disconnected and wants to resume a party
      context[room]['players'][socket.user._id] = undefined;
      break;
    default:
      console.log("Un-handled action: " + msg.action);
  }
}

// This function would be called any time
// Because we have no idea if OP2 or player will answer first
function scoreHandler(room) {
  // For each player iterate through given answers
  // If the same question ID can be found in context
  // If the question has a valid answer + was not cancelled
  // Then compare timestamp and increment score
  // Flush treated answers on player side
  for (playerID in context[room]['players']) {
    var player = context[room]['players'][playerID];
    var answers = []; // to hold the sliced array
    for (var i=0; i<player.answers.length; i++) {
      var attempt = player.answers[i];
      var id = attempt.questionID;
      var question = context[room]['questions'][id];
      if (question) {
        switch (question.status) {
          case "live":
            // Keep this for next iteration
            answers.push(attempt);
            break;
          case "validated":
            if ((attempt.answer == question.validation)
              && (attempt.timestamp < question.expires)) {
              player.score++;
              console.log("Player " + player.profile.username + " > score = " + player.score);
            }
            break;
          case "cancelled":
            break;
        }
      }
    } // end foreach answer
    player.answers = answers;
  } // end foreach player
}
