$( function() {
  $( "#templates" ).jtable({
    title: "Games",
    jqueryuiTheme: true,
    actions: {
      listAction: function(postData, options){
        return $.rest.emit("READ", "templates");
      },
      createAction: function(data) {
        return $.rest.emit("CREATE", "templates", data);
      },
      updateAction: function(data) {
        return $.rest.emit("UPDATE", "templates", data);
      },
      deleteAction: function(data){
        return $.rest.emit("DELETE", "templates", data);
      }
    },
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
    }
  });
  $( "#templates" ).jtable("load", {});
});