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
      autoResize: true,
      modal: true,
      buttons: {
        "Ok": function() {
          var target = $(this).data('target');
          var value = $(".metadata-link-form").serialize();

          if (target.is('a')) {
            // Launched by clicking a link
            // Just edit the link with new uri
            // Todo: save in database ??!!
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
    var value = "";
    if ($(this).is('a')) {
      value = $(this).attr("href");
      widget.data('target', $(this));
    } 
    widget.find(".metadata-link-form").deserialize(value);
    widget.dialog( 'open' );
    event.preventDefault();
  });

  $(document).on('blur', 'div[contenteditable="true"]', function(event) {
    // Todo: Disable the link button when there is no saved selection
    // or just take the whole content of the editable div
    saveSelection();
  });

}( jQuery ));