$(function() {
  var menu = $("#user-menu");
  $("#user-settings").button({
    icons: {
      secondary: "ui-icon-triangle-1-s"
    }
  }).click(function() {
    menu.show();
  }).css("min-width", "6em");
  menu.menu({
    select: function(event, ui) {
      switch(ui.item.text()) {
      case "Logout":
        document.location = "/signout";
        break;
      default:
        console.log("Menu item slected: " + ui.item.text());
      }
      menu.hide();
    }
  }).position({
    my: "left top ",
    at: "left bottom",
    of: $("#user-settings")
  }).hide();
  $("#user-settings, #user-menu").mouseleave(function() { 
    if(!menu.is(":hover")) {
      menu.hide();
    }
  });
});
