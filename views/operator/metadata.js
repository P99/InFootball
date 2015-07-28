$( function() {

  var teams = $.rest({
    model: "teams", 
    namespace: "operator",
    ref: $( "#teams" ),
    type: "jtable"});

  var players = $.rest({
    model: "players", 
    namespace: "operator",
    ref: $( "#players" ),
    type: "jtable"
  });

  $( "#teams" ).jtable({
    title: "Equipes",
    jqueryuiTheme: true,
    actions: teams.actions(),
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
      title: {
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
            players.root = "teams/" + team.record._id + "/";
            $( "#teams" ).hide("slide", { direction: "left" }, 500);
            $( "#players" ).jtable('load').show("slide", { direction: "right" }, 500);
            $( "#players" ).find('.jtable-title-text').html("Equipes / " + team.record.name + " / Joueurs");
          });
          return $button;
        }
      }
    }
  });

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
    actions: players.actions(),
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
