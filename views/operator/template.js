$( function() {
  var current;

  var templates = $.rest({
    model: "templates",
    namespace: "operator",
    ref: $( "#templates" ),
    type: "jtable"
  });

  var teams = $.rest({
    model: "teams",
    namespace: "operator",
    ref: $( "#teams-selection" ),
    type: "jtable"
  });

  var questions = $.rest({
    model: "questions", 
    namespace: "operator",
    ref: $( "#questions" ),
    type: "jtable"
  });

  $( "#templates" ).jtable({
    title: "Games",
    jqueryuiTheme: true,
    selecting: true,
    actions: templates.actions(),
    fields: {
      _id: {
        key: true,
        list: false
      },
      title: {
        title: "Affiche"
      },
      date: {
        type: "date",
        title: "Date",
        displayFormat: "yy-mm-dd"
      },
      teams: {
        title: "Equipes",
        edit: false,
        create: false,
        display: function (data) {
          var button = $("<button/>");
          button.button({ 
            icons: { secondary: "ui-icon-triangle-1-e" },
            label: "edit"
          }).click(function() {
            current = data.record._id;
            teams.root = "templates/" + data.record._id + "/";
            $( "#teams-selection" ).jtable("load", {}, function() {
              $( "#teams-selection" ).jtable("selectRows", $( "#teams-selection tr"));
            });

            $( "#questions" ).hide();
            $( "#teams-selection" ).show();
          });
          return button;
        }
      },
      questions: {
        title: "Questions",
        edit: false,
        create: false,
        display: function (data) {
          var button = $("<button/>");
          button.button({ 
            icons: { secondary: "ui-icon-triangle-1-e" },
            label: "edit"
          }).click(function() {
            questions.root = "templates/" + data.record._id + "/";
            $( "#questions" ).jtable("reload");

            $( "#teams-selection" ).hide();
            $( "#questions" ).show();
          });
          return button;
        }
      }
    }
  });

  $( "#questions" ).jtable({
    title: "Questions:",
    jqueryuiTheme: true,
    actions: questions.actions(),
    fields: {
      _id: {
        key: true,
        list: false
      },
      caption: {
        title: "Intitulé"
      },
      type: {
        title: "Type",
        type: "radiobutton",
        options: ["Oui/Non", "Multiple"]
      },
      status: {
        title: "Statut",
        type: "radiobutton",
        options: ["Chaud", "Froid"]
      },
      difficulty: {
        title: "Difficulté",
        options: {"1": "Facile", "2": "Moyen", "3": "Difficile"}
      }
    }
  });

  $( "#teams-selection" ).jtable({
     title: "Selection des équipes:",
     jqueryuiTheme: true,
     selecting: true,
     multiselect: true,
     selectingCheckboxes: true,
     animationsEnabled: false,
     actions: {
       listAction: function(postData, options) {
          return teams.emit("READ");
       }
     },
     toolbar: {
       items: [{
         text: "Tout afficher",
         click: function () {
           teams.root = "";
           $( "#teams-selection" ).jtable("load");
         }
       },
       {
         text: "Valider",
         click: function () {
           var selectedRows = $('#teams-selection').jtable('selectedRows');
           var selectedTeams = [];
           selectedRows.each(function () {
             var record = $(this).data('record');
             selectedTeams.push(record._id);
           });

           if (selectedTeams.length == 2) {
             templates.emit("UPDATE", { _id: current, teams: selectedTeams }).done(function() {
               teams.root = "templates/" + current + "/";
               $( "#teams-selection" ).jtable("reload");
             });
           }
         }
       }]
     },
     fields: {
       _id: {
        key: true,
        list: false
      },
      title: {
        title: "Name"
      }
    }
  });

  $( "#templates" ).jtable("load", {});
  $( "#questions" ).jtable("load", {});
  $( "#teams-selection" ).jtable("load", {});
  $( "#teams-selection" ).hide();
});