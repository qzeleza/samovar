/* ------------------------------------------------------------------------------
 *
 *  # Custom JS code
 *
 *  Place here all your custom js. Make sure it's loaded after app.js
 *
 * ---------------------------------------------------------------------------- */

//
// Функция отрабатывает нажатие на элемент с классом toggle-all
// и открывает все элементы аккордеон, работает в связке с
// писанием класса в custom.css
// Данная конструкция связана с тем, что первый аккордеон открыт,
// а остальные закрыты
//



const Services = function () {

    const toggleAccordion = function() {

        let firstTurn = true;
        let toggle_all = $('.toggle-all');

        toggle_all.on('click', function (event) {
            event.preventDefault();
            $(this).toggleClass('clicked');
            // выбираем все элементы с классом collapse и id = services_item_*
            let collapses = $('.collapse[id*="services_item_"]')

            if (collapses.hasClass('show')) {
                // toggle_all.text("Закрыть все");
                // если первый элемент имеет класс show и флаг первого нажатия true
                if (collapses.first().hasClass('show') && firstTurn === true) {
                    // то отключаем флаг и удаляем тег show у первого элемента
                    // и открываем все аккордеоны
                    firstTurn = false;
                    collapses.first().toggleClass("show");
                    collapses.collapse('show');

                } else {
                    // если первый элемент не имеет класса show и флаг первого нажатия false
                    collapses.collapse('hide');
                }
            } else {
                // toggle_all.text("Открыть все");
                // если во всех все элементах с классом collapse нет класса show,
                // то отображаем все элементы
                collapses.collapse('show');
            }

        });
    }

    const setupSelect = function() {

        let vpnSelect = $('#collapse-select');
        let setupButton = $('#ssr-call-setup');
        let setupIcon = $('#ssr-call-icon');

        function setupToggle() {
            if (vpnSelect.val().toLowerCase().includes("ssr")) {
                setupButton.removeClass('disabled')
                    .removeClass('border-0')
                    .addClass('border')
                    .removeAttr('aria-disabled')
                    .removeAttr('tabindex');
                setupIcon.removeClass('text-light');
            } else {
                setupButton.addClass('disabled')
                    .removeClass('border')
                    .addClass('border-0')
                    .attr('aria-disabled', 'true')
                    .attr('tabindex', '-1');
                setupIcon.addClass('text-light');
            }
        }
        setupToggle();
        vpnSelect.on('change', setupToggle);

    };

    const switchToggle = function() {

        let $Switchers = $('input[id^="sc_"]');
        // let $Indicators = $('span[id^="ind_"]');

        function switcherToggle() {
            let indicator = $('#' + 'ind_' + $(this).attr('id'));
            if ($(this).is(':checked')) {
                $('label[for="' + $(this).attr('id') + '"]').text('ВКЛ');
                indicator.removeClass('bg-danger')
                indicator.addClass('bg-success')
            } else {
                $('label[for="' + $(this).attr('id') + '"]').text('ВЫКЛ');
                indicator.removeClass('bg-success')
                indicator.addClass('bg-danger')
            }
        }

        $Switchers.on('change', switcherToggle);

    };


    return {
        init: function() {
            toggleAccordion();
            setupSelect();
            switchToggle();
        }
    }
}();

// Initialize module
// ------------------------------

// When content is loaded
document.addEventListener('DOMContentLoaded', function() {
    Services.init();
});

// When page is fully loaded
window.addEventListener('load', function() {

});
