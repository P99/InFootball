(function ( $ ) {
  var widget = undefined;

  $.metadatalink = function(options) {
    initDialog(options.ref);
  }

  // Private functions
  function initDialog(ref) {
    widget = ref;
    ref.dialog({
      autoOpen: false,
      modal: true,
      buttons: {
        "Ok": function() {
          // Retreive dialog private data
          var target = $(this).data('target');
				
          // uri edited within the popup
          var value = $(this).find(".metadata-link-edit").val();
				
          if (target.is('a')) {
            // Launched by clicking a link
            // Just edit the link with new uri
            // Todo: save in database
            target.attr('href', value);
          } else {
            // Launched with the 'link' icon
            target.html($(this).data('result'));
            target.find('a').attr('href', value);
          }
				
          // Reset all private data
          $(this).data('target', undefined);
          $(this).data('result', undefined);

          $(this).dialog( "close" );
        },
        "Cancel": function() {
          $(this).dialog( "close" );

          // Reset all private data
          $(this).data('target', undefined);
          $(this).data('result', undefined);
        }
      }
    });
  }

  function saveSelection() {
    // Make a link out of current selection
    console.log("Saving selection");
    var selection = window.getSelection();
    if (selection.anchorNode) {
    var str = selection.anchorNode.nodeValue;
    var start = selection.getRangeAt(0).startOffset;
    var end = selection.getRangeAt(0).endOffset;
    var out = str.slice(0, start);
    var value = str.slice(start, end);

    out += '<a class="metadata-link" href="">';
    out += value;
    out += '</a>';
    out += str.slice(end);

    widget.data('target', $(selection.anchorNode.parentNode));
    widget.data('result', out);
    }
  }

  // Internal handler for click action
  $(document).on('click', '.metadata-link', function(event) {
    if ($(this).is('a')) {
      widget.find(".metadata-link-edit").val($(this).attr("href"));
      widget.data('target', $(this));
    } else {
      widget.find(".metadata-link-edit").val('');
    }
    widget.dialog( 'open' );
    event.preventDefault();
  });

  $(document).on('blur', 'div[contenteditable="true"]', function(event) {
    saveSelection();
  });

}( jQuery ));