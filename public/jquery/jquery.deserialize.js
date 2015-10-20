// Source: http://stackoverflow.com/questions/9856587/is-there-an-inverse-function-to-jquery-serialize/24441276#24441276

$.fn.deserialize = function (serializedString) 
{
    var $form = $(this);
    $form[0].reset();    // (A) optional
    serializedString = serializedString.replace(/\+/g, '%20'); // (B)
    var formFieldArray = serializedString.split("&");

    // Loop over all name-value pairs
    $.each(formFieldArray, function(i, pair){
        var nameValue = pair.split("=");
        var name = decodeURIComponent(nameValue[0]); // (C)
        var value = decodeURIComponent(nameValue[1]);
        // Find one or more fields
        var $field = $form.find('[name=' + name + ']');

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
    });
    return this;
}