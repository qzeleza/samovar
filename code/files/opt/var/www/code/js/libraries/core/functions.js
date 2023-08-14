
function samovarInitExtension(appName, routerInfo){

    if (!routerInfo) {
        console.error('Переданные данные routerInfo в функцию samovarInitExtension пусты.')
    }
    // устанавливаем версию приложения на странице библиотеки
    // $('#' + appName + '_version').html('v.' + LastVersion);

    // подгружаем возможность делать скролл
    // и устанавливаем рейтинг приложения
    new Rating(appName, routerInfo);


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
        if (rightPanel || rightPanel._isShown) {
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

//
// Получаем длительность видео посредством начала его воспроизведения
//
function getVideoDuration(idVideoSource){

    // Функция для форматирования времени
    function formatTime(timeInSeconds) {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
    }

    const videoElement = $(`#${idVideoSource}`)[0];
    let formattedDuration;

    // Загрузка метаданных видео
    videoElement.addEventListener("loadedmetadata", function () {
        const duration = videoElement.duration;
        formattedDuration = formatTime(duration);
        // Остановка воспроизведения после получения длительности
        videoElement.pause();
    });

    // Начать загрузку видео для получения метаданных
    videoElement.load();

    // возвращаем результат
    return formattedDuration;
}


/**
 * Обновляет распределение элементов в столбцах и рядах в соответствии с заданными числами колонок и рядов.
 *
 * @param {jQuery} container  - элемент, в который нужно добавить колонки и ряды
 * @param {number} numColumns - Количество колонок для распределения.
 */
function updateColumns(container, numColumns) {
    // Рассчитываем ширину колонок и высоту рядов
    const columnWidth = Math.floor(12 / numColumns);

    // Сохраняем старые элементы с классами 'col-' и их содержимое
    const oldColumnContents = [];
    container.find('[class*="col-"]').each(function () {
        oldColumnContents.push($(this).contents().detach());
    });

    // Создаем новые элементы div с классами 'col-N' и добавляем содержимое
    // Удаляем старые элементы с классами 'col-'
    container.find('[class*="col-"]').remove();

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
    const firstColumnDiv = container.find(`.col-${columnWidth}:first`);
    for (const remainingContent of oldColumnContents) {
        firstColumnDiv.append(remainingContent);
    }

    dragInit(container);
}


/**
 *  Функция предназначена для установки при загрузке
 *  страницы кнопок с количеством видимых столбцов в правом меню
 *  @param {jQuery} viewContainer     - элемент в который нужно добавить колонки
 *  @param {jQuery} $numColumnsSelect - элемент выбора числа колонок
 **/
function initRightPanelColumnsButtons(viewContainer, $numColumnsSelect) {

    // Определение числа возможных столбцов в зависимости от ширины экрана
    let maxColumns = 0;
    if (window.innerWidth < 576) {
        maxColumns = 2;
    } else if (window.innerWidth < 768) {
        maxColumns = 3;
    } else if (window.innerWidth < 1200) {
        maxColumns = 4;
    } else {
        maxColumns = 6;
    }


    for (let i = 1; i <= maxColumns; i++) {
        const selectInput = $('<div>').addClass('dropdown-menu');
        const activItemClass = (i === 1) ? 'dropdown-item active' : 'dropdown-item';
        const item = $('<a>').addClass(activItemClass).attr({href:'#'}).text(`${i}`);
        $numColumnsSelect.append(selectInput, item);

        item.on('click',  function () {
            const activeText = 'active';
            updateColumns(viewContainer, i);
            $('#cellSizeSelect').text(`${i} шт.`)
            $numColumnsSelect.find(`[class*="${activeText}"]`).removeClass(activeText)
            $(this).addClass(activeText)
            const elements = viewContainer.find('[id^="app_"]');
            if(i > 1) {elements.removeClass('main-card')}
            else {elements.addClass('main-card')}
        });
    }

    // Инициализация с начальным числом столбцов
    updateColumns(viewContainer, 1);

}

function dragInit(container){
    const containers = Array.from($('.card-container'));
    const drake = dragula(containers);
}
