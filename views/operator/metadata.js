$( function() {
  $( "#teams" ).jtable({
    title: "Equipes",
    jqueryuiTheme: true,
    actions: {
      listAction: function(postData, options) {
        return $.rest.emit("READ", "teams");
      },
      createAction: function(data) {
        return $.rest.emit("CREATE", "teams", data);
      },
      updateAction: function(data) {
        return $.rest.emit("UPDATE", "teams", data);
      },
      deleteAction: function(data){
        return $.rest.emit("DELETE", "teams", data);
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
            $.rest.setRoot("players", "teams/" + team.record._id + "/");
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
        return $.rest.emit("READ", "players");
      },
      createAction: function(data) {
        return $.rest.emit("CREATE", "players", data);
      },
      updateAction: function(data) {
        return $.rest.emit("UPDATE", "players", data);
      },
      deleteAction: function(data){
        return $.rest.emit("DELETE", "players", data);
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
