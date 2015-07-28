$( function() {

  var users = $.rest({
    model: "users",
    ref: $( "#users" ),
    namespace: "admin",
    type: "jtable"
  });

  $( "#users" ).jtable({
    title: "Users",
    jqueryuiTheme: true,
    actions: users.actions(),
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

  $( "#users" ).jtable("load", {});
});