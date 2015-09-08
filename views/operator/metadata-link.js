(function ( $ ) {
  var widget = undefined;

  $.metadatalink = function(options) {
    var client = new clientInterface(options);
    $.extend(client, options);
    return client;
  }

  function clientInterface(options) {
    initDialog(options.ref);

    this.show = function(target) {
      this.ref.data('target', target);
      this.ref.find(".metadata-link-edit").val(this.ref.data('value'));
      this.ref.dialog( 'open' );
    };

    this.linkify = function() {
      // Make a link out of current selection
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

      this.ref.data('target', $(selection.anchorNode.parentNode));
      this.ref.data('value', '');
      this.ref.data('result', out);
      }
    };
  };

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
          $(this).data('value', undefined);
          $(this).data('result', undefined);

          $(this).dialog( "close" );
        },
        "Cancel": function() {
          $(this).dialog( "close" );

          // Reset all private data
          $(this).data('target', undefined);
          $(this).data('value', undefined);
          $(this).data('result', undefined);
        }
      }
    });
  }

  // Internal handler for click action
  $(document).on('click', '.metadata-link', function(event) {
    widget.find(".metadata-link-edit").val($(this).attr("href"));
    widget.data('target', $(this));
    widget.dialog( 'open' );
    event.preventDefault();
  });

}( jQuery ));