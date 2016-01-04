(function ( $ ) {

  // All questions sorted in two dimensional array [context][subcontext][questions]
  var questions;
  var contexts;
  var lookup = {};
  var sorted = {};
  var $anchor;

  $.questions = function(options) {
    $anchor = options.ref;
    return new interface();
  };

  function interface() {
    this.init = init;
  }

  function init(list) {
    questions = list;

    // Loading all context data
    $.ajax({
      url: "rest/groups/any",
      async: true,
      dataType: 'json',
      success: function (msg) {
        contexts = msg;
        buildContextArray(msg);
      }
    });
  }

  function buildContextArray(list) {
    var head;
    list.forEach(function(item) {
      lookup[item._id] = item;
      if (item.type === "Main") {
        head = item._id;
      }
    });

    lookup[head].groups.forEach(function (context) {
      sorted[context] = {};
      lookup[context].groups.forEach(function (subcontext) {
        sorted[context][subcontext] = []; // Attach questions here
      });
    });

    questions.forEach(function(item) {
      if (item.context && item.subcontext) {
        sorted[item.context][item.subcontext].push(item);
      } else {
        console.log("Warning: question is missing context or subcontext");
      }
    });

    buildGrid();
  }

  function buildGrid() {
    $anchor.empty();
    var $tabs = $('<ul>');
    var $content = $('<div>');
    $.each(sorted, function(context) {
      $tabs.append('<li><a href="#context-'+ context + '">' + lookup[context].title + '</a></li>');
      var $context = $('<div id="context-' + context + '">');
      var $subtabs = $('<ul>');
      var $subcontent = $('<div>');
      $.each(sorted[context], function(subcontext) {
        $subtabs.append('<li><a href="#subcontext-' + subcontext + '">' + lookup[subcontext].title + '</a></li>');
        var $subcontext = $('<div id="subcontext-' + subcontext + '">');
        $subcontext.append( buildQuestionList(context, subcontext) );
        $subcontent.append($subcontext);
      });
      $context.append($subtabs);
      $context.append($subcontent);
      $content.append($context);
      $context.tabs();
    });
    $anchor.append($tabs);
    $anchor.append($content);
				$anchor.tabs();
  }
  
  function buildQuestionList(context, subcontext) {
    var $list = $('<div>');
    var questions = sorted[context][subcontext];
    $.each(questions, function(index) {
      var question = questions[index];
      var $node = $('<div class="alert alert-warning">');
      $node.attr('id', question._id);
      $node.append( $('<h4>').append(question.caption) );
      $.each(question.answers, function(key) {
        $node.append($('<a class="btn btn-default">').append(question.answers[key]));
      });
      $list.append($node);
    });
    return $list;
  }

}( jQuery ));