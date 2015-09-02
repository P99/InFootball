(function ( $ ) {

  $.metadatalink = function() {
    // Todo: Pass the dialog ID as option

				return $("#question-link-dialog").dialog({
							autoOpen: false,
							modal: true,
							buttons: {
									"Ok": function() {
											// Retreive dialog private data
											var target = $(this).data('target');
											var start = $(this).data('selectionStart');
											var end = $(this).data('selectionEnd');
		
											// Link displayed within the popup
											var value = $("#metadata-link-edit").val();
		
											if (target) {
													// Launched from clicking a link
													// Just eedit the link with new link target
													target.attr("href", value);
											} else {
													// Launched with the link button
													var str = $("#question-editor2").html();
													var out = str.slice(0, start);
													out += '<a class="metadata-link" href="' + value + '">';
													out += str.slice(start, end);
													out += '</a>';
													out += str.slice(end);
													$("#question-editor2").html(out);
											}
		
											// Reset all private data
											var target = $(this).data('target', undefined);
											var start = $(this).data('selectionStart', undefined);
											var end = $(this).data('selectionEnd', undefined);
		
											$(this).dialog( "close" );
									},
									"Cancel": function() {
											console.log("Cancel");
											$(this).dialog( "close" );
									}
							}
				});
  };

  $(document).on('click', '.metadata-link', function(event) { 
    var dialog = $("#question-link-dialog");
    console.log("Metadata link: " + $(this).attr("href"));
    $("#metadata-link-edit").val($(this).attr("href"));
    dialog.data('target', $(this));
    dialog.dialog( 'open' );
    event.preventDefault();
  });

}( jQuery ));