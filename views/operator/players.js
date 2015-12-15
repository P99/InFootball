(function ( $ ) {

  var players;

  $.players = function (teamId) {
    $.ajax({
      url: "rest/teams/" + teamId + "/players/any",
      async: true,
      dataType: 'json',
      success: function (msg) {
         // Build the list of players
        var str = '<ul>';
        players = msg;
        players.forEach(function(player) {
          str += '<li>' + makePlayer(player) + '</li>';
        });
        str += '</ul>';
        $('#players-list').html(str);
        $('#players-list div').draggable({
          revert: "invalid"
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
      accept: "#players-list div",
      tolerance: "touch",
      drop: function(event, ui) {
        ui.draggable.hide();
        var id = ui.draggable.attr('id');
        var $obj = $(makePlayer(id)).draggable({
          revert: "invalid"
        });
        $(this).append($obj);
      }
    });
    $("#players-list").droppable({
      accept: "#players-layout div",
      drop: function(event, ui) {
      }
    });
  }

  function makePlayer(player) {
    var str;
    if (typeof player == "string") {
      // Search player data from local cache
      var result = $.grep(players, function(item) { return item._id == player; });
      if (result.length == 1) {
        player = result[0];
      }
    }
    if (player) {
      str = '<div id="' + player._id + '">' + player.name + '</div>';
    }
    return str;
  }

}( jQuery ));