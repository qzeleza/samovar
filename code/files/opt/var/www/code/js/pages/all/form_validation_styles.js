/* ------------------------------------------------------------------------------
 *
 *  # Form validation
 *
 *  Demo JS code for form_validation_styles.html page
 *
 * ---------------------------------------------------------------------------- */


// Setup module
// ------------------------------

const FormValidationStyles = function() {


    //
    // Setup module components
    //

    // Config
    const _componentValidationCustom = function() {

        // Fetch all the forms we want to apply custom Bootstrap validation styles to
        let forms = document.querySelectorAll('.needs-validation');

        // Loop over them and prevent submission
        forms.forEach(function(form) {
            form.addEventListener('submit', function(e) {
                if (!form.checkValidity()) {
                    e.preventDefault();
                    e.stopPropagation();
                }

                form.classList.add('was-validated');
            }, false);
        });
    };


    //
    // Return objects assigned to module
    //

    return {
        init: function() {
            _componentValidationCustom();
        }
    }
}();


// Initialize module
// ------------------------------

// document.addEventListener('DOMContentLoaded', function() {
$(document).on("appReady", function() {
    FormValidationStyles.init();
});
