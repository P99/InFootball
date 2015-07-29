$( function() {
  var optionsTemplates;

  var games = $.rest({
    model: "games",
    namespace: "operator",
    ref: $( "#games" ),
    type: "jtable"
  });

  var questions = $.rest({
    model: "questions",
    namespace: "operator",
    ref: $( "#questions-selection" ),
    type: "jtable"
  });

  var templates = $.rest({
    model: "templates",
    namespace: "operator",
    ref: function(data) { optionsTemplates = data; },
    type: "options"
  });

  // Load async options for template field
  templates.emit("READ").done(function(data) {
    optionsTemplates = data;

    $( "#games" ).jtable({
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
              games.emit("JOIN", data.record);

              // Todo retreive data about teams from the template ID
              // ie: $.rest.emit("READ", "templates/" + data.record.template );
              // But the call is asynchrnous and also READ only implements list queries
              $( "#game-toolbar" ).html("Match XXXX - " + data.record.status);

              questions.root = "templates/" + data.record.template + "/";
              $("#questions-selection").jtable('load');

              $( "#games" ).hide();
              $( "#questions-selection" ).show();
            });
            return $button;
          }
        }
      }
    });

    $( "#games" ).jtable("load", {});
  }); // End loading templates option
  
  $( "#questions-selection" ).jtable({
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
          title: "Intitulé"
        }
      }
  }).hide();

});
