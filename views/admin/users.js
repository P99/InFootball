$( function() {
  $( "#users" ).jtable({
    title: "Users",
    jqueryuiTheme: true,
    actions: {
      listAction: function(postData, options) {
        return $.rest.emit("READ", "users");
      },
      createAction: function(data) {
        return $.rest.emit("CREATE", "users", data);
      },
      updateAction: function(data) {
        return $.rest.emit("UPDATE", "users", data);
      },
      deleteAction: function(data){
        return $.rest.emit("DELETE", "users", data);
      }
    },
    fields: {
      _id: {
        key: true,
        list: false
      },
      username: {
        title: "Login"
      },
      password: {
        title: "Password",
        type: 'password',
        list: false
      },
      email: {
        title: "Email"
      },
      firstName: {
        title: "First name"
      },
      lastName: {
        title: "Last name"
      },
      type: {
        title: "Type",
        options: ['Player','Operator','Admin']
      }
    }
  });
  $.rest.register("users", "admin");
  $( "#users" ).jtable("load", {});
});