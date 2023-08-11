/**
 * Класс для создания и управления анимацией вращения изображения.
 */
class ModalAnimation {
    /**
     * Создает новый экземпляр класса ModalAnimation.
     * @param {string} imgSrc - Источник изображения.
     * @param {number} imgSize - Размер изображения.
     * @param {number} overlayOpacity - Непрозрачность затемнения.
     * @param {number} cycleDuration - Продолжительность цикла анимации.
     * @param {number} rotationSpeed - Скорость вращения.
     * @param {number} acceleration - ускорение вращения.
     */
    constructor(imgSrc, imgSize, overlayOpacity, cycleDuration, rotationSpeed, acceleration) {
        this.imgSize = imgSize;
        this.cycleDuration = cycleDuration / 1000;
        this.overlayOpacity = overlayOpacity;
        this.imgSrc = imgSrc;
        this.rotationSpeed = rotationSpeed;
        this.interval = null;
        this.$imgContainer = null;
        this.$overlay = null;
        this.acceleration = acceleration;
    }

    /**
     * Запускает анимацию вращения изображения.
     */
    start() {
        try {
            // Создание элементов
            this.$overlay = $('<div>').css({
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'black',
                opacity: this.overlayOpacity / 100,
                zIndex: 9998
            });
            this.$imgContainer = $('<div>').css({
                borderRadius: '50%',
                border: `${this.imgSize * 0.03}vh solid white`,
                overflow: 'hidden',
                position: 'fixed',
                top: '40%',		// ориентация по высоте отображения анимации
                left: '50%',  	// ориентация по ширине отображения анимации
                transform: 'translate(-50%, -50%)',
                width: `${this.imgSize}vh`,
                height: `${this.imgSize}vh`,
                zIndex: 9999,
            });
            const $img = $('<img>')
                .attr('src', this.imgSrc)
                .css({
                    position: 'absolute',
                    top: '-2%',
                    left: 0,
                    width: '100%',
                    height: '100%',
                    padding: '5%'
                }).on('error', () => {
                    // Обработка ошибки загрузки изображения
                    console.error(`Ошибка загрузки изображения ${this.imgSrc}`);
                    this.stop();
                });
            this.$imgContainer.append($img);
            $('body').append(this.$overlay).append(this.$imgContainer);

            // Анимация
            let angle = 0;
            let speed = 0;

            // Функция для обновления анимации
            const updateAnimation = (rotationType) => {
                if (rotationType === 'clockwise') {
                    angle += speed;
                    if (angle >= 1) angle -= 1;
                } else if (rotationType === 'counterclockwise') {
                    angle -= speed;
                    if (angle <= -1) angle += 1;
                }
                if (speed < this.rotationSpeed) speed += this.acceleration;
                this.$imgContainer.css('transform', `translate(-50%, -50%)
          		rotateY(${angle}deg)
          		rotateX(${angle}deg)
          		rotateY(${angle}deg)
          		rotateX(${angle}deg)
          		`);
            };

            // Запуск первого цикла анимации
            this.interval = setInterval(() => updateAnimation('clockwise'), this.cycleDuration);

        }
        catch(error) {
            console.error(`Ошибка при запуске анимации: ${error.message}`);
            this.stop();
        }
    }
    /**
     * Останавливает анимацию вращения изображения.
     */
    stop() {
        clearInterval(this.interval);
        this.$imgContainer.remove();
        this.$overlay.remove();
    }

}



/**
 * Класс для отправки запросов на сервер через REST API или WebSocket
 */
class TransportAPI {
    /**
     * Создает экземпляр класса ApiClient
     * @param {string} server - Адрес сервера
     * @param {number} port - Порт сервера
     */
    constructor(server, port) {
        this.server = server;
        this.port = port;
        this.queue = [];
        this.socket = null;
        this.checkWebSocket();
        const imgSrc = "assets/images/logo/loading.svg"
        this.spinAnimated = new ModalAnimation(imgSrc, 15, 70, 1, 1, 3);
    }

    /**
     * Проверка наличия WebSocket и установка соединения
     * @private
     */
    checkWebSocket() {
        if (typeof io !== 'undefined') {
            let url = `https://${this.server}:${this.port}`;
            try {
                this.socket = io(url);
                this.socket.on('connect', () => {
                    console.log("WebSocket соединение установлено");
                    this.processQueue();
                });
                this.socket.on('connect_error', (error) => {
                    console.error(`Ошибка WebSocket: ${error}`);
                    this.socket = null;
                });
                this.socket.on('disconnect', (reason) => {
                    console.log(`WebSocket соединение закрыто: ${reason}`);
                    this.socket = null;
                });
            } catch (error) {
                console.error(`Ошибка WebSocket: ${error}`);
                this.socket = null;
            }
        } else {
            console.log("Библиотека socket.io не найдена");
            this.socket = null;
        }
    }

    /**
     * Обработка запросов из очереди
     * @private
     */
    processQueue() {
        while (this.queue.length > 0) {
            let request = this.queue.shift();
            if (this.socket) {
                const action = request.route.split("/").pop();
                // const message = {type: action, data: request.data};
                // const message = {data: request.data};
                this.socket.emit(action, request.data);
                this.socket.on(action + '_response', (data) => {
                    request.callback(data);
                });
            } else {
                this.sendAjax(request.route, request.data, request.callback);
            }
        }
    }

    /**
     * Отправка запроса через REST API
     * @param {string} route - Маршрут запроса
     * @param {Object} data - Данные запроса
     * @param {function} callback - Функция обратного вызова для обработки ответа
     * @private
     */
    sendAjax(route, data, callback) {
        $.ajax({
            type: "POST",
            url: `https://${this.server}:${this.port}/${route}`,
            data: JSON.stringify(data),
            contentType: "application/json",
            success: (data) => {callback(data);},
            error: (error) => {console.error(`Ошибка REST API: ${error}`);}
        });
    }

    /**
     * Отправка запроса на сервер
     * @param {string} route - Маршрут запроса
     * @param {Object} data - Данные запроса
     * @param {function} callback - Функция обратного вызова для обработки ответа
     */
    send(route, data, callback) {
        const action = route.split("/").pop();
        let request = {route: route, data: data, callback: callback};
        this.spinAnimated.start();		// запускаем анимацию до окончания загрузки
        if (this.socket && this.socket.connected) {
            // let message = {type: action, data: request.data};
            // const message = {data: request.data};
            this.socket.emit(action, request.data);
            this.socket.on(action + '_response', (data) => {
                callback(data);
            });
        } else {
            this.queue.push(request);
            if (!this.socket) {
                this.sendAjax(request.route, request.data, request.callback);
            }
        }
        this.spinAnimated.stop();		// останавливаем анимацию до окончания загрузки
    }
}

// export default TransportAPI;