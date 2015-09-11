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

  $.metadatalink({
    ref: $( "#question-link-dialog" )
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
          var text = data.record ? data.record.caption : '';
          return '<div>' +
              '<div class="ui-state-default metadata-link" style="width:1em; float:right">' +
              '  <span class="ui-icon ui-icon-link" />' +
              '</div>' +
              '<div class="caption" contenteditable="true" style="margin-right:1.5em">' + text + '</div>' +
              '<input type="text" name="caption" style="display:none;" />' +
            '</div>';
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
      },
      answers: {
        title: "Réponses",
        input: function (data) {
          // Defaults to 3 empty answers
          var answsers = data.record ? data.record.answers.split('|') : [ '', '', '' ];
          var str = '<input class="spinner-answer" />';
          answsers.forEach(function(value, index) {
            str += insertAnswer(value, index);
          });
          str += '<input type="text" name="answers" style="display:none" />';
          return str;
        }
      }
    },
    formCreated: function(event, data) {
      //var link = data.form.find('#question-link');
      //var editor = data.form.find('#question-editor2');
      //editor.blur(function() {
      		// Store selection info into the dialog
        //dialog.linkify();
						//});
      var widget = data.form.find('.spinner-answer');
      widget.spinner({ min: 1, max: 3 });
      widget.spinner('value', data.form.find('div[class^="answer-"]').size());
      widget.on('spin', function(event, ui) {
        if ( ui.value == this.value ) 
          return;

        if ( ui.value < this.value ) {
          data.form.find('div[class^="answer-"]').last().parent().remove();
        } else {
          data.form.find('div[class^="answer-"]').last().parent().after(insertAnswer('', this.value));
        }
      });
      
    },
    formSubmitting: function(event, data) {
      // [caption] Copy over the content of editable div to the hidden input form
      var caption = data.form.find('div[class="caption"]').html();
      data.form.find('input[name="caption"]').attr('value', caption);

      // [answser] Copy over N items and join them into a string
      var answer = "";
      data.form.find('div[class^="answer-"]').not(':last').append('|').end().each(function() {
        answer += $(this).html();
      });
      data.form.find('input[name="answers"]').attr('value', answer);
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

  // Utility
  function insertAnswer(value, index) {
    var str = '<div>';
    str += '  <span class="ui-icon ui-icon-triangle-1-e" style="float:left" />';
    str += '  <div class="ui-state-default metadata-link" style="width:1em; float:right">';
    str += '    <span class="ui-icon ui-icon-link" />';
    str += '  </div>';
    str += '  <div class="answer-' + index + ' " contenteditable="true" style="margin-left:1em;margin-right:1.5em">' + value + '</div>';
    str += '</div>';
    return str;
  }

  templates.ref.jtable("load", {});
  questions.ref.jtable("load", {});
  teams.ref.hide();
});