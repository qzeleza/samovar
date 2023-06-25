//
// Устанавливаем в загрузку страницы
// ------------------------------
// Загрузка данные, используемые только для index.html
function loadPageModules() {
    return new Promise((resolve) => {
        const rootPath = 'pages/library/kvas/library/';

        // заголовок страницы
        $("#page_header").load(rootPath + "header.html", resolve);
        // путь до страницы
        $("#page_breadcrumb").load(rootPath + "breadcrumb.html", resolve);
        // карточка описания Кваса
        $("#app_kvas_card").load(rootPath + "card.html", function () {
            // модальное окно истории Кваса из файла
            $("#kvas_history").load(rootPath + "history.html", resolve);
            // модальное окно видео-предосмотра Кваса из файла
            $("#kvas_preview").load(rootPath + "preview.html", resolve);
        });
    });
}


function loadJScripts(){
    const rootPath = 'code/js/';

    $.getScript(rootPath + "pages/all/apps.js", function() {
        $.getScript(rootPath + "pages/all/configurator.js", function (){
            $.getScript(rootPath + "vendors/form_validation_library.js");
            $.getScript(rootPath + "pages/all/ratings.js");
            $.getScript(rootPath + "pages/all/scrolling.js");
            $.getScript(rootPath + "pages/all/feedback.js", function (){

                App.initCore();
                Tooltips.init();
                App.initAfterLoad();
                Tooltips.initTooltips();
                Scrolling.init();
                FormValidation.init();
                themeSwitcher.init();

                let appName = 'Самовар';
                let appVersion = '0.0.3';
                new FeedBack('send_feedback', appName, appVersion);
                new Rating('samovar_rating', appName, appVersion );

                appName = 'Квас';
                appVersion = '1.1.3';
                new FeedBack('kvas_send_feedback', appName, appVersion)
                new Rating('kvas_rating', appName, appVersion );

            });
        });

    });

}


// Загружаем данные в процессе загрузки loads.js
// который отвечает за загрузку данных из других файлов в один
// document.addEventListener('DOMContentLoaded', function() {
$(document).ready(function() {

    $.getScript("code/js/pages/all/loader.js", function (){
        // загружаем общие для всех страниц модули
        loadGeneralModules('')
            // Загрузка данных только для index.html
            .then(loadPageModules)
            .then(loadJScripts)
            // Установка триггера для других js файлов
            .then(() => {
                // теперь все остальные js-скрипты должны загружаться
                // только на основании этого события - appReady
                $(document).trigger("appReady");

            });
    });

});

// после загрузки страницы
// document.addEventListener('load', function() {
