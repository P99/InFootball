var mongoose = require('mongoose');

module.exports = function(namespace, io, socket, msg) {
  console.log("[football] namespace=" + namespace + " msg: " + JSON.stringify(msg));
  switch  (msg.action) {
    case "JOIN":
      // Todo: Grab the game object recursively
      // Reply "MATCH" with the whole match data (teams)
      socket.join(msg.data); // Create the room after the gameId
      break;
    case "LEAVE":
      // Todo: cleanup the context
      socket.leave(msg.data);
      break;
    case "SELECT":
      // Todo: Grab the question from the database
      // Send to all players
      io.sockets.in('player').emit("Questions");
      break
    default:
      console.log("Un-handled action: " + msg.action);
  }
}