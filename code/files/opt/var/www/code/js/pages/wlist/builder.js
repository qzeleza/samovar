//
// Устанавливаем в загрузку страницы
// ------------------------------
// Загрузка данные, используемые только для index.html

const root = '../../../';

// Файл основной страницы HTML
$(document).ready(function() {

    $.getScript(root + "code/js/pages/all/1Loader.js", function (){
        // Добавление дополнительных модулей
        const pageLoader = buildMainTemplatePage(root);

        pageLoader.addModule('#page_header', root + 'pages/kvas/wlist/modules/header.html');
        pageLoader.addModule('#page_breadcrumb', root + 'pages/kvas/wlist/modules/breadcrumb.html');
        pageLoader.addModule('#app_kvas_card', root + 'pages/kvas/wlist/modules/card.html');

        // Добавление дополнительных функций
        pageLoader.addScript(root + "code/js/pages/wlist/data_tables.js");
        pageLoader.addScript(root + "code/js/pages/wlist/guest_nets.js");

        pageLoader.loadPageModules()
            .then(() => pageLoader.loadJScripts())
            .then(() => {
                // Закрываем пункты Кваса
                $('#sidebar_menu .nav-group-sub').addClass('collapse show')
                $('#sidebar_kvas_menu').addClass('collapsed').addClass('nav-item-open');

                $('#sidebar_kvas_wlist').addClass('active');

                // Установка триггера для других js файлов
                $(document).trigger("appReady");
            })
            .catch((error) => {
                // Обработка ошибок при загрузке модулей и скриптов
                console.error(error);

            });
    });

});
