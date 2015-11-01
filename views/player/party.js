
window.addEventListener("load", function (event) {

  var socket = io( document.location.hostname + ':' + webSocketPort() + '/player', webSocketToken() );
  var games = document.getElementById("games");
  var questions = document.getElementById("questions");
  socket.on('football', function(msg) {
    console.log("Received message: " + JSON.stringify(msg));
    switch (msg.uri) {
    case 'games':
      // Display the list of ongoing games
      if (msg.data.length) {
        games.innerHTML = "";
        msg.data.forEach(function(item) {
          games.innerHTML += "<a id='" + item._id + "' href='#'>" + item.title + "</a></br>";
        });
        // Adding event listener on parent
        games.addEventListener("click", function(event) {
          if (event.target.tagName.toLowerCase() == "a") {
            games.innerHTML = "";
            socket.emit('football', {action: "JOIN", uri: event.target.id});
          }
        });
        
      } else {
        games.innerHTML = "Pas de jeu en cours";
      }
      break;
    case 'question':
      var question = msg.data;
      var box = '<div id="' + question._id + '"class="alert alert-warning fade in">';
      // box += '<a class="close">x</a>';
      box += '<h4>' + question.caption + '</h4>';
      question.answers.forEach(function(value) {
        box += '<a class="btn btn-default">' + value + '</a>';
      });
      box += "</div>";
      questions.innerHTML += box;
      break;
    }
  });
  socket.emit('football', {action: "HELLO"});

});