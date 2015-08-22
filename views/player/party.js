
window.addEventListener("load", function (event) {

  var socket = io( document.location.hostname + ':' + webSocketPort() + '/player' );
  var ref = document.getElementById("questions");
  socket.on('football', function(msg) {
    console.log("Received message: " + JSON.stringify(msg));
    ref.innerHTML += msg.data.caption + "</br>"
  });
  socket.emit('football', {action: "HELLO"});

});