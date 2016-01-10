(function ( $ ) {

  var players;
  var question;
  var editedCallback;

  $.operator3 = function(options) {
    return new interface();
  };

  function interface() {
    this.load = loadPlayers;
    this.edit = editQuestion;
    this.cancel = cancelQuestion;
  }

  function loadPlayers(teamId) {

    $("#players-composition").prop("selectedIndex", 0);

    $.ajax({
      url: "rest/teams/" + teamId + "/players/any",
      async: true,
      dataType: 'json',
      success: function (msg) {
        players = msg;

        updatePlayers();
        $("#players-composition").change(updateComposition);
      }
    })
  }

  function updatePlayers() {
				var $container = $('#players-list');
    $container.empty();
    $("#players-layout").empty();

    var $list = $("<ul>");
    // Build the list of players
    players.forEach(function(player) {
      $item = $("<li>");
      $item.append(makePlayer(player));
      $list.append($item);
    });
    $container.append($list);
    $container.droppable({
      accept: "#players-layout div",
      drop: function(event, ui) {
        var id = ui.draggable.attr('id');
        $("#players-layout").find("#" + id).parent().empty().droppable("enable");
        $container.find("#" + id).attr("style", "position: relative").show();
      }
    });
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
    updatePlayers();

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

  // Search player data from local cache
  function findPlayer(id) {
      var player;
      var result = $.grep(players, function(item) { return item._id == id; });
      if (result.length == 1) {
        player = result[0];
      }
      return player;
  }

  // Build a draggable object from player data
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
          // Ignore click to start a drag and drop event
          return;
        }
        var $metadata = $("#question-edit").find(".label-warning");
        var $edit = $metadata.first();
        var index = $edit.parent().index();
        if (index >= 0) {
          var re = new RegExp(/<a class="metadata-link" href="((?:\\.|[^"\\])*)">([^<]*)<\/a>/g);
          var id = $(this).attr('id');
          var player = findPlayer(id);
          if (index == 0) {
            question.caption = question.caption.replace(re, player.name);
          } else {
            index--; // Because the first childnode is the question title
            question.answers[index] = question.answers[index].replace(re, player.name);
          }
          $edit.text(player.name);
          $edit.removeClass("label-warning").addClass("label-success");

          // Notify
          if ((typeof editedCallback == "function")
            && ($metadata.length == 1)) {
            console.log("Edit send notify");
            editedCallback(question);
            $("#question-edit").fadeOut(700);
          }
        }
      });
    }
    return $obj;
  }

  function replaceMetadata(str) {
    var re = new RegExp(/<a class="metadata-link" href="((?:\\.|[^"\\])*)">([^<]*)<\/a>/g);
    return str.replace(re, '<span class="label label-warning" title="$1">$2</span>');
  }

  function editQuestion(data, callback) {
    // Save current question
    // Todo: Stack the questions in a list if op3 not fast enougth
    question = data;
    editedCallback = callback;

    // Display
    var box = '<div id="op3-' + data._id + '"class="alert alert-warning fade in">';
    box += '<h4>' + replaceMetadata(data.caption) + '</h4>';
    data.answers.forEach(function(value) {
      box += '<a class="btn btn-default">' + replaceMetadata(value) + '</a>';
    });
    box += "</div>";
    $("#question-edit").html(box).fadeIn(200).tooltip();
  }

  function cancelQuestion(data) {
    if (data && question && (data._id == question._id)) {
      question = undefined;
      $("#question-edit").empty();
    }
  }

}( jQuery ));