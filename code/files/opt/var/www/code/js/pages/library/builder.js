//
// Устанавливаем в загрузку страницы
// ------------------------------
// Загрузка данные, используемые только для index.html
const root = '';
// Файл основной страницы HTML
$(document).ready(function() {

    try {
        // Добавление дополнительных модулей
        const libraryPageLoader = buildMainTemplatePage(root);

        libraryPageLoader.add({id:'#page_header', file: root + 'pages/library/modules/header.html'});
        libraryPageLoader.add({id:'#page_breadcrumb', file: root + 'pages/library/modules/breadcrumb.html'});
        libraryPageLoader.add({id:'#app_kvas_card', file: root + 'pages/library/modules/kvas/card.html'});
        libraryPageLoader.add({id:'#kvas_preview', file: root + 'pages/library/modules/kvas/preview.html'});
        libraryPageLoader.add({id:'#kvas_history', file: root + 'pages/library/modules/kvas/history.html'});

        libraryPageLoader.add(root + 'code/js/pages/all/select2.js');

        // Добавление дополнительных функций
        // libraryPageLoader.add(addKvasEvents);
        libraryPageLoader.add(() => {

            let appName = 'kvas';
            let appVersion = 'latest';
            new Scrolling('#kvas_history_list');
            new Rating(appName, appVersion, RATING_SERVER);
        });

        libraryPageLoader.load()
            .then(() => {

                // Установка пунктов левого меню - sidebar
                // Выбираем пункт Библиотека
                $('#lib_link').addClass('active');
                $('#sidebar_menu .nav-group-sub').addClass('collapse show')


                // const router = new ServerRequester();
                // router.send('')

                // const apiPath = "/apps/api";
                // const server = new ServerRequester('https://api.zeleza.ru', 61116);
                // server.send(apiPath + '')

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
