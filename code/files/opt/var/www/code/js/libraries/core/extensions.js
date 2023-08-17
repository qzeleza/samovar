
class AppsManager {
    /**
     * Конструктор класса AppsManager
     * @param {string} app_name         - базовое имя программы на английском
     * @param {Object} server           - сервер для получения информации
     * @param {boolean} callRightPanel  - флаг, указывающий, нужно ли вызывать правую панель после отправки отзыва
     */
    constructor(app_name, server, callRightPanel = false) {
        this.server                 = server;
        this.appName                = app_name;
        this.callRightPanel         = callRightPanel;
        this.historyModalElem       = $('#' + this.appName + '_history_modal');
        this.storageKey             = this.appName + '_history_modal_key';
        this.callToFullDeleteElem   = $('#' + this.appName + '_full_delete_call');
        this.callToSimpleDeleteElem = $('#' + this.appName + '_simple_delete_call');

        this.callToFullDeleteElem.on(   'click', this.askToFullDelete.bind(this));
        this.callToSimpleDeleteElem.on( 'click', this.askToSimpleDelete.bind(this));
    }


    //
    // Приватная функция - вызывается для получения данных о версии программы
    //
    _getAppVersionHistoryOnCall(){

        const self = this;

        tryGetDataFromServer(this.server, 'get_app_history', {"app_name": this.appName}, (jsonHistory) => {
            const htmlVersion =  generateHistoryHTMLFormat(jsonHistory);

            self.historyModalElem.html(htmlVersion);
            new Scrolling('#' + self.appName + '_history_list');
            localStorage.setItem(self.storageKey, 'stored');

        }, `при запросе истории версий ${this.appName}`);
    }

    //
    // Функция вызова и обработки данных при просмотре истории версий приложения
    //
    getAppVersionHistory(force = true){

        if (! localStorage.getItem(this.storageKey) || force) {
            // Привязываем функцию запроса данных с сервера к кнопке вызова
            this.historyModalElem.on('shown.bs.modal', this._getAppVersionHistoryOnCall.bind(this));
        }
    }




    //
    // Функция запроса удаления программы
    //
    askToFullDelete(){this._askToDeleteApp('full');}
    askToSimpleDelete(){this._askToDeleteApp('simple');}
    _askToDeleteApp(method){

        const self = this;
        let textToAsk = 'пакета <b>' + RusNames[this.appName];
        textToAsk += (method === 'simple') ? '</b>.': '</b> и его данных.';
        const askToDeleteNoty = new Noty({
            text:   '<div class="ps-3 pb-1 border-bottom pb-5 pt-4">' +
                        "<div class='d-flex flex-row align-items-baseline text-center pt-2 '>" +
                            '<div class="fs-4 mt-2 mb-1 text-danger me-2 ">Подтвердите удаление ' + textToAsk + '</div>' +
                        "</div>" +
                    '</div>',
            closeWith: ['click', 'backdrop', 'button'], // ['click', 'button', 'hover', 'backdrop']
            type: 'confirm',
            modal: true,
            layout: 'topCenter',
            buttons: [
                Noty.button('Отменить', 'btn btn-link mb-2 me-2', () => {askToDeleteNoty.close();}),
                Noty.button('Удалить <i class="ph-x ms-2 "></i>','btn btn-outline-danger ms-2 me-4 mb-2', () => { self._appDelete(method);}),
            ],
            callbacks:{
                beforeShow: function() {
                    rightPanelAct('hide', this.callRightPanel );
                },
                afterClose: function() {
                    rightPanelAct('show', this.callRightPanel );
                    // костыль, который позволяет показывать окно при повторных вызовах
                    this.showing = false;
                    this.shown = false;
                },
            }
        });
        askToDeleteNoty.show();

    }

    // Удаление пакета
    _appDelete(method){

        const deleteRoute = (method === 'simple') ? 'delete_app_simple': 'delete_app_full';
        const self = this;

        tryGetDataFromServer(this.server, deleteRoute, {"app_name": this.appName}, (answer) => {

            if (answer.result) {

                showMessage(`Приложение <b>${self.appName}</b> было успешно удалено.`);
            }
            const htmlVersion =  generateHistoryHTMLFormat(jsonHistory);

            self.historyModalElem.html(htmlVersion);
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
                if (installed === 'true' || menuItem.show_when_not_installed === 'true'){
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
    // @param {string} htmlTemplFile - файл-источник, образец с карточкой шаблоном
    // @param {dict} applicationData - данные по приложению (описание структуры ниже).
    // @param {dict} jsonDropdownLinksList - список ссылок для ниспадающего меню в карточке приложения
    // @returns {void}
    //
    generateAppBigCardHTML(htmlTemplFile, applicationData) {
        const self = this;
        const templ = '_@';            // шаблон для поиска и замены имени приложения в карточке приложения

        // Загружаем шаблон карточки из файла
        const template = $.ajax({
            url: htmlTemplFile,
            async: false
        }).responseText;

        // Генерируем элементы из шаблона и добавляем данные
        // Возвращаем измененный код шаблона
        // return $.map(items, function (item) {
        let $element = $(template).clone();
        $element.find("[id^='" + templ + "'], [href^='#" + templ + "']").each(function () {
            const isIdMatch = $(this).is("[id^='" + templ + "']");
            const isHrefMatch = $(this).is("[href^='#" + templ + "']");

            if (isIdMatch) {
                const newId = $(this).attr('id').replace(templ, self.appName);
                $(this).attr('id', newId);
            }

            if (isHrefMatch) {
                const newHref = $(this).attr('href').replace("#" + templ, "#" + self.appName);
                $(this).attr('href', newHref);
            }
        });

        // Определяем число авторов в присланных данных
        function getNumAuthorsInData(obj, prefix){
            let count = 0;

            $.each(obj, function(key) {
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
        $.each(applicationData, function(key, value) {
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


            if (key.startsWith("author")){

                //  если ключ это автор
                const authorText = countAuthor < numAuthorsInData ? value.name + ', ' : value.name;
                const author = $('<a class="text-black fw-semibold"></a>')
                    .attr('href', `mailto:${value.email}`)
                    .attr('id', `${self.appName}_${key}`)
                    .text(authorText);

                $element.find(`#${self.appName}_authors`).append(author);
                countAuthor++;

            } else if(key.startsWith("links")){

                // добавляем в меню ссылки
                $element.replaceWith(function (){
                    return $(this).find(`#${self.appName}_dropdown_icon`).remove()
                });
                $element.find(`#${self.appName}_dropdown`).append(self._generateDropdownMenu(applicationData.links, applicationData.installed));

            } else if(key.startsWith("installed")){

                // Обрабатываем статус установки пакета
                const $icon = $element.find(`#${self.appName}_status_icon`);
                const $text = $element.find(`#${self.appName}_status_installed`);
                const $itemMenuDel = $element.find(`#${self.appName}_simple_delete_call`);
                const $itemMenuFullDel = $element.find(`#${self.appName}_full_delete_call`);
                const $itemMenuInstall = $element.find(`#${self.appName}_install_call`);
                const $itemMenuUpdate = $element.find(`#${self.appName}_update_install`);
                const $itemMenuDivUpdate = $element.find(`#${self.appName}_update_install_div`);
                const $itemMenuReview = $element.find(`#${self.appName}_review_call`);

                if (value === "true"){
                    $text.text('установлен').addClass('text-success').removeClass('text-warning');
                    $icon.addClass('ph-check').removeClass('ph-x');
                    $icon.addClass('bg-success').removeClass('bg-warning');
                    $itemMenuDel.removeClass('d-none');
                    $itemMenuFullDel.removeClass('d-none');
                    $itemMenuUpdate.removeClass('d-none');
                    $itemMenuDivUpdate.removeClass('d-none');
                    $itemMenuInstall.addClass('d-none');
                    $itemMenuReview.removeClass('d-none');
                } else {
                    $text.text('не установлен').addClass('text-warning').removeClass('text-success');
                    $icon.addClass('ph-x').removeClass('ph-check');
                    $icon.addClass('bg-warning').removeClass('bg-success');
                    $itemMenuDel.addClass('d-none');
                    $itemMenuFullDel.addClass('d-none');
                    $itemMenuUpdate.addClass('d-none');
                    $itemMenuDivUpdate.addClass('d-none');
                    $itemMenuInstall.removeClass('d-none');
                    $itemMenuReview.addClass('d-none');
                }

            }
            else {
                // обработка всех остальных тегов
                if ($element.find(`#${self.appName}_${key}`).length > 0) {
                    $element.find(`#${self.appName}_${key}`).html(value);
                }
            }
            $element.find(`#${self.appName}_${key}`).removeClass('placeholder placeholder-wave ');
        })

        return $element;
    }


    //
    // Генерируем модальное окно просмотра видео для приложения, если оно имеется.
    //
    _generatePreviewFrame() {
        // Загружаем видео о каждом приложении
        const src = './assets/media/'+ this.appName + '_preview.mov';
        // const modalWindow = $('#' + appName + '_preview_');
        const modalPreview = $('#' + this.appName + '_modal_preview');

        // Проверяем есть ли файл по указанному пути
        fetch(src)
            .then(function(response) {
                    const modalBody = modalPreview.find('.modal-body').empty();
                    if (response.status === 404) {
                        console.log(`Файл ${src} не найден!`);
                        const noFileFound = '<div class="fs-5 text-danger fw-light mb-1">Файл пред-просмотра не найден!</div>'
                        modalBody.append(noFileFound);
                    } else {
                        // устанавливаем длительность ролика
                        const duration = getVideoDuration(`${this.appName}_modal_preview`);
                        $(`#${this.appName}_preview_time`).html(duration);

                        // Если файл найден, то активируем события при показе и закрытии окна
                        modalPreview.on('shown.bs.modal', function (event) {
                            // загружаем файл во фрейм
                            const iframe = $('<div class="ratio ratio-16x9"><iframe class="rounded" src="' + src + '" allowfullscreen></iframe></div>');
                            modalBody.append(iframe);
                        });
                        modalPreview.on('hide.bs.modal', function (event) {
                            // удаляем фрейм
                            modalPreview.find('iframe').remove();
                        });

                    }
                }
            );
    }

}

