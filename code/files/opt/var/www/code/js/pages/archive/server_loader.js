/**
 * Класс для отправки POST-запросов
 */
class ServerRequester {
    /**
     * Конструктор класса
     * @param {string} url - URL для отправки запросов
     * @param {number} port - Номер порта для отправки запросов
     * @param {Object} headers - Заголовки для отправки запросов
     */
    constructor(url = '', port= 6621, headers = {}) {
        // Сохранение параметров в свойствах класса
        this.url = url;
        this.port = port;
        this.headers = headers;
        // Создание пустой очереди запросов
        this.queue = [];
        // Создание объекта Noty для отображения сообщений об ошибках
        this.errorNoty = new Noty({
            type: 'error',
            layout: 'topRight',
            theme: 'bootstrap-v4',
            modal: true,
            timeout: 3000,
            killer: true
        });
        const textLoading = "Загружаем данные..."
        // Индикатор в виде горизонтальной линии с прогрессом исполнения
        this.progressBarIndicatorNoty = new Noty({
            type: 'info',
            layout: 'center',
            theme: 'bootstrap-v4',
            text:
                '<i class="fas fa-spinner fa-spin pe-3"></i> ' + textLoading+ '<br>' +
                '<div class="progress">' +
                    '<div class="progress-bar progress-bar-striped progress-bar-animated" ' +
                    'role="progressbar" aria-valuenow="0" aria-valuemin="0" ' +
                    'aria-valuemax="100" style="width: 0%"></div>' +
                '</div>',
            closeWith: [],  // ['click', 'button', 'hover', 'backdrop']
            killer: true,
            modal: true,
            animation: {
                open: null,
                close: null
            }
        });
        // Индикатор в виде вертящегося кружка - spin
        this.spinIndicatorNoty = new Noty({
            type: 'info',
            layout: 'center',
            theme: 'bootstrap-v4',
            text:
                '<div class="d-flex align-items-center">' +
                    '<div class="spinner-border text-primary" role="status"></div>' +
                    '<div class="ps-3">' + textLoading+ '</div>' +
                '</div>',
            closeWith: [],   // ['click', 'button', 'hover', 'backdrop']
            killer: true,
            modal: true,
            animation: {
                open: null,
                close: null
            }
        });
        // Создание объекта для кеширования данных
        this.cache = {};
        this.data = {};
    }

    /**
     * Проверка входных данных до отправки на сервер
     * @param {Object} data - Данные для проверки
     * @returns {boolean} - Результат проверки (true - данные корректны, false - данные некорректны)
     */
    validateDataRequest(data) {
        // Здесь можно добавить код для проверки входных данных
        // Например, проверить, что data является объектом и содержит необходимые ключи и значения
        // Если данные корректны, вернуть true, иначе вернуть false
        return true;
    }

    /**
     * Проверка входных данных после получения с сервера
     * @param {Object} data - Данные для проверки
     * @returns {boolean} - Результат проверки (true - данные корректны, false - данные некорректны)
     */
    validateDataResponse(data) {
        // Здесь можно добавить код для проверки входных данных
        // Например, проверить, что data является объектом и содержит необходимые ключи и значения
        // Если данные корректны, вернуть true, иначе вернуть false
        return true;
    }
    /**
     * Добавление POST-запроса в очередь на исполнение
     * @param {string} path - Путь запроса
     * @param {Object} data - Данные в виде JSON-структуры
     * @param {function} [callback] - Функция обратного вызова, которая будет вызвана после получения ответа от сервера
     * @param {boolean} useQueue - если true, то загружаемся из очереди и нужен вызов executeQueue и в=затем getDataFromQueue
     *                             если false, то просто запрашиваем данные и сразу получаем ответ.
     */
    send(path,  callback = null, data = {}, useQueue = false ) {
        let result = null;
        if (this.validateDataRequest(data)) {
            if (useQueue) {
                this.queue.push(() => this.sendData(path, data, callback));
            } else {
                result = this.sendData(path, data, callback);
            }
        } else {
            console.error("Неверные данные");
        }
        return result;
    }


    /**
     * Отправка POST-запроса
     * @param {string} path - Путь запроса
     * @param {Object} data - Данные в виде JSON-структуры
     * @param {function} callback - Функция обратного вызова, в случае подучения данных
     * @returns {Object} - Результат запроса
     */
    sendData(path, data= {}, callback = null) {
        let result = null;
        let self = this;
        // Проверка входных данных
        if (this.validateDataRequest(data)) {
            // Если sendData была вызвана напрямую
            // без использования очереди вызовов
            Noty.closeAll();
            if (this.queue.length === 0) this.spinIndicatorNoty.show();
            // Отправка POST-запроса с помощью jQuery.ajax
            $.ajax({
                url: `${this.url}:${this.port}${path}`,
                type: 'POST',
                data: JSON.stringify(data),
                contentType: 'application/json',
                success: (response) => {
                    if (self.validateDataResponse(response)) {
                        // обработка успешного ответа
                        // Вызов функции обратного вызова, если она передана
                        if (callback && typeof callback === 'function') {
                            callback(response);
                        }
                        // Закрываем индикатор ожидания
                        if (self.queue.length === 0) self.spinIndicatorNoty.close();
                        // сохранение ответа в кэше
                        self.cache[path] = response;
                        result = response;
                    } else {
                        console.error("Неверный ответ от сервера");
                    }
                },
                error: function (error) {
                    // обработка ошибки
                    // Закрываем индикатор ожидания
                    if (self.queue.length === 0) self.spinIndicatorNoty.close();
                    // Отображение сообщения об ошибке с помощью Noty
                    const err_mess = "Ошибка при отправке запроса: " + error.statusText + ' (' + error.status + ')';
                    // self.errorNoty.setText().show(err_mess);
                    console.error(err_mess + '\n' + data);
                },
                complete: function () {
                    // всегда выполняется после завершения запроса
                    // например, можно скрыть индикатор загрузки
                    self.spinIndicatorNoty.close()
                    self.errorNoty.close();
                }
            });

        } else {
            // если не прошли проверку на ошибки
            // Отображение сообщения об ошибке с помощью Noty
            this.errorNoty.setText('Ошибка: отправляемые данные не прошли проверку.').show();
        }
        return result;
    }

    /**
     * Получение данных по ключу из кеша или с сервера
     * @param {string} key - Ключ для получения данных в виде пути запроса данных на сервер, он одинаков path в sendData
     * @param {boolean} [force=false] - Флаг принудительного обновления данных с сервера (true - обновить данные с сервера, false - использовать данные из кеша)
     * @returns {Object} - Данные по ключу
     */
    async getDataFromQueue(key, force = false) {
        // Проверка корректности ключа
        if (typeof key !== 'string' || key.length === 0) {
            // Если ключ некорректен, вернуть null
            this.errorNoty.setText('Ошибка: ключ должен быть строкой и не пустым!').show();
            return null;
        }

        // Ожидание выполнения всех запросов в очереди
        await Promise.all(this.queue);

        // проверяем на наличие в кеше ключа
        if (this.cache.hasOwnProperty(key)){
            // если ключ имеется, но флаг принудительного
            // обновления данных с сервера равен true, то делаем запрос на сервер
            if (force) {
                // Если установлен флаг принудительного обновления данных или в кеше нет данных по ключу,
                // выполнить запрос к серверу и обновить данные в кеше
                this.sendData(key, this.data[key]);
            }
            // Вернуть данные из кеша по ключу
            return this.cache[key];

        } else {
            // Если ключа в кеше нет, то отображение сообщения об ошибке с помощью Noty
            this.errorNoty.setText('Ошибка: данного ключа нет в кеше данных.').show();
            return null;
        }

    }




    /**
     * Выполнение всех запросов в очереди
     */
    async executeQueue() {
        // Отображение окна ожидания
        this.progressBarIndicatorNoty.show();
        // Вычисление общего количества запросов
        let totalRequests = this.queue.length;
        // Счетчик выполненных запросов
        let completedRequests = 0;
        // Выполнение всех запросов в очереди
        while (this.queue.length > 0) {
            // Извлечение первого запроса из очереди
            let request = this.queue.shift();
            // Выполнение запроса и ожидание его завершения
            await request();
            // Увеличение счетчика выполненных запросов
            completedRequests++;
            // Вычисление процента выполнения
            let progress = Math.round(completedRequests / totalRequests * 100);
            // Обновление прогресс-бара в окне ожидания
            this.progressBarIndicatorNoty.$bar.find('.progress-bar').css('width', progress + '%').attr('aria-valuenow', progress);
        }
        // Закрытие окна ожидания
        this.progressBarIndicatorNoty.close();
    }
}

// Пример общего применения

// sendData.addToQueue('/api/v1/CAMOBAP/info');
// sendData.addToQueue('/api/v1/CAMOBAP/info/version');
// sendData.addToQueue('/api/v1/CAMOBAP/update');
// sendData.executeQueue();
//
// const lib1_data = sendData.getData('/api/v1/CAMOBAP/info');
// $('exp_1').html(lib1_data['version']);
//
// const lib1_data = sendData.getData('/api/v1/CAMOBAP/info/version');
// $('exp_1').html(lib1_data['value']);
//
// const lib2_data = sendData.getData('/api/v1/CAMOBAP/update');
// $('exp_3').html(lib2_data['status']);


// Продвинутое применение
//  Создаем экземпляр класса с URL и номером порта для отправки запросов
// let postRequest = new PostRequest('https://example.com', 80);
//
// Получение данных по ключу '/path/to/data' из кеша или с сервера
// let data = postRequest.getData('/path/to/data');
//
// Получение данных по ключу '/path/to/data' с сервера (принудительное обновление данных)
// let newData = postRequest.getData('/path/to/data', true);

// Пример использования вызова callback функции в postRequest
// postRequest.sendData('/path/to/data', {}, (data) => {
//     console.log('Received data:', data);
// });

// Здесь, запрос будет выполнен после получения ответа от сервера.
// Например, чтобы добавить запрос в очередь и выполнить коллбэк
// после получения ответа, можно использовать следующий код:
//
//     postRequest.addToQueue('/path/to/data', {}, (data) => {
//         console.log('Received data:', data);
//     });