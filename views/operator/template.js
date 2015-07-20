$( function() {
  $( "#templates" ).jtable({
    title: "Games",
    jqueryuiTheme: true,
    selecting: true,
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
      }
    },
    selectionChanged: function() {
      var selection = $(this).jtable('selectedRows');
      if (selection.length > 0) {
        selection.each(function() {
          var record = $(this).data('record');
          $.rest.setRoot("questions", "templates/" + record._id + "/");
        });
      } else {
        $.rest.setRoot("questions", "");
      }
      $( "#questions" ).jtable("reload");
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

  $.rest.register("templates", "operator");
  $( "#templates" ).jtable("load", {});

  $.rest.register("questions", "operator");
  $( "#questions" ).jtable("load", {});
});