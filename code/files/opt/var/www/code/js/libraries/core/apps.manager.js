
class AppsManager {
    /**
     * Конструктор класса AppsLibManager
     * @param {string} app_name         - базовое имя программы на английском
     * @param {Object} server           - сервер для получения информации
     * @param {boolean} callRightPanel  - флаг, указывающий, нужно ли вызывать правую панель после отправки отзыва
     * @param {string} root             - путь до корневой директории, требуемый для открытия файлов
     */
    constructor(app_name, server, callRightPanel = false, root = '') {
        this.server                     = server;
        this.root                       = root;
        this.appName                    = app_name;
        this.callRightPanel             = callRightPanel;

        this.storageKey                 = `#${this.appName}_history_modal_key`;

        this.historyModalElem           = $(`#${this.appName}_history_modal`);
        this.callToFullDeleteElem       = $(`#${this.appName}_full_delete_call`);
        this.callToSimpleDeleteElem     = $(`#${this.appName}_simple_delete_call`);
        this.modalDialogsList           = $('#list_modal_windows');

        this.htmlCardTemplFile          = root + 'pages/core/templates/card.html'
        this.htmlPreviewTemplFile       = root + 'pages/core/templates/preview.html'


        this.callToFullDeleteElem       .on('click', this.askToFullDelete.bind(this));
        this.callToSimpleDeleteElem     .on('click', this.askToSimpleDelete.bind(this));


    }






    //
    // Функция вызова и обработки данных при просмотре истории версий приложения
    //
    createAppVersionHistory(force = true) {
        // Выполняем привязку только в случае наличия флага форсирования
        // или отсутствия сохраненного флага наличия привязки
        if (!localStorage.getItem(this.storageKey) || force) {
            // Привязываем функцию запроса данных с сервера к кнопке вызова
            tryGetDataFromServer(this.server, 'get_app_history', {"app_name": this.appName}, (jsonHistory) => {
                createVersionHistory(jsonHistory);
            }, `при запросе истории версий ${this.appName}`);
            localStorage.setItem(this.storageKey, 'stored');
        }
    }


    //
    // Функция запроса удаления программы
    //
    askToFullDelete() {
        this._askToDeleteApp('full');
    }

    askToSimpleDelete() {
        this._askToDeleteApp('simple');
    }

    _askToDeleteApp(method) {

        const self = this;
        let textToAsk = 'пакета <b>' + RusNames[this.appName];
        textToAsk += (method === 'simple') ? '</b>.' : '</b> и его данных.';
        const askToDeleteNoty = new Noty({
            text: '<div class="ps-3 pb-1 border-bottom pb-5 pt-4">' +
                "<div class='d-flex flex-row align-items-baseline text-center pt-2 '>" +
                '<div class="fs-4 mt-2 mb-1 text-danger me-2 ">Подтвердите удаление ' + textToAsk + '</div>' +
                "</div>" +
                '</div>',
            closeWith: ['click', 'backdrop', 'button'], // ['click', 'button', 'hover', 'backdrop']
            type: 'confirm',
            modal: true,
            layout: 'topCenter',
            buttons: [
                Noty.button('Отменить', 'btn btn-link mb-2 me-2', () => {
                    askToDeleteNoty.close();
                }),
                Noty.button('Удалить <i class="ph-x ms-2 "></i>', 'btn btn-outline-danger ms-2 me-4 mb-2', () => {
                    self._appDelete(method);
                }),
            ],
            callbacks: {
                beforeShow: function () {
                    rightPanelAct('hide', this.callRightPanel);
                },
                afterClose: function () {
                    rightPanelAct('show', this.callRightPanel);
                    // костыль, который позволяет показывать окно при повторных вызовах
                    this.showing = false;
                    this.shown = false;
                },
            }
        });
        askToDeleteNoty.show();

    }

    // Удаление пакета
    _appDelete(method) {

        const deleteRoute = (method === 'simple') ? 'delete_app_simple' : 'delete_app_full';
        const self = this;

        tryGetDataFromServer(this.server, deleteRoute, {"app_name": this.appName}, (answer) => {

            if (answer.result) {

                showMessage(`Приложение <b>${self.appName}</b> было успешно удалено.`);
            }
            createVersionHistory(answer);
            new Scrolling('#' + self.appName + '_history_list');
            localStorage.setItem(self.storageKey, 'stored');

        }, `при запросе истории версий ${this.appName}`);
    }

    //
    // Генерирует код ниспадающего меню по словарю в виде массива из словарей:
    //   [{
    //     title: 'Службы',
    //     link: 'pages/kvas/services/services.html',
    //     icon: 'ph-stack'
    //     show_when_not_installed: "true",
    //   },...
    //   ]
    //
    _generateDropdownMenu(menuItems, installed) {
        const dropdownMenu = $('<div class="dropdown-menu dropdown-menu-end"></div>');
        let item;
        for (let i = 0; i < menuItems.length; i++) {
            const menuItem = menuItems[i];
            if (menuItem.title === 'divider') {
                item = installed === 'true' ? $('<div class="dropdown-divider"></div>') : null;
            } else {
                if (installed === 'true' || menuItem.show_when_not_installed === 'true') {
                    item = $('<a href="' + menuItem.link + '" class="dropdown-item"></a>');
                    const icon = $('<i class="' + menuItem.icon + '"></i>');
                    const title = $('<span>' + menuItem.title + '</span>');

                    item.append(icon);
                    item.append(title);
                }
            }
            if (item) dropdownMenu.append(item);
        }

        return dropdownMenu;
    }


    //
    // Создаем карточку приложения
    //
    // @param {string} htmlCardTemplFile - файл-источник, образец с карточкой шаблоном
    // @param {dict} applicationData - данные по приложению (описание структуры ниже).
    // @param {dict} jsonDropdownLinksList - список ссылок для ниспадающего меню в карточке приложения
    // @returns {void}
    //
    createAppCard(applicationData) {

        const self = this;
        const templ = '_@';            // шаблон для поиска и замены имени приложения в карточке приложения

        // Загружаем шаблон карточки из файла
        const template = $.ajax({
            url: this.htmlCardTemplFile,
            async: false
        }).responseText;

        // Генерируем элементы из шаблона и добавляем данные
        // Возвращаем измененный код шаблона
        // return $.map(items, function (item) {
        let $element = $(template).clone();
        // меняем собачку на имя приложения
        $element = replaceAttrValueInside($element, templ, this.appName);

        // Определяем число авторов в присланных данных
        function getNumAuthorsInData(obj, prefix) {
            let count = 0;

            $.each(obj, function (key) {
                if (key.startsWith(prefix)) {
                    count++;
                }
            });

            return count;
        }

        // Получаем число авторов в массиве данных
        const numAuthorsInData = getNumAuthorsInData(applicationData, 'author');
        let countAuthor = 1;

        // Ключи в словаре с данными с сервера должны соответствовать id элементов в карточке
        $.each(applicationData, function (key, value) {

            // Состав data  = {
            //      "author_1" : { name: 'имя1', email: 'email1'}, - имя #1 автора приложения
            //      "author_N" : { name: 'имяN', email: 'emailN'}, - имя #N автора приложения
            //      "app_rus_name" : value,                         - название приложения по русски
            //      "full_description" : value,                     - полное описание приложения
            //      "description" : value,                          - сокращенное описание приложения
            //      "last_version : value,                          - крайняя версия приложения
            //      "last_version_date : value,                     - дата выпуска обозначенной версии приложения
            //      "links : [                                      - ссылки для приложения
            //                 {
            //                     "title": 'Название',             - название
            //                     "link": 'path_to_file.html',     - ссылка
            //                     "icon": 'ph-ххххх',              - иконка из серии ph-
            //                 },
            //               ]
            // }
            // заменяем данные найденных элементов с данными пришедшими из сервера


            if (key.startsWith("author")) {

                //  если ключ это автор
                const authorText = countAuthor < numAuthorsInData ? value.name + ', ' : value.name;
                const author = $('<a class="fw-semibold"></a>')
                    .attr('href', `mailto:${value.email}`)
                    .attr('id', `${self.appName}_${key}`)
                    .text(authorText);

                $element.find(`#${self.appName}_authors`).append(author);
                countAuthor++;

            } else if (key.startsWith("links")) {

                // добавляем в меню ссылки
                $element.replaceWith(function () {
                    return $(this).find(`#${self.appName}_dropdown_icon`).remove()
                });
                $element.find(`#${self.appName}_dropdown`).append(self._generateDropdownMenu(applicationData.links, applicationData.installed));

            } else if (key.startsWith("installed")) {

                // Обрабатываем статус установки пакета
                const $icon = $element.find(`#${self.appName}_status_icon`);
                const $text = $element.find(`#${self.appName}_status_installed`);

                const colorUninstalledApp = 'warning'
                const colorInstalledApp = 'success'


                if (value === "true") {
                    $text.text('установлен').addClass(`text-${colorInstalledApp}`).removeClass(`text-${colorUninstalledApp}`);
                    $icon.addClass('ph-check').removeClass('ph-x').addClass(`bg-${colorInstalledApp}`).removeClass(`bg-${colorUninstalledApp}`);
                    $element.find(`#${self.appName}_simple_delete_call`).removeClass('d-none');
                    $element.find(`#${self.appName}_full_delete_call`).removeClass('d-none');
                    $element.find(`#${self.appName}_update_install`).removeClass('d-none');
                    $element.find(`#${self.appName}_update_install_div`).removeClass('d-none');
                    $element.find(`#${self.appName}_install_call`).addClass('d-none');
                    $element.find(`#${self.appName}_review_call`).removeClass('d-none');
                } else {
                    $text.text('не установлен').addClass(`text-${colorUninstalledApp}`).removeClass(`text-${colorInstalledApp}`);
                    $icon.addClass('ph-x').removeClass('ph-check').addClass(`bg-${colorUninstalledApp}`).removeClass(`bg-${colorInstalledApp}`);
                    $element.find(`#${self.appName}_simple_delete_call`).addClass('d-none');
                    $element.find(`#${self.appName}_full_delete_call`).addClass('d-none');
                    $element.find(`#${self.appName}_update_install`).addClass('d-none');
                    $element.find(`#${self.appName}_update_install_div`).addClass('d-none');
                    $element.find(`#${self.appName}_install_call`).removeClass('d-none');
                    $element.find(`#${self.appName}_review_call`).addClass('d-none');
                }
            } else {
                // обработка всех остальных тегов
                if ($element.find(`#${self.appName}_${key}`).length > 0) {
                    $element.find(`#${self.appName}_${key}`).html(value);
                }
            }
            $element.find(`#${self.appName}_${key}`).removeClass('placeholder placeholder-wave ');

        })
        // Получаем историю приложения
        this.createAppVersionHistory();
        // Создаем модальные окна для показа видео роликов о приложении
        this.createAppVideoPreview();

        return $element;
    }


    createAppVideoPreview() {
        // Добавляем к код модальные окна для предостмотра видео по каждому приложению
        const modalContName = `${this.appName}_modal_preview_container`;
        const modalCont = $('<div>').addClass('modal fade').attr('tabindex', -1).attr('id', `${this.appName}_modal_preview_window`);
        const modalPrev = $('<div>').addClass('modal-dialog modal-lg').attr('id', modalContName);
        const src = this.root + `assets/media/${this.appName}_preview.mov`;
        const modalPreviewId = this.appName + '_modal_preview_window';
        const modalPreview = $('#' + modalPreviewId);

        // Создаем модальное окно и записываем его в элемент списка модальных окон
        if (this.modalDialogsList.has(`#${modalContName}`).length === 0 ) this.modalDialogsList.append(modalCont.append(modalPrev));

        // Загружаем шаблон карточки из файла
        const data = $.ajax({
            url: this.htmlPreviewTemplFile,
            async: false
        }).responseText;

        const modalVideo = $(`#${modalContName}`);
        modalVideo.html(data);
        modalVideo.find('video source').attr('src', src);

        // Проверяем есть ли файл по указанному пути
        fetch(src)
            .then(response => {
                if (response.status === 404) {
                    console.log(`Файл ${src} не найден!`);
                    const noFileFound = '<div class="fs-5 text-danger fw-light mb-1">Файл пред-просмотра не найден!</div>';
                    modalPreview.html(noFileFound);
                } else {
                    // устанавливаем длительность ролика
                    getVideoDuration(src)
                        .then(duration => {
                            $('#' + this.appName + '_preview_time').html(duration);
                            console.log("Длительность видео:", duration);
                        })
                        .catch(error => {
                            console.error("Ошибка: ", error);
                        });
                }
            });
    }

}

