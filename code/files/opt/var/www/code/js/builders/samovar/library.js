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


        // Создаем карточки приложений для библиотеки Самовара
        libraryPageLoader.add(() => {
            // Получаем данные о приложении с роутера
            tryGetDataFromServer(RouterServer, 'get_apps_data', {}, (data) => {
                // проходимся по каждой карточке в присланном списке данных
                $.each(data, function(app_name, app_data) {
                    // if (app_name !== 'rodina'){
                    appsData[app_name] = new AppsManager(app_name, RouterServer, root);
                    // Создаем карточки на каждое приложение и регистрируем их в библиотеке
                    const $cardHTMLCode = appsData[app_name].createAppCard(app_data);

                    // Генерируем список из карточек приложений
                    const $appCard = $('<div>').attr('id', `app_${this.appName}_card`);
                    $appCard.append($cardHTMLCode);
                    const $cardContainer        = $('<div>').addClass('col-12 card-container').append($appCard);
                    const $appsLibWindows       = $(`#apps_card_list`);     // Элемент главного окна который содержит карточки приложений
                    const $numColumnsSelect     = $('#numColumnsSelect');   // Элемент

                    // Помещаем код окна в список окно
                    $appsLibWindows.append($cardContainer);
                    // Получаем историю приложения
                    appsData[app_name].createAppVersionHistory();
                    // Создаем модальные окна для показа видео роликов о приложении
                    appsData[app_name].createAppVideoPreview();
                    // Инициализация с начальным числом столбцов
                    initRightPanelColumnsButtons($appsLibWindows, $numColumnsSelect);
                    // Инициализация вида карточек в окне
                    initViewState();
                });

            }, `при запросе данных о приложениях!`);

        });



        //
        libraryPageLoader.add(() => {
            UserRouter.getDeviceInfo((deviceInfo) => {
                $.each(appsData, function(app_name, app_data) {
                    // Получаем рейтинг с сервера и устанавливаем его в каждой карточке приложения
                    new Rating(app_name, deviceInfo);

                });
            });


        });

        // Восстанавливаем запомненные значения
        // размера сетки главного окна
        // вид окна: компактный или полный
        libraryPageLoader.add(() => {
            // Устанавливаем размер сетки главного окна с карточками приложения

        });

        // libraryPageLoader.add(root + 'code/js/libraries/locals/select2.js');

        libraryPageLoader.load()
            .then(() => {
                // Установка пунктов левого меню - sidebar
                // Выбираем пункт Библиотека
                $('#lib_link').addClass('active');
                $('#sidebar_menu .nav-group-sub').addClass('collapse show')
                $('#sidebar_kvas_menu').addClass('collapsed').addClass('nav-item-open');

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
