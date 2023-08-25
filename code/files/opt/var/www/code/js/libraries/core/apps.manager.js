
class AppsManager {
    /**
     * Конструктор класса AppsLibManager
     * @param {string} app_name         - базовое имя программы на английском
     * @param {NetworkRequestManager} routerServer     - сервер для получения информации с роутера
     * @param {NetworkRequestManager} ratingServer     - сервер для получения информации о приложениях
     * @param {Object} rightPanel       - Объект Правой выезжающей панели
     * @param {boolean} callRightPanel  - флаг, указывающий, нужно ли вызывать правую панель после отправки отзыва
     * @param {string} root             - путь до корневой директории, требуемый для открытия файлов
     */
    constructor(app_name, routerServer, ratingServer, rightPanel,  callRightPanel = false, root = '') {
        this.routerServer               = routerServer;
        this.ratingServer               = ratingServer
        this.root                       = root;
        this.appName                    = app_name;
        this.callRightPanel             = callRightPanel;
        this.rightPanel                 = rightPanel;
        this.templeAppName              = '_@';

        this.storageKey                 = `#${this.appName}_history_modal_key`;
        this.modalDialogsList           = $('#list_modal_windows');

        this.htmlCardTemplFile          = root + 'pages/core/templates/card.html'
        this.htmlPreviewTemplFile       = root + 'pages/core/templates/preview.html'
        this.htmlAppDeleteTemplFile     = root + 'pages/core/templates/app.delete.html'

    }

    /**
     * Проверяет наличие обновления для приложения и обрабатывает результат.
     *
     * @param {boolean} [force=false] - Флаг, указывающий на принудительную проверку обновления.
     */
    checkAppUpdate(force = false) {
        // Выполняем запрос к серверу для проверки обновления
        tryGetDataFromServer(this.routerServer, 'check_update', {"app_name": this.appName}, (response) => {
            if (response.update) {
                if (force) {
                    this._appRequestUpdate(); // Вызываем метод для запроса обновления при принудительной проверке
                } else {
                    // Выводим информацию о наличии обновления
                    const info = `Найдено обновление для <b>${this.appName}</b>.<br>Новая версия<b> ${response.version}.</b>`;
                    showMessage(info, MessageType.INFO);
                }
            } else {
                console.log(`Обновления для ${this.appName} отсутствуют!`);
            }
        }, `при запросе обновления <b>${this.appName}</b>`);
    }



    // Обработчик обновления приложения
    _appRequestUpdate(){
        tryGetDataFromServer(this.routerServer, 'let_install', {"app_name": this.appName}, (response) => {
            if (response.success) {
                this.createAppVersionHistory(true);
                showMessage(`Обновление пакета "${this.appName}" прошло УСПЕШНО!<br>Пакет был обновлен до версии v${response.version}`,
                    MessageType.SUCCESS, LayoutType.CENTER, 5000);
            } else {
                showError(`Обновление пакета завершилось неудачно!<br>Причина ошибки: ${response.error}`, LayoutType.CENTER)
            }
        }, `при проведении обновления ${this.appName}`);
    }

    // Обработчик установки приложения
    appInstall(){

    }

    // Обновляем данные карточки приложения после его установки в Самовар
    updateCardApp(){}
    //
    // Функция вызова и обработки данных при просмотре истории версий приложения
    //
    createAppVersionHistory(force = true) {
        // Выполняем привязку только в случае наличия флага форсирования
        // или отсутствия сохраненного флага наличия привязки
        if (!localStorage.getItem(this.storageKey) || force) {
            // Привязываем функцию запроса данных с сервера к кнопке вызова
            tryGetDataFromServer(this.ratingServer, 'get_history', {"app_name": this.appName}, (jsonHistory) => {
                createVersionHistory(jsonHistory);
                localStorage.setItem(this.storageKey, 'stored');
            }, `при запросе истории версий ${this.appName}`);
        }
    }



    /**
     * Создает экземпляры класса Rating для каждого приложения с передачей информации о роутере.
     *
     * @param {Object} appsData - Объект с данными о приложениях.
     */
    createRatingsForApps(appsData) {

        if (ROUTER_INFO) {
            for (const app_name in appsData) {
                if (appsData.hasOwnProperty(app_name)) {
                    new Rating(app_name, this.ratingServer, this.rightPanel, ROUTER_INFO, this.callRightPanel);
                }
            }
        } else {
            tryGetDataFromServer(
                RouterServer,
                'get_router_data',
                {},
                (deviceInfo) => {
                    ROUTER_INFO = deviceInfo;
                    this.createRatingsForApps(appsData);
                },
                "при запросе информации о роутере пользователя"
            );
        }
    }



    initDeleteDialog(method, app_rus_name) {

        const self = this;
        let textToAsk = 'пакета <b>' + app_rus_name;
        textToAsk += (method === 'simple') ? '</b>.' : '</b> и его данных.';
        const fullDeleteElemId       = `${this.appName}_${method}_delete_modal`;
        const htmlDialog    = getModalDialogFromFile(fullDeleteElemId, this.htmlAppDeleteTemplFile);
        const appDeleteDialog       = replaceAttrValueInside(htmlDialog, this.templeAppName, this.appName);

        if (this.modalDialogsList.has(`#${fullDeleteElemId}`).length === 0 ) {

            const $appDeleteElem = $(appDeleteDialog);

            $appDeleteElem.find('.modal-title').text(`Удаление ${app_rus_name}`);
            $appDeleteElem.find('.modal-body').html(`Подтвердите удаление ${textToAsk}`);

            $appDeleteElem.find(`${this.appName}_delete_confirm`).on('click', function() {
                self._appDelete(method);
            });
            $appDeleteElem.find(`#${fullDeleteElemId}`).on('show.bs.modal', function() {
                if(this.callRightPanel) this.rightPanel.hide(); // rightPanelAct('hide', this.callRightPanel);
            });
            $appDeleteElem.find(`#${fullDeleteElemId}`).on('hidden.bs.modal', function() {
                if(this.callRightPanel) this.rightPanel.show();
                // rightPanelAct('show', this.callRightPanel);
            });
            this.modalDialogsList.append($appDeleteElem);
        }

    }

    // Удаление пакета
    _appDelete(method) {

        const deleteRoute = (method === 'simple') ? 'delete_app_simple' : 'delete_app_full';
        const self = this;

        tryGetDataFromServer(this.routerServer, deleteRoute, {"app_name": this.appName}, (answer) => {

            if (answer.result) {
                showMessage(`Приложение <b>${self.appName}</b> было успешно удалено.`);
            }

        }, `при запросе удаления пакета ${this.appName}`);
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
                    const icon = $('<i class="' + menuItem.icon + ' ph-1_5x"></i>');
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
        const template = getHTMLCodeFromFile(this.htmlCardTemplFile);

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
                self._updateModalElementsIfInstalled($element, value)
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

        // Создаем и устанавливаем реакцию на кнопки для простого и полного удаления
        this.initDeleteDialog('full', applicationData.app_rus_name);
        this.initDeleteDialog('simple', applicationData.app_rus_name);

        return $element;
    }


    // Устанавливаем доступность элементов в зависимости от флага установки приложения
    _updateModalElementsIfInstalled($element, isInstalled){

        // Обрабатываем статус установки пакета
        const self = this;
        const $icon = $element.find(`#${this.appName}_status_icon`);
        const $text = $element.find(`#${this.appName}_status_installed`);

        const colorUninstalledApp = 'warning'
        const colorInstalledApp = 'success'


        if (isInstalled === "true") {
            $text.text('установлен').addClass(`text-${colorInstalledApp}`).removeClass(`text-${colorUninstalledApp}`);
            $icon.addClass('ph-check').removeClass('ph-x').addClass(`bg-${colorInstalledApp}`).removeClass(`bg-${colorUninstalledApp}`);
            $element.find(`#${this.appName}_simple_delete_modal_call`).removeClass('d-none');
            $element.find(`#${this.appName}_full_delete_modal_call`).removeClass('d-none');
            $element.find(`#${this.appName}_install_update`).removeClass('d-none');
            $element.find(`#${this.appName}_install_update_div`).removeClass('d-none');
            $element.find(`#${this.appName}_install_app`).addClass('d-none');
            $element.find(`#${this.appName}_review_call`).removeClass('d-none');

            // Осуществляем привязку событий к элементам меню
            $element.find(`#${this.appName}_install_update`).on('click', function (){
                // Обновление пакета
                showError('JGC')
                self.checkAppUpdate(true);
            });
            $element.find(`#${this.appName}_install_app`).on('click', function (){
                // установка пакета
                self.appInstall();
            });
        } else {
            $text.text('не установлен').addClass(`text-${colorUninstalledApp}`).removeClass(`text-${colorInstalledApp}`);
            $icon.addClass('ph-x').removeClass('ph-check').addClass(`bg-${colorUninstalledApp}`).removeClass(`bg-${colorInstalledApp}`);
            $element.find(`#${this.appName}_simple_delete_modal_call`).addClass('d-none');
            $element.find(`#${this.appName}_full_delete_modal_call`).addClass('d-none');
            $element.find(`#${this.appName}_install_update`).addClass('d-none');
            $element.find(`#${this.appName}_install_update_div`).addClass('d-none');
            $element.find(`#${this.appName}_install_app`).removeClass('d-none');
            $element.find(`#${this.appName}_review_call`).addClass('d-none');

            $element.find(`#${this.appName}_install_update`).off('click');
            $element.find(`#${this.appName}_install_app`).off('click');
        }
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
        const data = getHTMLCodeFromFile(this.htmlPreviewTemplFile);
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

