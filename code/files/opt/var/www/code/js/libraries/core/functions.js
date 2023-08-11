
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
