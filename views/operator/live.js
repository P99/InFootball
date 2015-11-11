$( function() {
  var optionsTemplates;

  var games = $.rest({
    model: "games",
    namespace: "operator",
    ref: $( "#games" ),
    type: "jtable"
  });

  var templates = $.rest({
    model: "templates",
    namespace: "operator",
    ref: function(data) { optionsTemplates = data; },
    type: "options"
  });

  var questions = $.rest({
    model: "questions",
    namespace: "operator",
    ref: $( "#questions-selection" ),
    type: "jtable"
  });

  var game = $.football({
    namespace: "operator"
  });

  // Operator 3 - Fake replacing metadata
  game.on('edit', function (data) {
    console.log("EDIT: " + JSON.stringify(data));
    // Dummy implementation just removing links
    var re = new RegExp(/<a class="metadata-link" href="((?:\\.|[^"\\])*)">([^<]*)<\/a>/g);
    data.caption = data.caption.replace(re, "{replace me}");
    for (var i in data.answers) {
      console.log(" > " + i);
      data.answers[i] = data.answers[i].replace(re, "{replace me answers}");
      console.log("Replacing answer: " + data.answers[i]);
    }
    data.answers.forEach(function (item) {
      console.log("Replaced answer: " + item);
    });
    game.send(data);
  });
  // UI
  $.ajax({
    url: "rest/teams/55b00e2b85ef5a7c0edb3166/players/any",
    async: true,
    dataType: 'json',
    success: function (players) {
      var str = '<ul>';
      players.forEach(function(player) {
        str += '<li>' + player.name + '</li>';
      });
      str += '</ul>';
      $('#players-list').html(str);
      $('#players-list li').draggable({ revert: true });
    }
  });
  $("#players-composition").change(
    function (e) {
      var composition = $(this).val();
      var field = $("#players-field");
      var target = field.find("#players-layout");
      console.log("SELECT SELECT:  " + composition );

      var str = '';
      var rows = composition.split("-");
      var height = field.height() / rows.length;
      
      rows.reverse().forEach(function(value, index) {
         var y = height * index + height/2 -15;
         var width = field.width() / value;
         for (var i=0; i<value; i++) {
           var x = width * i + width/2 -35;
           str += '<div style="position:absolute;top:'+ y +'px;left:' + x +'px;width:70px;height:30px;border-style:dotted;"></div>';
         }
      });
      target.html(str);
      $("#players-layout div").droppable({
        'drop': function(event, ui) {
          console.log("DROP DROP DROP: ")
        }
      });
      
    }
  );

  // Operator 2 - Answering questions
  game.on('sent', function (data) {
    console.log("Receiving new question");
    var box = '<div id="' + data._id + '"class="alert alert-warning fade in">';
    box += '<a class="close">x</a>';
    box += '<h4>' + data.caption + '</h4>';
    //box += '<p>';
    data.answers.forEach(function(value) {
      box += '<a class="btn btn-default">' + value + '</a>';
    });
    //box += '</p>';
    box += "</div>";
    var $box = $(box);
    $box.find(".btn").on('click', function(event) {
      data.validation = event.currentTarget.text;
      game.select(data);
      $(this).parent().hide();
      event.preventDefault();
    });
    $box.find(".close").on('click', function(event) {
      game.cancel(data);
      $(this).parent().hide();
      event.preventDefault();
    });
    $("#questions-answers").append($box);
  });
  $(document)

  // Load async options for template field
  templates.emit("READ").done(function(data) {
    optionsTemplates = data;

    games.ref.jtable({
      title: "En cours...",
      jqueryuiTheme: true,
      actions: games.actions(),
      fields: {
        _id: {
          key: true,
          list: false
        },
        title: {
          title: "Match"
        },
        start: {
          title: "Début",
          display: function(data) {
            // Formating date from "2015-07-14T03:00:00.000Z" to "2015-07-14 03:00"
            return data.record.start.replace(/(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}):\d{2}\.\d{3}Z/g, "$1 $2");
          },
          input: function(data) {
            var ref = $("<input>").attr("name", "start");
            setTimeout(function(){
              ref.datetimepicker({format:'Y-m-d H:i'});
            }, 100);;
            return ref;
          }
        },
        duration: {
          title: "Durée",
          input: function() {
            var ref = $("<input />").attr("name", "duration");
            setTimeout(function(){
              ref.spinner({ step: 1, min: 0});
              ref.spinner("value", 90);
            }, 10);;
            return ref;
          }
        },
        status : {
          title: "Statut",
          edit: false
        },
        template: {
          title: "Modèle",
          options: function(data) { return optionsTemplates.Options; }
        },
        action: {
          title: "Action",
          edit: false,
          create: false,
          display: function(data) {
            var $button = $('<button />');
            $button.button({ 
              icons: { secondary: "ui-icon-triangle-1-e" },
              label: "Rejoindre"
            }).click(function() {
              console.log("Join game: " + data.record._id);
              game.join(data.record._id);

              // Todo: retreive data about teams from the template ID
              // But the call is asynchrnous and also READ only implements list queries
              // Should add a 'recursive' options ( games > template > teams )
              $( "#tabs-live" ).show();
              $( "#game-toolbar" ).append('div').html("Match XXXX - " + data.record.status);
              $( "#game-toolbar" ).append($('<button />').button({
                  label: "Quitter"
                }).click(function() {
                  game.leave();

                  questions.ref.hide();
                  $( "#tabs-live" ).hide();
                  $( "#game-toolbar" ).empty();
                  games.ref.show();
                })
              );

              questions.root = "templates/" + data.record.template + "/";
              questions.ref.jtable('load');

              games.ref.hide();
              questions.ref.show();
            });
            return $button;
          }
        }
      }
    });

    games.ref.jtable("load", {});
  }); // End loading templates option
  
  questions.ref.jtable({
      title: "Sélection des questions",
      jqueryuiTheme: true,
      selecting: true,
      actions: {
        listAction: function(postData, options) {
          console.log("list actions questions");
          return questions.emit("READ");
        }
      },
      fields: {
        _id: {
          key: true,
          list: false
        },
        caption: {
          title: "Intitulé",
          width: "70%"
        },
        action: {
          title: "",
          display: function (data) {
            var $button = $('<button />');
            $button.button({ 
              icons: { secondary: "ui-icon-triangle-1-e" },
              label: "Envoyer"
            }).click(function() {
              game.send(data.record);
            });
            return $button;
          }
        }
      }
  }).hide();

  $( "#tabs-live" ).tabs().hide();

});
