// Source: http://stackoverflow.com/questions/9856587/is-there-an-inverse-function-to-jquery-serialize/24441276#24441276

$.fn.deserialize = function (serializedString) 
{
    var $form = $(this);
    var $fields = $form.find('[name]');

    if (!$form.data('initalized')) {
      $fields.each(function(index) {
         // They are all nested in their own div
         $(this).prepend('<option value="default">--select--</option>');
         $(this).change(function() {
            var selection = $(this).val();
            $(this).find('option:not(:first)').each(function() {
               $form.find('[name^=' + $(this).val() + '-]').each(function(){
                 $(this).parent().hide();
                 $(this).prop('disabled', true);
               });
            });
            if (selection != 'default') {
               $form.find('[name^=' + selection + '-]').each(function() {
                  $(this).parent().show();
                  $(this).prop('disabled', false);
               });
            }
         });
      });
      $form.data('initalized', true);
    }

    $form[0].reset();
    $fields.each(function(index) {
       if (index > 0) {
         // Hide all but first form element
         $(this).parent().hide();
         $(this).prop('disabled', true);
       }
    });

    var serializedString = serializedString.replace(/\+/g, '%20');
    var formFieldArray = serializedString.split("&");

    // Loop over all name-value pairs
    $.each(formFieldArray, function(i, pair){
        var nameValue = pair.split("=");
        if (nameValue.length == 2) {
          var name = decodeURIComponent(nameValue[0]);
          var value = decodeURIComponent(nameValue[1]);

          // Find one or more fields
          var $field = $form.find('[name=' + name + ']');
          $field.each(function() {
            $(this).parent().show();
            $(this).prop('disabled', false);
          });

          // Checkboxes and Radio types need to be handled differently
          if ($field[0].type == "radio" || $field[0].type == "checkbox") 
          {
            var $fieldWithValue = $field.filter('[value="' + value + '"]');
            var isFound = ($fieldWithValue.length > 0);
            // Special case if the value is not defined; value will be "on"
            if (!isFound && value == "on") {
              $field.first().prop("checked", true);
            } else {
              $fieldWithValue.prop("checked", isFound);
            } 
          } else { // input, textarea
            $field.val(value);
          }
        }
    });

    return this;
}