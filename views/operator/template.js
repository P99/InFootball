$( function() {
  $( "#templates" ).jtable({
    title: "Games",
    jqueryuiTheme: true,
    actions: {
      listAction: function(postData, options){
        return $(this).emit("READ", "templates");
      },
      createAction: function(data) {
        return $(this).emit("CREATE", "templates", data);
      },
      updateAction: function(data) {
        return $(this).emit("UPDATE", "templates", data);
      },
      deleteAction: function(data){
        return $(this).emit("DELETE", "templates", data);
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