
window.addEventListener("load", function (event) {

  var port = (document.location.hostname.indexOf('rhcloud.com') > 0 ) ? 8443 : 8080;
  var socket = io( document.location.hostname + ':' + port + '/player' );
  var ref = document.getElementById("questions");
  socket.on('football', function(msg) {
    console.log("Received message: " + JSON.stringify(msg));
    ref.innerHTML += msg.data.caption + "</br>"
  });
  socket.emit('football', {action: "HELLO"});

});