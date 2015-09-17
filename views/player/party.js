
window.addEventListener("load", function (event) {

  var socket = io( document.location.hostname + ':' + webSocketPort() + '/player' );
  var ref = document.getElementById("questions");
  socket.on('football', function(msg) {
    console.log("Received message: " + JSON.stringify(msg));
    switch (msg.uri) {
    case 'games':
      // Display the list of ongoing games
      // Allow the player to join a game
      // Fixme: Joining the first game by default
      if (msg.data.length) {
        socket.emit('football', {action: "JOIN", uri: msg.data[0]._id});
      }
      break;
    case 'question':
      ref.innerHTML += msg.data.caption + "</br>";
      break;
    }
  });
  socket.emit('football', {action: "HELLO"});

});