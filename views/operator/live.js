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

  var game = $.football({
    namespace: "operator"
  });

  var op3 = $.players({});

  var op1 = $.questions({
    ref: $( "#questions-selection2" ),
    send: function(data) {
      game.send(data);
    }
  });

  // Operator 3 - Actually replacing metadata
  game.on('edit', function (data) {
    console.log("EDIT: " + JSON.stringify(data));
    data = op3.edit(data, function(data) {
      game.send(data);
    });
  });

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
    op3.cancel(data);
  });

  // Synchronize concurent actions of various operators
  game.on('close', function (data) {
    var $box = $("#" + data._id).hide();
    op3.cancel(data);
  });

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
        templates: {
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

              $( "#tabs-live" ).show();

              $.ajax({
                url: "rest/games/" + data.record._id + "?recurse=true",
                async: true,
                dataType: 'json',
                success: function (result) {
                  game.data = result;
                  $( "#game-toolbar" ).append('div').html("Match "
                    + game.data.title + ", "
                    + game.data.start.replace(/(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}):\d{2}\.\d{3}Z/g, '$1 $2') + ", "
                    + game.data.templates.teams[0].title + " - " + game.data.templates.teams[1].title + " ");

                  // Todo: Make sure we can choose the other team as well?
                  op3.load(game.data.templates.teams[0]._id);
                  op1.init(game.data.templates.questions);

                  $( "#game-toolbar" ).append($('<button />').button({
                    label: "Quitter"
                  }).click(function() {
                    game.leave();

                    op1.close();
                    $( "#tabs-live" ).hide();
                    $( "#game-toolbar" ).empty();
                    games.ref.show();
                  })
                );
                }
              });

              games.ref.hide();
            });
            return $button;
          }
        }
      }
    });

    games.ref.jtable("load", {});
  }); // End loading templates option

  $( "#tabs-live" ).tabs().hide();

});
