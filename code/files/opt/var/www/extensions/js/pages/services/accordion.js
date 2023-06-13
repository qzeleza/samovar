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
let firstTurn = true;
let toggle_all = $('.toggle-all');

$(document).ready(function() {

    toggle_all.on('click', function(event) {
        event.preventDefault();
        $(this).toggleClass('clicked');
        // выбираем все элементы с классом collapse и id = services_item_*
        let collapses = $('.collapse[id*="services_item_"]')

        if( collapses.hasClass('show'))  {
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

    })

});