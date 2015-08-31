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

  templates.ref.jtable({
    title: "References",
    jqueryuiTheme: true,
    selecting: true,
    actions: templates.actions(),
    fields: {
      _id: {
        key: true,
        list: false
      },
      title: {
        title: "Affiche",
        width: "60%"
      },
      date: {
        type: "date",
        title: "Date",
        displayFormat: "yy-mm-dd",
        width: "30%"
      },
      teams: {
        edit: false,
        create: false,
        display: function (data) {
          var img = $("<img src='assets/teams.png' />");
          img.click(function() {
            teams.root = "templates/" + data.record._id + "/";
            teams.ref.jtable("load", {}, function() {
              teams.ref.jtable("selectRows", $( "#teams-selection tr.jtable-data-row"));
            });

            questions.ref.hide();
            teams.ref.show();
          });
          return img;
        }
      },
      questions: {
        edit: false,
        create: false,
        display: function (data) {
          var img = $("<img src='assets/questions.png' />");
          img.click(function() {
            questions.root = "templates/" + data.record._id + "/";
            questions.ref.jtable("load", {}, function() {
              questions.ref.jtable("selectRows", $( "#questions tr.jtable-data-row"));
            });
            teams.ref.hide();
            questions.ref.show();
          });
          return img;
        }
      }
    },
    selectionChanged: function(event, data) {
      var selected = templates.ref.jtable('selectedRows');
      if (selected.length) {
        current = $(selected[0]).data('record')._id;
      }
    }
  });

  questions.ref.jtable({
    title: "Questions:",
    jqueryuiTheme: true,
    selecting: true,
    multiselect: true,
    selectingCheckboxes: true,
    actions: questions.actions(),
    toolbar: {
      items: [{
        text: "Tout afficher",
        click: function () {
          questions.root = "";
          questions.ref.jtable("load");
        }
      },
      {
        text: "Valider",
        click: function () {
          var selectedRows = questions.ref.jtable('selectedRows');
          var selection = [];
          selectedRows.each(function () {
            var record = $(this).data('record');
            selection.push(record._id);
          });

          templates.emit("UPDATE", { _id: current, questions: selection }).done(function() {
            questions.root = "templates/" + current + "/";
            questions.ref.jtable("reload");
          });
        }
      }]
    },
    fields: {
      _id: {
        key: true,
        list: false
      },
      caption: {
        title: "Intitulé",
        input: function(data) {
          var content = $('<div>');
          var editable = $('<div contenteditable>');
          var toolbar = $('<div>');
          var placeholder = $('<input>').hide();

          if (data.record) {
            editable.html(data.record.caption);
          }
          editable.attr('id', 'question-editor');
          
          var link = $('<div>');
          link.attr('id', 'question-link');
          link.attr('class', 'ui-state-default');
          link.append($('<span>').attr('class', 'ui-icon ui-icon-link'));
          toolbar.append(link);

          placeholder.attr('type', 'text');
          placeholder.attr('name', 'caption');

          return content.append(toolbar, editable, placeholder).html();
        }
      },
      type: {
        title: "Type",
        options: ["Oui/Non", "Multiple"]
      },
      status: {
        title: "Statut",
        options: ["Chaud", "Froid"]
      },
      difficulty: {
        title: "Difficulté",
        options: {"1": "Facile", "2": "Moyen", "3": "Difficile"}
      }
    },
    formCreated: function(event, data) {
      var link = data.form.find('#question-link');
      link.click(function() {
        // Todo: Show a dialog to select metadata
        // drop-down: [Model] Game | Team | Player
        // drop-down: [Field] Caption | Name | etc
        // drop-down: [Condition] Equals | Not equal | Contains
        // textfield: with suggestion
        console.log("Show metadata dialog here");
      });
      link.hover(function() {
        $(this).toggleClass('ui-state-hover');
      });
    },
    formSubmitting: function(event, data) {
      // Copy over the content of editable div to the hidden input form
      data.form.find('input[name="caption"]').attr('value', $('#question-editor').html());
    }
  });

  teams.ref.jtable({
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
           teams.ref.jtable("load");
         }
       },
       {
         text: "Valider",
         click: function () {
           var selectedRows = teams.ref.jtable('selectedRows');
           var selectedTeams = [];
           selectedRows.each(function () {
             var record = $(this).data('record');
             selectedTeams.push(record._id);
           });

           if (selectedTeams.length == 2) {
             templates.emit("UPDATE", { _id: current, teams: selectedTeams }).done(function() {
               teams.root = "templates/" + current + "/";
               teams.ref.jtable("reload");
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

  templates.ref.jtable("load", {});
  questions.ref.jtable("load", {});
  teams.ref.hide();
});