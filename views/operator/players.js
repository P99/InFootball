(function ( $ ) {

  var players;
  var question;
  var editedCallback;

  $.players = function(options) {
    return new interface();
  };

  function interface() {
    this.load = loadPlayers;
    this.edit = editQuestion;
  }

  function loadPlayers(teamId) {
    $.ajax({
      url: "rest/teams/" + teamId + "/players/any",
      async: true,
      dataType: 'json',
      success: function (msg) {
        players = msg;
        var $list = $("<ul>");

        // Build the list of players
        players.forEach(function(player) {
          $item = $("<li>");
          $item.append(makePlayer(player));
          $list.append($item);
        });
        $('#players-list').append($list);
        $("#players-list").droppable({
          accept: "#players-layout div",
          drop: function(event, ui) {
            var id = ui.draggable.attr('id');
            $("#players-layout").find("#" + id).parent().empty().droppable("enable");
            $("#players-list").find("#" + id).attr("style", "position: relative").show();
          }
        });
        $("#players-composition").change(updateComposition);
      }
    })
  }

  function updateComposition(e) {
    var composition = $(this).val();
    var field = $("#players-field");
    var target = field.find("#players-layout");

    var str = '';
    var rows = composition.split("-").reverse();
    rows.push(1); // goal keeper
    var height = field.height() / rows.length;

    console.log("compositions changed to " + composition);

    rows.forEach(function(value, index) {
      var y = height * index + height/2 -15;
      var width = field.width() / value;
      for (var i=0; i<value; i++) {
        var x = width * i + width/2 -35;
        str += '<div style="position:absolute;top:'+ y +'px;left:' + x +'px;width:70px;height:30px;border-style:dotted;"></div>';
      }
    });
    target.html(str);
    $("#players-layout div").droppable({
      accept: "#players-list div, #players-layout div",
      tolerance: "touch",
      drop: function(event, ui) {
        var id = ui.draggable.attr('id');
        ui.draggable.hide();
        if (ui.draggable.parent().parent().attr("id") == "players-layout") {
          ui.draggable.parent().droppable("enable");
        }
        $(this).append(makePlayer(id));
        $(this).droppable("disable");
      }
    });
  }

  function findPlayer(id) {
      // Search player data from local cache
      var player;
      var result = $.grep(players, function(item) { return item._id == id; });
      if (result.length == 1) {
        player = result[0];
      }
      return player;
  }

  function makePlayer(player) {
    var $obj;
    if (typeof player == "string") {
      player = findPlayer(player);
    }
    if (player) {
      $obj = $('<div id="' + player._id + '">' + player.name + '</div>').draggable({
        revert: "invalid"
      }).click(function() {
        if ($(this).is('.ui-draggable-dragging')) {
          return;
        }
        var $edit = $("#question-edit").find(".btn-warning");
        if ($edit.length) {
          var re = new RegExp(/<a class="metadata-link" href="((?:\\.|[^"\\])*)">([^<]*)<\/a>/g);
          var id = $(this).attr('id');
          var player = findPlayer(id);
          console.log("Clicked: " + player.name);
          for (var i in question.answers) {
            question.answers[i] = question.answers[i].replace(re, player.name);
            break;
          }
          // Add visual feedback here
          $edit.text(player.name);
          $edit.switchClass("btn-warning", "btn-success");
          $("#question-edit").fadeOut(1000);
          // Notify
          if (typeof editedCallback == "function") {
            console.log("Edit send notify");
            editedCallback(question);
          }
        }
      });
    }
    return $obj;
  }

  function editQuestion(data, callback) {
    // Save current question
    question = data;
    editedCallback = callback;

    // Display
    var re = new RegExp(/<a class="metadata-link" href="((?:\\.|[^"\\])*)">([^<]*)<\/a>/g);
    var box = '<div id="' + data._id + '"class="alert alert-warning fade in">';
    box += '<h4>' + data.caption + '</h4>';
    data.answers.forEach(function(value) {
      var result = re.exec(value);
      if (result) {
        box += '<a class="btn btn-warning" title="' + result[1] + '">' + result[2] + '</a>';
      } else {
        box += '<a class="btn btn-default">' + value + '</a>';
      }
    });
    box += "</div>";
    $("#question-edit").html(box).fadeIn(200).tooltip();

    // Dummy implementation just removing all links
    /*
    data.caption = data.caption.replace(re, "{replace me caption}");
    for (var i in data.answers) {
      data.answers[i] = data.answers[i].replace(re, "{replace me answers}");
      console.log("Replacing answer: " + data.answers[i]);
    }
    data.answers.forEach(function (item) {
      console.log("Replaced answer: " + item);
    });
    callback(data);
    */
  }

}( jQuery ));