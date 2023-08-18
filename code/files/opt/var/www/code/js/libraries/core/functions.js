const numColumnCards = 'numColumnCards';    // Ключ числа колонок в главном окне для записи в localStorage
const fullViewCards  = 'fullViewCards';     // Ключ состояния полного вида карточек в окне для записи в localStorage
const sideBarResize = 'sideBarResize'       // Ключ состояния открытия правой боковой панели в окне для записи в localStorage

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
function generateHistoryHTMLFormat(jsonHistory) {
    const appName = jsonHistory.app_name
    const appNameRus = jsonHistory.app_name_rus + 'а'

    let html = '';

    html += '<div class="modal-dialog ">';
    html += '<div class="modal-content" id="' + appName + '_history_list">';
    html += '<div class="modal-header bg-primary bg-opacity-20 ps-3 pe-3 pt-2 pb-2">';
    html += '<h5 class="modal-title ps-2">История версий <span class="text-secondary ms-1 pt-1">' + appNameRus.toUpperCase() + '</span></h5>';
    html += '<button type="button" class="btn-close " data-bs-dismiss="modal"></button>';
    html += '</div>';
    html += '<div class="modal-body">'


    html += '<div class="row">'
    html += '<div class="col-9">';
    html += '<div class="scroll-content overflow-auto position-relative ps-4 pe-3" style="height: 40vh;" tabindex="0">';

    $.each(jsonHistory.version, function(version, items) {
        html += '<div class="pb-1">';
        html += '<h6>Версия ' + version + '</h6>';
        html += '<ol class="flex-column">';

        $.each(items, function(index, item) {
            $.each(item, function(key, value) {
                html += '<li>' + value + '</li>';
            });
        });

        html += '</ol>';
        html += '</div>';
    });
    html += '</div>';
    html += '</div>';

    html += '<div class="col">';
    html += '<div class="lift-down-10 sticky-lg-top order-1 order-lg-2 mb-3 d-xl-block d-none" id="ver_nav">';

    html += '<ul class="nav nav-scrollspy flex-column ">';
    let firstIteration = true;
    $.each(jsonHistory.version, function(version, items) {
        html += '<li class="nav-item"><a href="#" class="nav-link index'
        if (firstIteration) {
            html += ' active';
            firstIteration = false;
        }
        html += '">' + version + '</a></li>';
    });
    html += '</ul>';

    html += '</div>';
    html += '</div>';

    html += '</div>';   // Закрытие верхнего div-контейнера

    html += '</div>';
    html += '<div class="modal-footer p-0">';
    html += '<button type="button" class="btn btn-link" data-bs-dismiss="modal">Закрыть</button>';
    html += '</div>';
    html += '</div>';
    html += '</div>';

    return html;
}


/**
 * Управление правой панелью.
 *
 * @param {string} [act='hide'] - Действие для выполнения. Возможные значения: 'hide' (скрыть) или 'show' (показать).
 * @param {boolean} [needToCallRightPanel=false] - Флаг, указывающий, нужно ли вызывать правую панель.
 * @returns {void}
 */
function rightPanelAct(act = 'hide', needToCallRightPanel = false) {
    const rightPanel = $('#right_panel');

    // Если действие равно 'hide' (скрыть)
    if (act === 'hide') {
        // Если правая панель существует или уже отображается
        if (rightPanel || rightPanel._isShown()) {
            $('.btn-close[data-bs-dismiss="offcanvas"]').trigger('click');
        }
    }
    // Если действие равно 'show' (показать)
    else if (act === 'show') {
        const myOffcanvas = new bootstrap.Offcanvas(rightPanel);

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
            const item = $('<a>').addClass(activItemClass).attr({href:'#'}).text(`${i} столб.`);
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


function setPreviewVideoCardOnClick(appName) {
    const src = './assets/media/' + appName + '_preview.mov';
    const modalPreviewId = appName + '_modal_preview_window';
    const modalPreview = $('#' + modalPreviewId);

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
                        $('#' + appName + '_preview_time').html(duration);
                        console.log("Длительность видео:", duration);
                    })
                    .catch(error => {
                        console.error("Ошибка: ", error);
                    });
            }
        });
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


//
// Получаем длительность видео посредством начала его воспроизведения
//
// function getVideoDuration(idVideoSource) {
//     return new Promise((resolve, reject) => {
//         // Функция для форматирования времени
//         function formatTime(timeInSeconds) {
//             const minutes = Math.floor(timeInSeconds / 60);
//             const seconds = Math.floor(timeInSeconds % 60);
//             return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
//         }
//
//         // Создаем объект HTMLMediaElement
//         const videoElement = document.getElementById(idVideoSource);
//         let formattedDuration;
//
//         if (!videoElement) {
//             reject("Видеоэлемент не найден");
//             return;
//         }
//
//         // Загрузка метаданных видео
//         videoElement.addEventListener("loadedmetadata", function () {
//             const duration = videoElement.duration;
//             formattedDuration = formatTime(duration);
//             // Остановка воспроизведения после получения длительности
//             videoElement.pause();
//             resolve(formattedDuration);
//         });
//
//         // Начать загрузку видео для получения метаданных
//         videoElement.load();
//     });
// }
