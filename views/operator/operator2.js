(function ( $ ) {

  var $anchor;

  $.operator2 = function(options) {
    $anchor = options.ref;
    return new interface();
  };

  function interface() {
    this.answer = answer;
    this.cancel = cancel;
  }

  function answer(data, callback) {
    console.log("Receiving new question");
    var box = '<div id="' + data._id + '"class="alert alert-warning fade in">';
    box += '<a class="close">x</a>';
    box += '<h4>' + data.caption + '</h4>';
    data.answers.forEach(function(value) {
      box += '<a class="btn btn-default">' + value + '</a>';
    });
    box += "</div>";
    var $box = $(box);
    $box.find(".btn").on('click', function(event) {
      data.validation = event.currentTarget.text;
      callback("select", data);
      $(this).parent().hide();
      event.preventDefault();
    });
    $box.find(".close").on('click', function(event) {
      callback("cancel", data);
      $(this).parent().hide();
      event.preventDefault();
    });
    $anchor.append($box);
  }

  function cancel(data) {
    var $box = $("#" + data._id).hide();
  }

}( jQuery ));