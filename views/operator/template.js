$( function() {
  $( "#templates" ).jtable({
    title: "Games",
    jqueryuiTheme: true,
    actions: {
      listAction: function(postData, options){
        return $(this).emit("READ", "templates/any");
      },
      createAction: function(data) {
        return $(this).emit("CREATE", "templates/new", data);
      },
      updateAction: function(data) {
        return $(this).emit("UPDATE", "templates/" + data._id, data);
      },
      deleteAction: function(data){
        return $(this).emit("DELETE", "templates/" + data._id, data);
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