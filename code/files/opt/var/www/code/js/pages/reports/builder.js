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

        pageLoader.addModule('#page_header', root + 'pages/kvas/reports/modules/header.html');
        pageLoader.addModule('#page_breadcrumb', root + 'pages/kvas/reports/modules/breadcrumb.html');
        pageLoader.addModule('#app_kvas_card', root + 'pages/kvas/reports/modules/card.html');

        pageLoader.addScript(root + 'code/js/pages/all/scrolling.js');
        pageLoader.addScript(root + 'code/js/pages/all/select2.js');

        pageLoader.loadPageModules()
            .then(() => pageLoader.loadJScripts())
            .then(() => {
                $('#sidebar_menu .nav-group-sub').addClass('collapse show')
                $('#sidebar_kvas_menu').addClass('collapsed').addClass('nav-item-open');

                $('#sidebar_kvas_reports').addClass('active');

                // Установка триггера для других js файлов
                $(document).trigger("appReady");
            })
            .catch((error) => {
                // Обработка ошибок при загрузке модулей и скриптов
                console.error(error);
            });
    });

});
