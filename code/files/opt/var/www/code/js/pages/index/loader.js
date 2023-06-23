//
// Устанавливаем в загрузку страницы
// ------------------------------

// Во время загрузки страницы,
// загружаем основные части html,
// которые используем во всех страницах Самовара:
function loadGeneralModules() {
    return new Promise((resolve) => {
        // правую панель настроек Самовара
        $("#sidebar_panel").load("./pages/all/elements/sidebar.html", resolve);
        // левую панель - меню
        $("#right_panel").load("./pages/all/elements/right_panel.html", resolve);
        // кнопку вызова правой панели
        $("#right_call_button").load("./pages/all/elements/right_call_button.html", resolve);
        // модальное окно на простое удаление Самовара
        $("#delete_simple").load("./pages/all/modals/simple_del.html", resolve);
        // модальное окно на полное удаление Самовара
        $("#delete_full").load("./pages/all/modals/full_del.html", resolve);
    });
}

// Загрузка данные, используемые только для index.html
function loadIndexModules() {
    return new Promise((resolve) => {
        // модальное окно истории Кваса из файла
        $("#kvas_history").load("./pages/index/modals/kvas/history.html", resolve);
        // модальное окно видео-предосмотра Кваса из файла
        $("#kvas_preview").load("./pages/index/modals/kvas/preview.html", resolve);
    });
}

// после загрузки страницы
// document.addEventListener('load', function() {

// Загружаем данные в процессе загрузки loads.js
// который отвечает за загрузку данных из других файлов в один
document.addEventListener('DOMContentLoaded', function() {

    // загружаем общие для всех страниц модули
    loadGeneralModules()
        // Загрузка данных только для index.html
        .then(loadIndexModules)
        // Установка триггера для других js файлов
        .then(() => {
            // теперь все остальные js-скрипты должны загружаться
            // только на основании этого события - appReady
            $(document).trigger("appReady");
        });

});
