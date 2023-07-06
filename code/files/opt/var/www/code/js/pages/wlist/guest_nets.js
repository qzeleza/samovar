/* ------------------------------------------------------------------------------
 *
 *  # Inbox page
 *
 *  Demo JS code for mail_list.html pages
 *
 * ---------------------------------------------------------------------------- */


// Setup module
// ------------------------------

let GuestList = function() {


    //
    // Setup module components
    //

    // Inbox table
    let _componentTableInbox = function() {

        // Define variables
        let highlightColorClass = 'table-light';

        // Highlight row when checkbox is checked
        document.querySelectorAll('.table-inbox-checkbox input[type=checkbox]').forEach(function(checkbox) {
            checkbox.addEventListener('change', function() {
                this.checked === true ? this.closest('tr').classList.add(highlightColorClass) : this.closest('tr').classList.remove(highlightColorClass);
            });
        });


    };


    //
    // Return objects assigned to module
    //

    return {
        init: function() {
            _componentTableInbox();
        }
    }
}();


// Initialize module
// ------------------------------

// document.addEventListener('DOMContentLoaded', function() {
GuestList.init();
// });
