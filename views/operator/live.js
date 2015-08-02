$( function() {
  var optionsTemplates;
  var currentGame;

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

  var history = $.rest({
    model: "questions",
    namespace: "operator",
    ref: $( "#question-editor" ),
    type: "jtable"
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
        template: {
          title: "Modèle",
          options: function(data) { return optionsTemplates.Options; }
        },
        action: {
          title: "Action",
          display: function(data) {
            var $button = $('<button />');
            $button.button({ 
              icons: { secondary: "ui-icon-triangle-1-e" },
              label: "Rejoindre"
            }).click(function() {
              console.log("Join game: " + data.record._id);
              currentGame = data.record;
              games.emit("JOIN", data.record);

              // Todo: retreive data about teams from the template ID
              // But the call is asynchrnous and also READ only implements list queries
              // Should add a 'recursive' options ( games > template > teams )
              $( "#game-toolbar" ).append('div').html("Match XXXX - " + data.record.status);
              $( "#game-toolbar" ).append($('<button />').button({
                  label: "Quitter"
                }).click(function() {
                  games.emit("LEAVE", data.record);

                  questions.ref.hide();
                  history.ref.hide();
                  $( "#game-toolbar" ).empty();
                  games.ref.show();
                })
              );

              questions.root = "templates/" + data.record.template + "/";
              questions.ref.jtable('load');

              history.root = "games/" + currentGame._id + "/";
              history.ref.jtable('load');

              games.ref.hide();
              questions.ref.show();
              history.ref.show();
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
              //if (!(currentGame.questions instanceof Array)) {
              //  currentGame.questions = [];
              //}
              //currentGame.questions.push(data.record._id);
              //games.emit("UPDATE", currentGame);
              var copy = $.extend({}, data.record);
              delete copy._id; // Because MongoDB should assign a new ID for this Object

              //history.emit("CREATE", copy);
              var sav = questions.root;
              questions.root = "games/" + currentGame._id + "/";
              questions.emit("CREATE", copy);
              questions.root = sav;
            });
            return $button;
          }
        }
      }
  }).hide();

  history.ref.jtable({
      title: "En attente:",
      jqueryuiTheme: true,
      selecting: true,
      actions: {
        listAction: function(postData, options) {
          return history.emit("READ");
        }
      },
      fields: {
        _id: {
          key: true,
          list: false
        },
        caption: {
          title: "Intitulé"
        }
      }
  }).hide();

});
