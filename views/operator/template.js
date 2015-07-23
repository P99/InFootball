$( function() {
  var current;
  $( "#templates" ).jtable({
    title: "Games",
    jqueryuiTheme: true,
    actions: $.rest.actions("templates"),
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
            $.rest.setRoot("teams", "templates/" + data.record._id + "/");
            $( "#teams-selection" ).jtable("reload", function() {
              //Select all rows ???
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
            $.rest.setRoot("questions", "templates/" + data.record._id + "/");
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
    actions: $.rest.actions("questions"),
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
          return $.rest.emit("READ", "teams");
       }
     },
     toolbar: {
       items: [{
         text: "Tout afficher",
         click: function () {
           console.log("Selectionner les équipes");
           $.rest.setRoot("teams", "");
           $( "#teams-selection" ).jtable("reload");
         }
       },
       {
         text: "Valider",
         click: function () {
           console.log("Valider les équipes");
           var selectedRows = $('#teams-selection').jtable('selectedRows');
           var selectedTeams = [];
           selectedRows.each(function () {
             var record = $(this).data('record');
             selectedTeams.push(record._id);
           });

           if (selectedTeams.length == 2) {
             $.rest.emit("UPDATE", "templates", { _id: current, teams: selectedTeams }).done(function() {
               $.rest.setRoot("teams", "templates/" + current + "/");
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

  $.rest.register("templates", "operator");
  $( "#templates" ).jtable("load", {});

  $.rest.register("questions", "operator");
  $( "#questions" ).jtable("load", {});

  $.rest.register("teams", "operator");
  $( "#teams-selection" ).jtable("load", {});
  $( "#teams-selection" ).hide();
});