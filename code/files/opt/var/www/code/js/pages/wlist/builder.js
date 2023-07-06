//
// Устанавливаем в загрузку страницы
// ------------------------------
// Загрузка данные, используемые только для index.html

const root = '../../../';

// Файл основной страницы HTML
$(document).ready(function() {

    try {
        // Добавление дополнительных модулей
        const wlistPageLoader = buildMainTemplatePage(root);

        wlistPageLoader.add({id:'#page_header', file: root + 'pages/kvas/wlist/modules/header.html'});
        wlistPageLoader.add({id:'#page_breadcrumb', file: root + 'pages/kvas/wlist/modules/breadcrumb.html'});
        wlistPageLoader.add({id:'#app_kvas_card', file: root + 'pages/kvas/wlist/modules/card.html'});

        // Добавление дополнительных функций
        wlistPageLoader.add(root + "code/js/pages/wlist/data_tables.js");
        wlistPageLoader.add(root + "code/js/pages/wlist/guest_nets.js");

        wlistPageLoader.load()
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

    } catch(error){
        console.error(error);
    }

});
