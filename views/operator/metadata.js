$( function() {
  $( "#teams" ).jtable({
    title: "Equipes",
    jqueryuiTheme: true,
    actions: {
      listAction: function(postData, options) {
        return $(this).emit("READ", "teams/any");
      },
      createAction: function(postData) {
        var data = extract(postData);
        return $(this).emit("CREATE", "teams/new", data);
      },
      updateAction: function(postData) {
        var data = extract(postData);
        return $(this).emit("UPDATE", "teams/" + data._id, data);
      },
      deleteAction: function(data){
        return $(this).emit("DELETE", "teams/" + data._id, data);
      }
    },
    fields: {
      _id: {
        key: true,
        list: false
      },
      logo: {
        title: "Logo",
        display: function(team) {
          return $('<img src="' + team.record.logo + '"></img>');
        }
      },
      name: {
        title: "Equipe"
      },
      coach: {
        title: "Entraineur"
      },
      president: {
        title: "President"
      },
      stadium: {
        title: "Stade"
      },
      players: {
        title: "Joueurs",
        edit: false,
        create: false,
        display: function(team) {
          var $button = $('<button />');
          $button.button({ 
            icons: { secondary: "ui-icon-triangle-1-e" },
            label: "edit"
          }).click(function() {
            console.log("Editing team/" + team.record._id + "/players/");
            $(this).setRoot("players", "teams/" + team.record._id + "/");
            $( "#teams" ).hide("slide", { direction: "left" }, 500);
            $( "#players" ).jtable('load').show("slide", { direction: "right" }, 500);
            $( "#players" ).find('.jtable-title-text').html("Equipes / " + team.record.name + " / Joueurs");
          });
          return $button;
        }
      }
    }
  }); // End "#teams" jtable
  //
  $( "#players" ).jtable({
    title: "Joueurs",
    jqueryuiTheme: true,
    toolbar: {
      items: [{
        text: 'Back',
        click: function () {
            root = "";
            $( "#players" ).hide("slide", { direction: "right" }, 500);
            $( "#teams" ).show("slide", { direction: "left" }, 500);
        }
      }]
    },
    actions: {
      listAction: function(postData, options) {
        return $(this).emit("READ", "players/any");
      },
      createAction: function(postData) {
        var data = extract(postData);
        return $(this).emit("CREATE", "players/new", data);
      },
      updateAction: function(postData) {
        var data = extract(postData);
        return $(this).emit("UPDATE", "players/" + data._id, data);
      },
      deleteAction: function(data){
        return $(this).emit("DELETE", "players/" + data._id, data);
      }
    },
    fields: {
      _id: {
        key: true,
        list: false
      },
      photo: {
        title: "Photo",
        display: function(model) {
          return $('<img src="' + model.record.photo + '"></img>');
        }
      },
      name: {
        title: "Nom"
      },
      nationality: {
        title: "Pays"
      },
      age: {
        title: "Age"
      },
      position: {
        title: "Poste"
      },
      number: {
        title: "Maillot"
      }
    }
  }).hide(); // End "#players" jtable

  $( "#teams" ).jtable("load", {});
});
