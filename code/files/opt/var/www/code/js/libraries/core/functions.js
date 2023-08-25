const numColumnCards = 'numColumnCards';    // Ключ числа колонок в главном окне для записи в localStorage
const fullViewCards  = 'fullViewCards';     // Ключ состояния полного вида карточек в окне для записи в localStorage
const sideBarResize  = 'sideBarResize'      // Ключ состояния открытия правой боковой панели в окне для записи в localStorage



/**
 * Управление правой панелью.
 *
 * @param {string} [act='hide'] - Действие для выполнения. Возможные значения: 'hide' (скрыть) или 'show' (показать).
 * @param {boolean} [needToCallRightPanel=false] - Флаг, указывающий, нужно ли вызывать правую панель.
 * @returns {void}
 */
function rightPanelAct(act = 'hide', needToCallRightPanel = false) {

    const rightPanel = $('#right_panel');
    const myOffcanvas = new bootstrap.Offcanvas(rightPanel);

    // Если действие равно 'hide' (скрыть)
    if (act === 'hide') {
        // Если правая панель существует или уже отображается
        if (rightPanel || rightPanel._isShown()) {
            $('.btn-close[data-bs-dismiss="offcanvas"]').trigger('click');
        }
    }
    // Если действие равно 'show' (показать)
    else if (act === 'show') {
        // Если нужно вызвать правую панель
        if (needToCallRightPanel) {
            myOffcanvas.show();
        }
    }
}

/**
 * Обновляет распределение элементов в столбцах и рядах в соответствии с заданными числами колонок и рядов.
 *
 * @param {jQuery} container  - элемент, в который нужно добавить колонки и ряды
 * @param {number} numColumns - Количество колонок для распределения.
 * @param {boolean} saveValue - флаг сохранения устанавливаемого значения числа колонок в локальную память
 */
function updateColumns(container, numColumns, saveValue = true) {
    // Рассчитываем ширину колонок и высоту рядов
    const columnWidth = Math.floor(12 / numColumns);

    // Сохраняем старые элементы с классами 'col-' и их содержимое
    const oldColumnContents = [];
    container.find('[class*="col-"].card-container').each(function () {
        oldColumnContents.push($(this).contents().detach());
    });

    // Создаем новые элементы div с классами 'col-N' и добавляем содержимое
    // Удаляем старые элементы с классами 'col-'
    container.find('[class*="col-"].card-container').remove();

    for (let j = 0; j < numColumns; j++) {
        const columnDiv = $('<div>').addClass(`col-${columnWidth} card-container`);
        container.append(columnDiv);

        if (oldColumnContents.length > 0) {
            const content = oldColumnContents.shift();
            if (content) {
                columnDiv.append(content);
            }
        }
    }

// Добавляем оставшиеся элементы в первый столбец
    const firstColumnDiv = container.find(`.col-${columnWidth}:first.card-container`);
    for (const remainingContent of oldColumnContents) {
        firstColumnDiv.append(remainingContent);
    }

    dragInit(container);
    // Сохраняем в памяти
    if (saveValue) localStorage.setItem(numColumnCards, String(numColumns));
}



//
// Установка при загрузке страницы переключателя открытия и закрытия правой панели меню
//
function initSideBarResizeState(){
    const sideBarResizeState = localStorage.getItem(sideBarResize) === 'true'
    toggleSideBarResize(sideBarResizeState);

    $('#resize_pc_button').on('click', function (){
        localStorage.setItem(sideBarResize, String(!sideBarResizeState))
    });


}

//
// Переключатель открытия и закрытия правой панели меню
//
function toggleSideBarResize(stateOpen){
    const sidebarResizedClass = 'sidebar-main-resized';
    const $sidebarPanel = $('#sidebar_panel')

    if($sidebarPanel.hasClass(sidebarResizedClass)) {
        if(stateOpen) $sidebarPanel.removeClass(sidebarResizedClass);
    } else {
        if (!stateOpen) $sidebarPanel.addClass(sidebarResizedClass);
    }
    localStorage.setItem(sideBarResize, String(stateOpen));
}

/**
 *  Функция предназначена для установки при загрузке
 *  страницы кнопок с количеством видимых столбцов в правом меню
 *  @param {jQuery} viewContainer     - элемент в который нужно добавить колонки
 *  @param {jQuery} $numColumnsSelect - элемент выбора числа колонок
 **/
function initRightPanelColumnsButtons(viewContainer, $numColumnsSelect) {

    const setup = $('#columns-setup');
    // Запускаем настройку числа колонок окна только если карточек больше чем одна
    if (viewContainer.find('.card').length > 1 ){
        setup.removeClass('d-none');
        setup.parent().addClass('p-2');
        // Определение числа возможных столбцов в зависимости от ширины экрана
        let maxColumns = 0;
        if (window.innerWidth < 576) {
            maxColumns = 2;
        } else if (window.innerWidth < 768) {
            maxColumns = 2;
        } else if (window.innerWidth < 1200) {
            maxColumns = 3;
        } else {
            maxColumns = 4;
        }

        const elements = viewContainer.find('[id^="app_"]');

        function setMainCard(element, numCards){
            let res = numCards;
            if(numCards > 1) {
                element.removeClass('ps-0 main-card');
            }
            else {
                element.addClass('ps-0 main-card');
                res = 1;
            }
            return res;
        }

        for (let i = 1; i <= maxColumns; i++) {
            const selectInput = $('<div>').addClass('dropdown-menu');
            const activItemClass = (i === 1) ? 'dropdown-item active' : 'dropdown-item';
            const item = $('<a>').addClass(activItemClass).attr({href:'#'}).text(`${i} колон.`);
            $numColumnsSelect.append(selectInput, item);

            item.on('click',  function () {
                const activeText = 'active';
                updateColumns(viewContainer, i);
                // $('#cellSizeSelect').text(`${i} шт.`)
                $numColumnsSelect.find(`[class*="${activeText}"]`).removeClass(activeText)
                $(this).addClass(activeText)
                setMainCard(elements, i)
            });
        }

        // Инициализация с начальным числом столбцов
        let  nCol = localStorage.getItem(numColumnCards);
        nCol = (nCol) ? +nCol : 1;
        nCol = setMainCard(elements, nCol)
        // Активируем соответствующий выбор числа столбцов
        $numColumnsSelect.find(`*:contains(${nCol})`).trigger('click')
        // updateColumns(viewContainer, nCol);

    } else {
        // Прячем настройку колонок окна если их меньше одного
        setup.addClass('d-none');
        setup.parent().removeClass('p-2');
    }
}

// Установка при загрузке страницы системы перетаскивания карточек
function dragInit(container){
    const containers = Array.from($('.card-container'));
    const drake = dragula(containers);
}


//
// Установка при загрузке страницы полного или компактного вида карточек
//
function initViewState(){
    const viewState = localStorage.getItem(fullViewCards) === 'true'
    const $fullViewButton = $('#card-view-full');
    const $compactViewButton = $('#card-view-compact');

    toggleCardViewingMode(viewState);
    $fullViewButton.prop("checked", viewState);
    $compactViewButton.prop("checked", !viewState);

    $fullViewButton.on('click', function (){
        toggleCardViewingMode(true);
    })
    $compactViewButton.on('click', function (){
        toggleCardViewingMode(false);
    })
}


/**
 *  Функция переключает режим отображения карточек на главном экране
 *
 *  @param {boolean} fullView     - если true, то устанавливаем режим полной высоты в карточке
 *                                  если false, то режим компакт
 **/
function toggleCardViewingMode(fullView) {

    const allCards = $(".card");
    const compactClassName = 'card-compact';
    const hideClassName = 'd-none';
    const widthClassName = 'w-75';


    allCards.each(function() {

        const authorElement = $(this).find("[id*='_authors']");
        const statusInstalledElement = $(this).find("[id*='_status_installed']");
        const dataVersionElement = $(this).find('#version-date-comment');
        const detailsBlockElem = $(this).find("[id*='_last_version_details']");

        if (fullView) {
            $(this).removeClass(compactClassName).removeClass(widthClassName);
            dataVersionElement.removeClass(hideClassName);
            authorElement.removeClass(hideClassName);
            statusInstalledElement.removeClass(hideClassName);
            detailsBlockElem.removeClass(hideClassName);

        } else {
            $(this).addClass(compactClassName).addClass(widthClassName)
            dataVersionElement.addClass(hideClassName);
            authorElement.addClass(hideClassName);
            statusInstalledElement.addClass(hideClassName);
            detailsBlockElem.addClass(hideClassName);
        }

    });
    localStorage.setItem(fullViewCards, String(fullView));
}



// Функция для получения длительности видео
function getVideoDuration(videoSrc) {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.src = videoSrc;
        video.onloadedmetadata = function () {
            resolve(formatDuration(video.duration));
        };
        video.onerror = function (error) {
            reject(error);
        };
    });
}

// Функция для форматирования длительности в часы, минуты и секунды
function formatDuration(duration) {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = Math.floor(duration % 60);

    const hoursText = hours > 0 && hours < 10 ? '0' + hours + ':' : hours > 0 ? hours + ':' : '';
    const minutesText = minutes > 0 && minutes < 10 ? '0' + minutes + ':' : minutes > 0 ? minutes + ':' : '';
    return hoursText + minutesText + seconds;
}

//--------------------------------------------------------------------------
//
// Генератор HTML кода для показа истории версий приложения из json словаря
//
//--------------------------------------------------------------------------
// Пример JSON-данных
//--------------------------------------------------------------------------
//     let jsonHistory = {
//             'app_name': app_name,
//             'version': {
//                  "1.0": [
//                      { "item1": "Значение 1.0 - Элемент 1"},
//                      { "item2": "Значение 1.0 - Элемент 2" }
//                   ],
//                  "2.0": [
//                      { "item1": "Значение 2.0 - Элемент 1" },
//                      { "item2": "Значение 2.0 - Элемент 2" },
//                       { "item2": "Значение 2.0 - Элемент 2" },
//                   ]
//     };
//

/**
 * Создает и отображает версионную историю приложения на веб-странице.
 *
 * @async
 * @param {Object} jsonHistory      - Данные версионной истории в формате JSON.
 * @param {string} root             - Путь к корневой директории
 * @param {string} historyTemplate  - Путь к файлу с HTML-шаблоном версионной истории.
 */
function createVersionHistory(jsonHistory, root= '', historyTemplate = 'pages/core/templates/history.html') {
    // Получаем элементы модального окна и контейнера для скроллинга.
    //    Пример сформированной структуры ответа
    //    {
    //        "app_name": "kvas",
    //        "rus_name": "Квас",
    //        "versions": [
    //        {
    //            "version": "v1.1.4"
    //            "date": "17 января 2023",
    //            "items": [
    //                "Доработан функция при обновлении правил, после которой происходил разрыв соединения <a href=\"https://github.com/qzeleza/kvas/issues/48\">тикет 48</a>.",
    //                "Доработана функция по добавлению/удалению гостевой/VPN сети - команда kvas vpn guest.",
    //                "Доработана функция получения entware интерфейса по IP, из-за чего происходило неверное распознавание данных."
    //            ],
    //        },
    //    }
    const appName                            = jsonHistory.app_name;
    const historyModalDialogId        = `${appName}_history_modal`;
    const $historyModalDialog                = $('<div>').addClass("modal fade").attr({id: historyModalDialogId, tabindex: -1})
    const scrollingHistoryListId      = `#${appName}_history_list`;
    const $listModalWindows                  = $('#list_modal_windows');

    try {
        // Удаляем предыдущий вариант истории, если он был
        $(`#${historyModalDialogId}`).remove();

        // Загружаем содержимое HTML-шаблона и заменяем плейсхолдер на название приложения.
        const data = getHTMLCodeFromFile(root + historyTemplate);

        // const data = await $.get(root + historyTemplate);
        const htmlVersion = replaceAttrValueInside($(data), '_@', appName);

        // Получаем контейнеры для контента и навигации из загруженного HTML.
        const contentContainer = htmlVersion.find(`#${appName}_history_content`);
        const navigationContainer = htmlVersion.find(`#${appName}_history_navigation`);
        const headerModalWindow = htmlVersion.find(`#${appName}_history_header`);
        // Установим заголовок окна
        headerModalWindow.text(`История версий расширения "${jsonHistory.rus_name}"`)
        // Итерируем по версиям из JSON-данных.
        for (const [_, history] of Object.entries(jsonHistory.versions)) {
//            const history = data[1];
            // Создаем контейнер для версии и добавляем заголовок с номером версии.
            const versionContainer = $('<div>').addClass("pb-1");
            versionContainer.append($('<h6>').html(`Версия ${history.version}<br><span class="text-muted fs-sm lift-up-5">${history.date}</span>`));

            // Создаем упорядоченный список для элементов версии.
            const listItems = $('<ol>').addClass('flex-column');

            // Итерируем по элементам текущей версии и их свойствам.
            for (const [_, value] of Object.entries(history.items)) {
    //            for (const [, value] of Object.entries(item)) {
                // Добавляем элемент списка с текстом значения.
                listItems.append($('<li>').html(value));
    //            }
            }

            // Добавляем список элементов к контейнеру версии.
            versionContainer.append(listItems);
            contentContainer.append(versionContainer);

            // Создаем пункт навигации для версий и ссылку.
            const navItem = $('<li>').addClass('nav-item');
            const navLink = $('<a>').addClass('nav-link index').attr('href', '#').text(history.version);

            // Устанавливаем активное состояние для первой версии.
            if (history.version === jsonHistory.versions[0].version) {
                navLink.addClass('active');
            }

            // Добавляем текст версии в пункт навигации и вставляем в HTML.
            navItem.append(navLink);
            navigationContainer.append(navItem);
        }

        // Добавляем HTML-код версионной истории в модальное окно.
        $historyModalDialog.append(htmlVersion);
        if ($listModalWindows.has(`#${historyModalDialogId}`).length === 0 ) {
            $listModalWindows.append($historyModalDialog);
            new Scrolling(scrollingHistoryListId);
        }


    } catch (error) {
        // Обрабатываем ошибки при загрузке и обработке данных.
        console.error(showError(`Ошибка при создании версионной истории: ${error}`));
        throw error;
    }
}


/**
 * Заменяет значение атрибута внутри элемента и его потомков.
 *
 * @param {jQuery} $element - jQuery-объект, представляющий элемент, внутри которого нужно произвести замену.
 * @param {string} oldAttValue - Старое значение атрибута для замены.
 * @param {string} newAttValue - Новое значение атрибута.
 * @returns {jQuery} Измененный jQuery-объект, представляющий исходный элемент.
 */
function replaceAttrValueInside($element, oldAttValue, newAttValue) {
    // Найти элемент и все его внутренние элементы
    $element.find('*').addBack().each(function () {
        // Получить все атрибуты элемента
        const attributes = this.attributes;

        // Проверить наличие атрибутов перед конвертацией
        if (attributes) {
            // Преобразовать attributes в массив, чтобы избежать "утечек памяти"
            const attributesArray = Array.from(attributes);

            // Для каждого атрибута элемента
            attributesArray.forEach(attr => {
                const { name, value } = attr;
                // Заменить исходную подстроку на новую подстроку в значении атрибута
                const newValue = value.replace(oldAttValue, newAttValue);
                // Установить новое значение атрибута
                $(this).attr(name, newValue);
            });
        }
    });

    // Вернуть измененный jQuery-объект, представляющий исходный элемент
    return $element;
}



/**
 * Функция для загрузки HTML-кода из файла с использованием асинхронного AJAX-запроса.
 *
 * @param {string} htmlCardTemplFile    - Путь к файлу с HTML-кодом.
 * @returns {Promise<string>}           - HTML-код из файла.
 */
function getHTMLCodeFromFile(htmlCardTemplFile){
    // Загружаем шаблон карточки из файла
    return $.ajax({
        url: htmlCardTemplFile,
        async: false
    }).responseText;
}

/**
 * Функция для загрузки HTML-кода из файла с использованием асинхронного AJAX-запроса.
 *
 * @param modalID
 * @param {string} htmlCardTemplFile    - Путь к файлу с HTML-кодом.
 * @returns {Promise<string>}           - HTML-код из файла.
 */
function getModalDialogFromFile(modalID, htmlCardTemplFile){
    const $historyModalDialog = $('<div>').addClass("modal fade").attr({id: modalID, tabindex: -1})
    // Загружаем шаблон карточки из файла
    const fileCont = $.ajax({
        url: htmlCardTemplFile,
        async: false
    }).responseText;
    return $historyModalDialog.append($(fileCont));
}

/**
 * Создает экземпляры класса Rating для каждого приложения с передачей информации о роутере.
 *
 * @param {Object} appsData                 - Объект с данными о приложениях.
 * @param {NetworkRequestManager} server    - объект типа NetworkRequestManager - сервер рейтингов
 * @param rightPanel                        - Объект правой панели
 */
//function createRatingsForApps(appsData, server, rightPanel) {
//
//    if (!appsData || typeof appsData !== 'object') {
//        console.error(showError('Некорректные данные о приложениях.'));
//        return;
//    }
//
//    if (ROUTER_INFO) {
//        for (const app_name in appsData) {
//            if (appsData.hasOwnProperty(app_name)) {
//                const callRightPanel = app_name === 'samovar';
//                new Rating(app_name, server, rightPanel, ROUTER_INFO,  callRightPanel);
//            }
//        }
//    } else {
//        tryGetDataFromServer(
//            RouterServer,
//            'get_router_data',
//            {},
//            (deviceInfo) => {
//                ROUTER_INFO = deviceInfo;
//                createRatingsForApps(appsData, server, rightPanel);
//            },
//            "при запросе информации о роутере пользователя"
//        );
//    }
//}


