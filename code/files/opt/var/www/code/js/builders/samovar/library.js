//
// Устанавливаем в загрузку страницы
// ------------------------------
// Загрузка данные, используемые только для index.html

// Файл основной страницы HTML
$(document).ready( function () {

    const root = '';
    const appsData = {};

    try {
        // Добавление дополнительных модулей
        const libraryPageLoader =  buildMainTemplatePage(root);
        // const appName = 'kvas';

        libraryPageLoader.add({id: '#page_header', file: root + 'pages/library/modules/header.html'});
        libraryPageLoader.add({id: '#page_breadcrumb', file: root + 'pages/library/modules/breadcrumb.html'});
        // libraryPageLoader.add({id: '#kvas_history_modal', file: root + 'pages/library/modules/samovar/history.html'});


        // Связываем кнопку вызова истории версий для Самовара
        libraryPageLoader.add(() => {

            // Получаем данные о приложении с роутера
            tryGetDataFromServer(RouterServer, 'get_apps_data', {}, (data) => {
                $.each(data, function(app_name, app_data) {
                    // if (app_name !== 'rodina'){
                    appsData[app_name] = new AppsManager(app_name, RouterServer);
                    // Получаем данные с сервера
                    const htmlAppCardCode = appsData[app_name].generateAppBigCardHTML('pages/core/templates/card.html', app_data);
                    // Генерируем карточки приложений
                    const $cardList = $(`#apps_card_list`);
                    // const $cardMain = $('<div>').addClass('main-card').attr('id', `app_${app_name}_card`);
                    const $cardMain = $('<div>').attr('id', `app_${app_name}_card`);
                    $cardMain.append(htmlAppCardCode);
                    const $cardContainer = $('<div>').addClass('col-12 card-container').append($cardMain);
                    $cardList.append($cardContainer);
                    // Получаем историю приложения
                    appsData[app_name].getAppVersionHistory();

                });
                // Устанавливаем размер сетки главного окна с карточками приложения
                const cont = $('#apps_card_list')
                const selCol = $('#numColumnsSelect');
                // Инициализация с начальным числом столбцов
                initRightPanelColumnsButtons(cont, selCol);
                // Инициализация вида карточек в окне
                initViewState();

            }, `при запросе данных о приложениях!`);

        });

        libraryPageLoader.add(() => {
            UserRouter.getDeviceInfo((deviceInfo) => {
                $.each(appsData, function(app_name, app_data) {
                    // Добавляем к код модальные окна для предостмотра видео по каждому приложению
                    const modalContName = `${app_name}_modal_preview_container`;
                    const modalCont = $('<div>').addClass('modal fade').attr('tabindex', -1).attr('id', `${app_name}_modal_preview_window`);
                    const modalPrev = $('<div>').addClass('modal-dialog modal-lg').attr('id', modalContName);
                    // Создаем модальное окно и записываем его в элемент списка модальных окон
                    $('#list_modal_windows').append(modalCont.append(modalPrev));
                    $.get( root + 'pages/core/templates/preview.html', function(data) {
                        // По завершении загрузки, данные будут переданы в функцию обратного вызова
                        const modalVideo = $(`#${modalContName}`);
                        modalVideo.html(data);
                        modalVideo.find('video source').attr('src', `./assets/media/${app_name}_preview.mov`);
                    });
                    setPreviewVideoCardOnClick(app_name);
                    // Получаем рейтинг с сервера и устанавливаем его в каждом приложении
                    new Rating(app_name, deviceInfo);
                });
            });

        });

        // libraryPageLoader.add(root + 'code/js/libraries/locals/select2.js');

        libraryPageLoader.load()
            .then(() => {
                // Установка пунктов левого меню - sidebar
                // Выбираем пункт Библиотека
                $('#lib_link').addClass('active');
                $('#sidebar_menu .nav-group-sub').addClass('collapse show')

                // Установка триггера для других js файлов
                $(document).trigger("appReady");

            })
            .catch((error) => {
                // Обработка ошибок при загрузке модулей и скриптов
                console.error(error);
            });
    } catch (error) {
        console.error(error);
    }

});
