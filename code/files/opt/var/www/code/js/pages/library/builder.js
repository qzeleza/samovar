//
// Устанавливаем в загрузку страницы
// ------------------------------
// Загрузка данные, используемые только для index.html

function addKvasEvents(){

    let appName = 'Квас';
    let appVersion = '1.1.3';
    new FeedBack('kvas_send_feedback', appName, appVersion)
    new Rating('kvas_rating', appName, appVersion );

}
// Файл основной страницы HTML
$(document).ready(function() {

    $.getScript("code/js/pages/all/1Loader.js", function (){
        // Добавление дополнительных модулей
        const pageLoader = buildMainTemplatePage('');

        pageLoader.addModule('#page_header', 'pages/library/modules/header.html');
        pageLoader.addModule('#page_breadcrumb', 'pages/library/modules/breadcrumb.html');
        pageLoader.addModule('#app_kvas_card', 'pages/library/modules/card.html');
        pageLoader.addModule('#kvas_history', 'pages/library/modules/history.html');
        pageLoader.addModule('#kvas_preview', 'pages/library/modules/preview.html');

        pageLoader.addScript('code/js/pages/all/select2.js');

        // Добавление дополнительных функций
        pageLoader.addCallback(addKvasEvents);

        pageLoader.loadPageModules()
            .then(() => pageLoader.loadJScripts())
            .then(() => {

                // Установка пунктов левого меню - sidebar
                // Выбираем пункт Библиотека
                $('#lib_link').addClass('active')

                // Установка триггера для других js файлов
                $(document).trigger("appReady");
            })
            .catch((error) => {
                // Обработка ошибок при загрузке модулей и скриптов
                console.error(error);
            });
    });

});
