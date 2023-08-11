


// Определяем приоритет обработки запросов к серверу
const RequestPriority = {
    RESTAPI: 0,
    WEBSOCKET: 1,
};

class NetworkRequestManager {
    /**
     * Класс для отправки запросов по HTTPS и Socket.IO протоколам с обработкой ошибок
     * @param {string} serverName - Имя сервера.
     * @param {number} port - Порт сервера.
     * @param {number} priorityRequest - Приоритет отправки запросов (RequestPriority.RESTAPI или RequestPriority.WEBSOCKET).
     */
    constructor(serverName, port, priorityRequest = RequestPriority.WEBSOCKET) {
        this.serverName = serverName;
        this.port = port;
        this.httpsPriority = priorityRequest;
        this.stack = [];
        this.messageContainer = $('#message-container');
        this.socket = null; // Переменная для хранения объекта Socket.IO
        this.initSocket(); // Инициализируем Socket.IO при создании экземпляра класса
    }

    /**
     * Инициализация Socket.IO
     */
    initSocket() {
        try {
            this.socket = io(`wss://${this.serverName}:${this.port}`);
            this.socket.on('connect', () => {
                this.showMessage('WebSocket подключен.', 'success');
            });
            this.socket.on('error', (error) => {
                this.showMessage(`Ошибка в WebSocket: ${error.message}`, 'danger');
            });
            this.socket.on('disconnect', () => {
                this.showMessage('WebSocket отключен.', 'warning');
            });
        } catch (error) {
            this.showMessage(`Ошибка при инициализации WebSocket: ${error.message}`, 'danger');
        }
    }

    /**
     * Отправка HTTPS-запроса
     * @param {string} path - Путь для запроса.
     * @param {Object} data - Данные для отправки.
     * @param {Function} callback - Функция обработки пришедшего ответа.
     */
    async _sendHttpsRequest(path, data, callback) {
        try {
            const url = `https://${this.serverName}:${this.port}/${path}`;
            const response = await $.ajax({
                url,
                type: 'POST',
                data: JSON.stringify(data),
                contentType: 'application/json',
                dataType: 'json'
            });
            callback(response);
        } catch (error) {
            this.showMessage(`Ошибка при отправке HTTPS запроса: ${error.message}`, 'danger');
        }
    }

    /**
     * Отправка Socket.IO-запроса
     * @param {string} path - Путь для запроса.
     * @param {Object} data - Данные для отправки.
     * @param {Function} callback - Функция обработки пришедшего ответа.
     */
    _sendSocketRequest(path, data, callback) {
        try {
            this.socket.emit(path, data);
            this.socket.on(`${path}_response`, (responseData) => {
                callback(responseData);
            });
        } catch (error) {
            this.showMessage(`Ошибка при отправке WebSocket запроса: ${error.message}`, 'danger');
        }
    }

    /**
     * Отправка запроса с выбором протокола
     * @param {string} path - Путь для запроса.
     * @param {Object} data - Данные для отправки.
     * @param {Function} callback - Функция обработки пришедшего ответа.
     * @param {boolean} allowDuplicate - Разрешить дублирование запроса в стеке.
     */
    async send(path, data, callback, allowDuplicate = false) {
        if (!allowDuplicate && this.stack.some(req => req.path === path)) {
            this.showMessage(`Ошибка при отправке HTTPS запроса: Запрос ${path} уже находится в стеке, дублирование запрещено.`, 'warning');
            return;
        }

        this.stack.push({ path });

        if (this.httpsPriority === RequestPriority.RESTAPI) {
            await this._sendHttpsRequest(path, data, (responseData) => {
                callback(responseData);
                this._removeFromRequestStack(path);
            });
            this._sendSocketRequest(path, data, (responseData) => {
                callback(responseData);
                this._removeFromRequestStack(path);
            });
        } else if (this.httpsPriority === RequestPriority.WEBSOCKET) {
            this._sendSocketRequest(path, data, (responseData) => {
                callback(responseData);
                this._removeFromRequestStack(path);
            });
            await this._sendHttpsRequest(path, data, (responseData) => {
                callback(responseData);
                this._removeFromRequestStack(path);
            });
        } else {
            this.showMessage(`Неизвестный приоритет запроса: ${this.httpsPriority}`, 'danger');
        }
    }

    /**
     * Удаление запроса из стека
     * @param {string} path - Путь для запроса.
     */
    _removeFromRequestStack(path) {
        this.stack = this.stack.filter(req => req.path !== path);
    }

    /**
     * Отображение сообщения
     * @param {string} message - Текст сообщения.
     * @param {string} type - Тип сообщения (success, danger, warning и т.д.).
     */
    showMessage(message, type) {
        const alertElement = $(`<div class="alert alert-${type} fade show mb-2" role="alert">
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            ${message}
        </div>`);
        this.messageContainer.append(alertElement);
        alertElement.fadeTo(3000, 500).slideUp(500, () => {
            alertElement.alert('close');
        });
    }
}
