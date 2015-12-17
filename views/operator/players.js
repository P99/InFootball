(function ( $ ) {

  var players;

  $.players = function (teamId) {
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

  function makePlayer(player) {
    var $obj;
    if (typeof player == "string") {
      // Search player data from local cache
      var result = $.grep(players, function(item) { return item._id == player; });
      if (result.length == 1) {
        player = result[0];
      }
    }
    if (player) {
      $obj = $('<div id="' + player._id + '">' + player.name + '</div>').draggable({
        revert: "invalid"
      });;
    }
    return $obj;
  }

}( jQuery ));