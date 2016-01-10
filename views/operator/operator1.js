(function ( $ ) {

  // All questions sorted in two dimensional array [context][subcontext][questions]
  var questions;
  var contexts;
  var lookup = {};
  var sorted = {};
  var $anchor;
  var callback;
  var currentContext;
  var currentSubcontext;

  $.operator1 = function(options) {
    $anchor = options.ref;
    callback = options.send;
    return new interface();
  };

  function interface() {
    this.init = init;
    this.close = close;
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
        draw(msg);
      }
    });
  }

  function close() {
    $anchor.hide();
    $anchor.tabs( "destroy" );
    $anchor.empty();
  }

  function draw(data) {
    $anchor.empty();
    buildContextArray(data);
    nextQuestion();
    $anchor.show();
  }

  // Sort questions by context / subcontext
  // so we can access them quickly
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

  // Build the UI, by defaults all questions are hidden
  function buildGrid() {
    var $tabs = $('<ul>');
    var $content = $('<div>');
    $.each(sorted, function(context) {
      currentContext = (currentContext || context);
      $tabs.append('<li><a href="#context-'+ context + '">' + lookup[context].title + '</a></li>');
      var $context = $('<div id="context-' + context + '">');
      var $subtabs = $('<ul>');
      var $subcontent = $('<div>');
      $.each(sorted[context], function(subcontext) {
        currentSubcontext = (currentSubcontext || subcontext);
        $subtabs.append('<li><a href="#subcontext-' + subcontext + '">' + lookup[subcontext].title + '</a></li>');
        var $subcontext = $('<div id="subcontext-' + subcontext + '">');
        $subcontext.append( buildQuestionList(context, subcontext) );
        $subcontent.append($subcontext);
      });
      $context.append($subtabs);
      $context.append($subcontent);
      $content.append($context);
      $context.tabs({
        activate: function( event, ui ) {
          currentSubcontext = ui.newPanel.attr('id').slice(11); // 'subcontext-' length
          nextQuestion();
        }
      });
    });

    $anchor.append($tabs);
    $anchor.append($content);
				$anchor.tabs({
      activate: function( event, ui ) {
        currentContext = ui.newPanel.attr('id').slice(8); // 'context-' length
        nextQuestion();
      }
    });
  }
  
  function buildQuestionList(context, subcontext) {
    var $list = $('<div>');
    var questions = sorted[context][subcontext];
    $.each(questions, function(index) {
      var question = questions[index];
      var $node = $('<div class="alert alert-warning">');
      $node.attr('id', 'op1-' + question._id);
      $node.append( $('<h4>').append(question.caption) );
      $.each(question.answers, function(key) {
        $node.append($('<a class="btn btn-default">').append(question.answers[key]));
      });

      var $actions = $('<div style="float:right" />');

      $('<button />')
      .button({ 
        icons: { primary: "ui-icon-refresh" },
        label: "Passer"
      }).click(function() {
        nextQuestion();
      })
      .appendTo($actions);

      $('<button  />')
      .button({ 
        icons: { secondary: "ui-icon-triangle-1-e" },
        label: "Envoyer"
      }).click(function() {
        if (typeof callback == "function") {
          callback(question);
        }
      })
      .appendTo($actions);

      $node.append($actions).hide();
      $list.append($node);
    });
    return $list;
  }

  // Select next question
  function nextQuestion() {
    var list = sorted[currentContext][currentSubcontext];
    if (list && list.length) {
      var index = Math.floor(Math.random() * list.length);
      $('#op1-' + list[index]._id ).show();
    }
  }

}( jQuery ));