$( function() {
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
            ref.datetimepicker();
          }, 100);;
          return ref;
        }
      },
      duration: {
        title: "Durée",
        input: function() {
          var ref = $("<input>").attr("name", "duration");
          setTimeout(function(){
            ref.spinner({ step: 1, min: 0});
            ref.spinner("value", 90);
          }, 100);;
          return ref;
        }
      },
      status : {
        title: "Statut"
      },
      //template: {
      //  title: "Modèle"
      //}
    }
  });
  $.rest.register("games", "operator");
  $( "#games" ).jtable("load", {});
});