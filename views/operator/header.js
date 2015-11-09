$(function() {
  var header = $("#user-menu");
  var button = header.find("button");
  var dropdown = header.find("ul");
  button.button({
    icons: {
      secondary: "ui-icon-triangle-1-s"
    }
  }).click(function() {
    dropdown.show();
  }).css("min-width", "6em");
  dropdown.menu({
    select: function(event, ui) {
      switch(ui.item.text()) {
      case "Logout":
        document.location = "/signout";
        break;
      default:
        console.log("Menu item slected: " + ui.item.text());
      }
      dropdown.hide();
    }
  }).position({
    my: "left top ",
    at: "left bottom",
    of: button
  }).hide();
  header.mouseleave(function() { 
    dropdown.hide();
  });
});
