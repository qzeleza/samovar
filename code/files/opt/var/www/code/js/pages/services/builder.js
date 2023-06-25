//
// Устанавливаем в загрузку страницы
// ------------------------------

// Загрузка данные, используемые только для index.html
function loadPageModules() {
    return new Promise((resolve) => {
        // заголовок страницы
        $("#page_header").load("header.html", resolve);
        // путь до страницы
        $("#page_breadcrumb").load("breadcrumb.html", resolve);
        // карточка описания Кваса
        $("#app_kvas_card").load("card.html", resolve);
        // // модальное окно для настроек Shadowsocks настроек
        $("#modal_form_ssr_data").load("ssr_setup.html", resolve);

    });
}


// Загружаем данные в процессе загрузки loads.js
// который отвечает за загрузку данных из других файлов в один
document.addEventListener('DOMContentLoaded', function() {

    const homePath = '../../../../';
    // загружаем общие для всех страниц модули
    loadGeneralModules(homePath)
        // Загрузка данных только для index.html
        .then(loadPageModules)
        // Установка триггера для других js файлов
        .then(() => {
            // теперь все остальные js-скрипты должны загружаться
            // только на основании этого события - appReady
            $(document).trigger("appReady");
        });

});

// после загрузки страницы
// document.addEventListener('load', function() {
