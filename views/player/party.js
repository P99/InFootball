
window.addEventListener("load", function (event) {

  var socket = io( document.location.hostname + ':' + webSocketPort() + '/player' );
  var ref = document.getElementById("questions");
  socket.on('football', function(msg) {
    console.log("Received message: " + JSON.stringify(msg));
    switch (msg.uri) {
    case 'games':
      // Display the list of ongoing games
      if (msg.data.length) {
        ref.innerHTML = "";
        msg.data.forEach(function(item) {
          ref.innerHTML += "<a id='" + item._id + "' href='#'>" + item.title + "</a></br>";
        });
        // Adding event listener on parent
        ref.addEventListener("click", function(event) {
          ref.innerHTML = "";
          socket.emit('football', {action: "JOIN", uri: event.target.id});
        });
        
      } else {
        ref.innerHTML = "Pas de jeu en cours";
      }
      break;
    case 'question':
      ref.innerHTML += msg.data.caption + "</br>";
      break;
    }
  });
  socket.emit('football', {action: "HELLO"});

});