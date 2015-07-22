$( function() {
  $.rest.register("games", "operator");

  // Load async options for template field
  $.rest.options("templates").done(function(templates) {

    $( "#games" ).jtable({
      title: "En cours...",
      jqueryuiTheme: true,
      actions: $.rest.actions("games"),
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
          options: function(data) { return templates.Options; }
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
              $.rest.emit("JOIN", "games", data.record);
              $( "#games" ).hide();
            });
            return $button;
          }
        }
      }
    });

    $( "#games" ).jtable("load", {});
  });
});
