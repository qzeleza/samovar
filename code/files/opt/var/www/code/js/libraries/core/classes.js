
//
// Типы сообщений для функции showMessage
//
const MessageType = {
    ERROR       : 'danger',
    INFO        : 'info',
    SUCCESS     : 'success',
    WARNING     : 'warning',
    ALERT       : 'primary',
}

const LayoutType = {
    TOP             : 'top',
    TOP_LEFT        : 'topLeft',
    TOP_CENTER      : 'topCenter',
    TOP_RIGHT       : 'topRight',
    CENTER          : 'center',
    CENTER_LEFT     : 'centerLeft',
    CENTER_RIGHT    : 'centerRight',
    BOTTOM          : 'bottom',
    BOTTOM_LEFT     : 'bottomLeft',
    BOTTOM_CENTER   : 'bottomCenter',
    BOTTOM_RIGHT    : 'bottomRight'
}
//
// Выводим сообщение на экран (правый верхний угол)
//
function showMessage(text,                                   // текст сообщения
                     type = MessageType.ALERT,        // тип сообщения (цвет фона)
                     layout = LayoutType.TOP_RIGHT,   // позиционирование сообщения: top, topLeft, topCenter, topRight, center, centerLeft, centerRight, bottom, bottomLeft, bottomCenter, bottomRight
                     timeout = 3000,                // Время показа сообщения
                     modal = false                  // модальное ли окно
) {
    new Noty({
        text: text,
        theme: ' alert-' + type + ' noty-container',
        modal: modal,
        layout: 'topRight',
        closeWith: ['click', 'button'],
        timeout: timeout,
    }).show();
}
//
// Показываем сообщение об ошибке
//
function showError(error, layout = LayoutType.TOP_RIGHT){
    console.log(error);
    showMessage(error, MessageType.ERROR, LayoutType.TOP_RIGHT, 5000, true )
    return error;
}


//
// Класс FormDataValidator предназначен для проверки данных в формах
//
class FormDataValidator {
    constructor(formId) {

        this.fields = [{}];
        this.formId = formId;
        $('#' + formId + ' [data-bs-toggle="tooltip"]').each((index, element) => {
            new bootstrap.Tooltip(element);
        });

    }

    // Функция для проверки валидности email
    isEmailValid(email) {
        let result = {'error': false, 'description': ''};
        // Регулярное выражение для проверки email
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            result['error'] = true;
            result['description'] = 'Введите корректный email в поле "Email".';
        }
        return result;
    }

    isTextValid(text, minLength) {
        let result = {'error': false, 'description': ''};
        if (text.length < minLength) {
            result['error'] = true;
            result['description'] = `Поле должно содержать не менее ${minLength} символов..`
        }
        return result;
    }

    _validateField(field, dictResult) {

        if (dictResult['error']) {
            field.addClass('is-invalid');
            field.tooltip({
                title: dictResult['description'],
                trigger: 'manual',
                placement: field.attr('data-bs-placement')
            }).tooltip('show');

            return false;
        }

        field.removeClass('is-invalid');
        field.tooltip('dispose');
        return true;
    }

    validate() {

        const self = this;
        let isValid = true;

        $('#' + this.formId + ' input[type="text"], input[type="email"], textarea').each((index, element) => {

            const $element = $(element); // Преобразование элемента в объект jQuery
            const elementValue = $element.val();
            let result = null;
            const minLength = $element.attr('data-min-length');
            const email = $element.attr('data-validate-email');

            if (minLength) result = self.isTextValid(elementValue, minLength);
            if (email) result = self.isEmailValid(elementValue);

            isValid &&= self._validateField($element, result);

            }
        );
        return isValid;
    }
}


//
// Замедленная, плавная прокрутка
// для этого необходимо чтобы элемент с содержимым (текстом)
// был класса 'scroll-content', у которого потомок только один div
// в котором и содержится заголовок и сам текст
// переход к главам и активация соответствующего пункта в оглавлении
// работает по принципу переход по индексу начиная сверху вниз
//
class Scrolling {
    constructor(id) {

        this.scrollContent = $(id + ' .scroll-content');
        this.scrollPointers = $(id + ' .nav.nav-scrollspy li');
        this.contentElements = $(id + ' .scroll-content > div');

        $(id + ' .nav.nav-scrollspy .nav-link').on('click', (event) => {this.smoothScrolling(event)});
        $(id + ' .scroll-content').on('scroll', () => {this.scrollContentFunc()});
    }

    smoothScrolling(event) {
        event.preventDefault();
        let index = $(event.target).closest('li').index();
        let target = this.contentElements.eq(index);
        this.scrollContent.animate({
            scrollTop: target.offset().top - this.scrollContent.offset().top + this.scrollContent.scrollTop()
        }, 1000);
        this.scrollPointers.find('a').removeClass('active')
        $(event.target).addClass('active');
    }

    scrollContentFunc() {
        this.contentElements.each((index, element) => {
            let content = $(element);

            content.on('mouseenter', () => {
                let $pointers, pointer, subPointers;
                $pointers = this.scrollPointers.find('a');

                $pointers.removeClass('active');
                pointer = $pointers.eq(index);
                subPointers = pointer.find('li').length;
                if (subPointers === 0 ){
                    pointer.addClass('active');
                }
            });
            content.on('mouseleave', () => {
                let $pointers, pointer, ind;
                $pointers = this.scrollPointers.find('a');
                ind =$(element).index();
                pointer = $pointers.eq(ind);
                pointer.removeClass('active');
            });
        });
    }
}


/*
* Класс PageBuilder предназначен для загрузки модулей и скриптов на страницу.
* Он имеет методы для добавления модулей, скриптов и функций обратного вызова в стеки,
* а также методы для загрузки данных из стеков и выполнения функций обратного вызова.
*/
class PageBuilder {
    /**
     * Создает новый экземпляр класса PageLoader.
     */
    constructor() {
        this.callStack = []; // Стек вызовов
        // this.progressBar = new ProgressBar('page_load_progress');
    }

    /**
     * Добавляет данные в стек вызовов.
     * @param {Object} data - Данные, которые нужно добавить в стек вызовов.
     * @param {string} [data.id] - Идентификатор элемента, к которому нужно применить данные.
     * @param {string} [data.file] - Путь к файлу, который нужно загрузить.
     * @param {Object} [data.attributes] - Атрибуты, которые нужно применить к элементу.
     */
    add(data) {
        if (!data) {
            throw new Error(showError('Некорректные данные'));
        }

        // Определение типа данных
        let type;
        if (typeof data === 'string') {
            const extension = data.split('.').pop();
            if (extension === 'js') {
                type = 'script';
            } else if (extension === 'html') {
                type = 'module';
            }
        } else if (typeof data === 'function') {
            type = 'callback';
        } else if (typeof data === 'object' && data.file) {
            type = 'module';
        } else if (typeof data === 'object' && !data.file) {
            type = 'attributes';
        }

        if (!type) {
            throw new Error(showError('Некорректные данные'));
        }

        this.callStack.push({type: type, id: data.id, data: data});
    }


    /**
     * Загружает все данные из стека вызовов.
     * @returns {Promise} Promise, который разрешается, когда все данные загружены.
     */
    load() {
        if (this.callStack.length === 0) {
            throw new Error(showError('Стек вызовов пуст'));
        }
        this._removeDuplicateScripts(); // Удаление повторяющихся скриптов из стека вызовов

        return new Promise((resolve, reject) => {
            let index = 0;
            const loadNext = () => {
                if (index < this.callStack.length) {
                    const item = this.callStack[index];
                    index++;
                    switch (item.type) {
                        case 'script':
                            // Загрузка скрипта
                            $.getScript(item.data)
                                .done(() => {
                                    loadNext();
                                })
                                .fail((jqxhr, settings, exception) => {
                                    reject(new Error(showError(`Ошибка при загрузке скрипта ${item.data}: ${exception}`)));
                                });
                            break;
                        case 'module':
                            const elemChecked = $(`${item.id}`);
                            // Загрузка модуля
                            if (!elemChecked.length) {
                                reject(showError(`Ошибка при загрузке модуля ${item.data.file}: элемент с идентификатором ${item.id} не найден`));
                            } else {
                                elemChecked.load(item.data.file, (response, status, xhr) => {
                                    if (status === 'error') {
                                        reject(showError(`Ошибка при загрузке модуля ${item.data.file}: ${xhr.statusText}`));
                                    } else if (!response || response.trim().length === 0) {
                                        reject(showError(`Ошибка при загрузке модуля ${item.data.file}: пустой ответ`));
                                    } else {
                                        // Применение атрибутов к загруженному модулю
                                        this._applyAttributes(item.data.attributes, reject);
                                        loadNext();
                                    }
                                });
                            }
                            break;
                        case 'callback':
                            // Вызов функции обратного вызова
                            item.data();
                            loadNext();
                            break;
                        case 'attributes':
                            // Применение атрибутов к элементу
                            this._applyAttributes(item.data.attributes, reject);
                            loadNext();
                            break;
                    }

                } else {
                    resolve();
                }
            };
            loadNext();
        });
    }

    /**
     * Удаляет повторяющиеся скрипты из стека вызовов.
     * @private
     */
    _removeDuplicateScripts() {
        const scripts = new Set();
        for (let i = this.callStack.length - 1; i >= 0; i--) {
            const item = this.callStack[i];
            if (item.type === 'script') {
                if (scripts.has(item.data)) {
                    this.callStack.splice(i, 1);
                } else {
                    scripts.add(item.data);
                }
            }
        }
    }

    /**
     * Применяет атрибуты к указанному элементу.
     * @private
     * @param {Object} attributes - Атрибуты, которые нужно применить к элементу.
     * @param {function} reject - Функция, которая вызывается, если произошла ошибка.
     */
    _applyAttributes(attributes, reject) {
        try {
            // Применение атрибутов к элементу
            if (attributes) {
                for (const [selector, attributeValues] of Object.entries(attributes)) {
                    for (const [attributeName, values] of Object.entries(attributeValues)) {
                        if (attributeName === 'class') {
                            for (const value of values) {
                                if (value.startsWith('-')) {
                                    $(selector).removeClass(value.slice(1));
                                } else if (value.startsWith('+')) {
                                    $(selector).addClass(value.slice(1));
                                } else {
                                    $(selector).attr(attributeName, value);
                                }
                            }
                        } else {
                            if ($(selector).attr(attributeName) === undefined) {
                                throw new Error(showError(`Атрибут ${attributeName} отсутствует в элементе ${selector}`));
                            }
                            $(selector).attr(attributeName, values);
                        }
                    }
                }
            }
        } catch (error) {
            reject(error);
        }
    }


    /**
     * Выгружает указанный ранее загруженный скрипт.
     * @param {string} scriptName - Имя скрипта, который нужно выгрузить.
     */
    unloadScript(scriptName= undefined) {
        const scripts = document.querySelectorAll('script');
        if (scriptName) {
            scripts
                .filter(script => script.src.includes(scriptName))
                .forEach(script => script.parentNode.removeChild(script));
        } else {
            scripts.forEach(script => script.parentNode.removeChild(script));
        }
    }


    /**
     * Очищает стек вызовов и сбрасывает все изменения.
     */
    reset() {
        this.callStack = [];
        this.unloadScript(); // Выгружаем все ранее загруженные скрипты
    }

}


/*
* Класс NetworkRequestManager предназначен для отправки запросов
* по HTTPS и Socket.IO протоколам с обработкой ошибок.
*/

// Определяем приоритет обработки запросов к серверу
const RequestPriority = {
    RESTAPI: 0,
    WEBSOCKET: 1,
};

/**
 * Функция шаблон для отправки запросов
 * с целью осуществления всех возможных проверок при запросе
 *
 * @param {Object} server           - экземпляр класса NetworkRequestManager
 * @param {string} request          - Путь для запроса.
 * @param {Object} data             - Данные для отправки.
 * @param {Function} callback       - Функция обработки пришедшего ответа.
 * @param {string} requestDescribe  - Описание запроса в предложном падеже, отвечает на вопрос "при чем?"
 */
function tryGetDataFromServer(server, request, data, callback, requestDescribe){
    try {
        server.send(request, data, (response) => {
            if (response) {
                callback(response);
            } else {
                console.log(showError(`Пришел пустой ответ с сервера ${requestDescribe}.`));
            }
        });
    } catch (error) {
        console.log(showError(`Ошибка ${requestDescribe}: ${error.message}`));
    }
}


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




class NetworkRequestManager {
    /**
     * Класс для отправки запросов по HTTPS и Socket.IO протоколам с обработкой ошибок
     * @param {string} serverName - Имя сервера.
     * @param {number} port - Порт сервера.
     * @param {string} rootPath - корневой путь для RestAPI запросов к серверу.
     * @param {number} priorityRequest - Приоритет отправки запросов (RequestPriority.RESTAPI или RequestPriority.WEBSOCKET).
     */
    constructor(serverName, port, rootPath = '', priorityRequest = RequestPriority.WEBSOCKET) {
        this.serverName = serverName;
        this.port = port;
        this.httpsPriority = priorityRequest;
        this.stack = [];
        this.rootPath = rootPath;
        this.messageContainer = $('#message-container');
        this.socket = null; // Переменная для хранения объекта Socket.IO
        this._initSocket(); // Инициализируем Socket.IO при создании экземпляра класса

        const imgSrc = "assets/images/logo/loading.svg"
        this.spinAnimated = new ModalAnimation(imgSrc, 15, 70, 1, 1, 3);
    }

    /**
     * Инициализация Socket.IO
     */
    _initSocket() {
        try {
            this.socket = io(`wss://${this.serverName}:${this.port}`);
            this.socket.on('connect', () => {
                console.log('WebSocket подключен.');
                // showMessage('WebSocket подключен.', MessageType.SUCCESS);
            });
            this.socket.on('error', (error) => {
                showError(`Ошибка в WebSocket: ${error.message}`)
            });
            this.socket.on('disconnect', () => {
                console.log('WebSocket отключен.');
                // showMessage('WebSocket отключен.', MessageType.WARNING);
            });
        } catch (error) {
            console.log(showError(`Ошибка при инициализации WebSocket: ${error.message}`));
        }
    }

    /**
     * Отправка HTTPS-запроса
     * @param {string} path - Путь для запроса.
     * @param {Object} data - Данные для отправки.
     * @param {Function} callback - Функция обработки пришедшего ответа.
     * @param {Function} errorCallback - Функция обработки ошибки
     */
    _sendHttpsRequest(path, data, callback, errorCallback) {
        try {

            const url = `https://${this.serverName}:${this.port}${this.rootPath}/${path}`;
            $.ajax({
                url: url,
                type: 'POST',
                data: JSON.stringify(data),
                contentType: 'application/json',
                dataType: 'json',
                success: function(response) {
                    // Обработка успешного ответа
                    console.log('Данные успешно получены:', response);
                    callback(response);
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    // Обработка ошибки
                    console.log(showError(`Ошибка при отправке HTTPS запроса: ${textStatus} - ${errorThrown}`));
                    // Дополнительные действия при ошибке...
                }
            });

        } catch (error) {
            console.log(showError(`Ошибка в самом HTTPS запросе: ${error.message}`));
            errorCallback();
        }
    }

    /**
     * Отправка Socket.IO-запроса
     * @param {string} path         - Путь для запроса.
     * @param {Object} data         - Данные для отправки.
     * @param {Function} callback   - Функция обработки пришедшего ответа.
     * @param errorCallback         - Функция обработки ошибки
     */
    _sendSocketRequest(path, data, callback, errorCallback) {
        try {
            this.socket.emit(path, data);
            this.socket.on(`${path}_response`, (responseData) => {
                callback(responseData);
            });
        } catch (error) {
            console.log(showError(`Ошибка при отправке WebSocket запроса: ${error.message}`));
            errorCallback();
        }
    }

    /**
     * Отправка запроса с выбором протокола
     * @param {string} path             - Путь для запроса.
     * @param {Object} data             - Данные для отправки.
     * @param {Function} callback       - Функция обработки пришедшего ответа.
     * @param {boolean} allowDuplicate  - Разрешить дублирование запроса в стеке.
     */
    send(path, data, callback, allowDuplicate = false) {

        if (!allowDuplicate && this.stack.some(req => req.path === path && req.data === data)) {
            console.log(showError(`Ошибка при отправке HTTPS запроса: Запрос ${path}, с данными ${data} уже находится в стеке, дублирование запрещено.`));
            return;
        }

        this.stack.push({ path, data });

        if (this.httpsPriority === RequestPriority.RESTAPI) {
            let restapiError = false;
            this._sendHttpsRequest(path, data, (responseData) => {
                if (!restapiError) {
                    callback(responseData);
                    this._removeFromRequestStack(path, data);
                }
            }, () => {
                restapiError = true;
                this._sendSocketRequest(path, data, (responseData) => {
                    callback(responseData);
                    this._removeFromRequestStack(path, data);
                }, () => {});
            });

        } else if (this.httpsPriority === RequestPriority.WEBSOCKET) {
            let socketError = false;
            this._sendSocketRequest(path, data, (responseData) => {
                if (!socketError) {
                    callback(responseData);
                    this._removeFromRequestStack(path, data);
                }
            }, () => {
                socketError = true;
                this._sendHttpsRequest(path, data, (responseData) => {
                    callback(responseData);
                    this._removeFromRequestStack(path, data);
                },  () => {});
            });

        } else {
            console.log(showError(`Неизвестный приоритет запроса: ${this.httpsPriority}`));
        }
    }

    /**
     * Удаление запроса из стека
     * @param {string} path - Путь для запроса.
     * @param data - данные запроса
     */
    _removeFromRequestStack(path, data) {
        this.stack = this.stack.filter(req => req.path !== path && req.data !== data);

    }

}


//
//  Класс Rating отображает текущий рейтинг программы,
//  полученный с сервера в виде звездочек-иконок
//
//  для работы необходимо название программы на английском,
//  дополнительно можно передать версию программы,
//  по умолчанию берется крайняя из БД версия программы
//
//  ВАЖНО:
//  На странице должны присутствовать элементы
//      1. Элемент li для отображения звездочек-иконок:
//          li с id = appName + '_rating', например
//          <li id='samovar_rating'></li>
//      2. Элемент внутри <li> для отображения числа голосов:
//          span с id = appName + '_voted', например
//          <span id='samovar_voted'></span>
//      3. Элемент при нажатии на который будет отображаться окно
//         для отправки отзыва на сервер рейтинга:
//         с id = appName + '_review', например
//         <a id='samovar_review' href='#'>Отправить отзыв</a>
//

//
// Указываем тип отзыва при отправке. Фиксируется в БД
//
const ReviewContext = {
    RATING: 'rating',                           //  отправляем оценку приложения без отзыва
    REVIEW_WITH_RATING: 'review_w_rating',      //  отправляем отзыв вместе с оценкой приложения
    REVIEW_ONLY: "review"                       //  отправляет ТОЛЬКО сам отзыв без оценки приложения
}

class Rating {
    // Конструктор
    /**
     * @param {string} appName                  - базовое имя программы на английском
     * @param {NetworkRequestManager} server    - объект типа NetworkRequestManager - сервер рейтингов
     * @param {Object} rightPanel               - Объект правой панели
     * @param {Object} routerInfo               - информация о текущем устройстве (роутере) с целью обезличенного закрепление данных
     * @param {boolean} callRightPanel          - необходимость вызывать правую панель после отправки отзыва
     */
    constructor(appName,
                server,
                rightPanel,
                routerInfo,
                callRightPanel = false) {

        this.starsId            = appName + '_rating';
        this.votedId            = appName + '_voted'
        this.reviewId           = appName + '_review_call'
        this.versionId          = appName + '_version'
        this.userNameId         = appName + '_user_name';
        this.userReviewId       = appName + '_user_review';
        this.userEmailId        = appName + '_user_email';
        this.reviewFormId       = appName + '_form_review';

        this.reviewContext      = null;

        this.stars              = null;
        this.appName            = appName;
        this.appVersion         = null;
        this.storageKey         = this.starsId;

        this.validator          = new FormDataValidator(this.reviewFormId);

        this.rightPanelShown   = callRightPanel;
        this.rightPanel        = rightPanel;


        this.routerInfo         = routerInfo;
        this.ratingServer       = server;

        // после отладки - закомментировать
        // this.clearRatingOnLocalStorage();
        this._initNotyDialogs();
        this._getRatingFromServer();

    }

    //
    // Создаем экземпляры динамических окон для установки рейтига
    //
    _initNotyDialogs(){

        const self = this;
        const themeNoty = 'bootstrap-v4';

        //  Сообщение, в случае, когда запрашиваем отзыв
        this.notyReview = new Noty({
            timeout: false,
            modal: true,
            killer: true,
            dismissQueue: true,
            layout: 'topCenter',
            closeWith: ['button'], // ['click', 'button', 'hover', 'backdrop']
            theme: themeNoty,
            type: 'confirm',
            buttons: [
                Noty.button('Отменить', 'btn btn-link mb-2', () => {
                    this.notyReview.close();
                    this._setRatingStars(this.rating);
                }),
                Noty.button('Отправить <i class="ph-paper-plane-tilt ms-2"></i>','btn btn-outline-secondary me-4 ms-2 me-2 mb-2', () => { self._pressOnSendButton();}),
            ],
            callbacks:{
                beforeShow: function() {
                    this.rightPanel.hide();
                    // rightPanelAct('hide', self.rightPanelShown);
                },
                afterShow: function () {
                    $('#' + self.userReviewId).focus();
                },
                afterClose: function() {
                    if(self.rightPanelShown) this.rightPanel.show();
                    // rightPanelAct('show', self.rightPanelShown);
                },
                onClose: function() {
                    // костыль, который позволяет показывать окно при повторных вызовах
                    this.showing = false;
                    this.shown = false;
                    $('.tooltip').remove();
                },
            }
        });
        // Сообщение в случае, если оценка уже была ранее поставлена
        this.notyCantToSet = new Noty({
            closeWith: ['click', 'backdrop', 'button'], // ['click', 'button', 'hover', 'backdrop']
            timeout: 5000,
            theme: themeNoty,
            type: 'error',
            modal: true,
            layout: 'topCenter',
            callbacks:{
                afterClose: function() {
                    // костыль, который позволяет показывать окно при повторных вызовах
                    this.showing = false;
                    this.shown = false;
                },
            }
        })
    }


    //
    // Создаем элемент <li> из звезд иконок
    //
    _createStarsRating() {

        let $li = $('li#' + this.starsId);
        const starCount = $li.find('i').length
        if (starCount === 0) {
            $li.removeClass('placeholder placeholder-wave bg-black bg-opacity-20 wmin-300');
            $('#' + this.votedId).removeClass('d-inline-block ')
            // Создание и добавление элементов <i> (звезд) внутрь <li>
            for (let i = 0; i < 10; i++) {
                $('<i>', {
                    class: 'ph-star fs-base lh-base align-top'
                }).prependTo($li);
            }
            this.stars = $(`#${this.starsId} .ph-star`)
            this.stars.on(              'mouseover', this.setStarRatingWhenClickOn.bind(this));
            this.stars.on(              'mouseout',  this._setRatingWhenHover.bind(this));
            this.stars.on(              'click',     this.showRatingForm.bind(this));
            $('#' + this.reviewId).on(  'click',     this.showReviewForm.bind(this));
        }
    }


    //
    // Установка звездочек при наведении на элемент мышью
    //
    _setRatingWhenHover() {
        // Установка рейтинга
        this._setRatingStars(this.rating)
    }

    _setRatingStars(rating){
        if(this.stars){
            this.stars.slice(0, rating).addClass('text-warning')
            this.stars.slice(rating, this.stars.length).removeClass('text-warning');
        }
    }

    //
    // Удаляем хранимый рейтинг на локальном хранилище
    //
    clearRatingOnLocalStorage(){
        localStorage.removeItem(this.storageKey)
    }


    //
    // Устанавливаем цвет звездочек иконок в зависимости
    // от того сколько звездочек выбрал мышью пользователь
    //
    setStarRatingWhenClickOn(e){
        let index = this.stars.index(e.target);
        this.stars.slice(0, index + 1).addClass('text-warning');
        this.stars.slice(index + 1, this.stars.length).removeClass('text-warning');
    }


    //
    // Получение рейтинга с сервера
    //
    _getRatingFromServer() {
        this._getLastVersionFromServer( () => {
            tryGetDataFromServer(this.ratingServer, 'get_rating', {
                app_name: this.appName, version: this.appVersion },
                (response)=> {
                    // Обработка результата ответа от сервера после получения рейтинга приложения
                    if (response.app_name === this.appName ) {
                        this.rating = response.rating;
                        $('#' + this.votedId).html('(' + response.voted + ')');
                        this.appVersion = response.version;
                        this._createStarsRating();
                        if (response.voted !== 0) {
                            this._setRatingWhenHover();
                        }
                    }
                }, `при запросе рейтинга ${this.appName}`);
        });
    }

    //
    // Получение крайней версии приложения с сервера
    //
    _getLastVersionFromServer(callback) {
        tryGetDataFromServer(this.ratingServer, 'get_last_version', {
                app_name: this.appName
            },
            (response)=> {
                const versionElem = $('#' + this.versionId);
                // Обработка результата ответа от сервера после получения рейтинга приложения
                // if (response.app_name === this.appName ) {
                this.appVersion = response[this.appName];
                versionElem.removeClass('placeholder placeholder-wave bg-black bg-opacity-20 wmin-300');
                versionElem.html('v.' + this.appVersion);
                callback(response);
                // }
            }, `при запросе крайней версии ${this.appName}`);
    }


    //
    // Отправляем отзыв на сервер
    //
    _pressOnSendButton(event){

        if (this.validator.validate()) {

            // const router_data = this.router.getDeviceInfo()
            // Если все поля прошли проверку, можно отправить форму
            // Вы можете добавить свой код здесь для отправки данных формы
            tryGetDataFromServer(this.ratingServer, 'new_record', {
                app_name    : this.appName,
                version     : this.appVersion,
                name        : $('#' + this.userNameId).val(),
                email       : $('#' + this.userEmailId).val(),
                review      : $('#' + this.userReviewId).val(),
                model       : this.routerInfo.model,
                device_id   : this.routerInfo.device_id,
                processor   : this.routerInfo.processor,
                type        : this.reviewContext,
                rating      : this.rating || 0,

            }, (response) => {
                this._whenSentReviewToServer(response);
            }, `при добавлении нового отзыва для ${this.appName}`);

        }
    }


    //
    // Обработка результата ответа от сервера после отправки отзыва пользователя
    //
    _whenSentReviewToServer(response) {
        // закрываем окно текущее
        this.notyReview.close();
        // обработка в случае успеха
        if (response.success) {
            localStorage.setItem(this.storageKey, this.rating);
            this._getRatingFromServer();
            showMessage(`Ваш отзыв на <b>${this.appName.toUpperCase()}</b> успешно <b>отправлен</b>.<br>Спасибо.`, MessageType.SUCCESS)
        } else {
            // Ошибка при отправке отзыва
            console.log(showError(response.description));
        }

    }

    //
    // Переписываем текст диалога и отображаем его на экране
    //
    _showForm(notyWindows, htmlForm) {

        notyWindows.setText(htmlForm, true);
        notyWindows.show();

    }


    //
    // Отображаем форму ТОЛЬКО для отзыва (без рейтинга)
    //
    showReviewForm() {

        console.log('Обработчик события click для #' + this.reviewId +' вызван');
        const reviewForm =
            '<form id="' + this.reviewFormId + '" novalidate>' +
                '<div class="ps-3 pb-1">' +
                    "<div class='d-flex flex-row align-items-baseline pt-2 '>" +
                        '<div class="fs-3 mb-3 text-primary me-2">Отзыв на ' + RusNames[this.appName] + '</div>' +
                        "<div class='badge bg-success bg-opacity-75 lift-up-3'>" + this.appVersion + "</div>" +
                    "</div>" +
                    '<div class="mb-2">Пишите по существу и самое главное</div>' +
            		'<textarea id="' + this.userReviewId + '" class="form-control  h-200px" placeholder="Суть Вашего предложения или замечений." data-min-length="6" data-bs-popup="tooltip" data-bs-placement="right" ></textarea>' +
            		'<div style="display: flex;" class="pt-1 input-group" >' +
            			'</span><input id="' + this.userNameId + '" type="text" class="form-control" placeholder="Ваше имя" data-min-length="3" data-bs-popup="tooltip" data-bs-placement="left" >' +
            			'</span><input id="' + this.userEmailId + '" type="email" class="form-control" placeholder="Ваш Email" data-validate-email="email" data-bs-popup="tooltip" data-bs-placement="right" >' +
            		'</div>' +
            	'</div>' +
            "</form>";
        this.reviewContext = ReviewContext.REVIEW_ONLY
        this._showForm(this.notyReview, reviewForm);

    }


    //
    // Отображаем форму для заполнения отзыва вместе с рейтингом
    //
    showRatingForm(){
        const sRating = localStorage.getItem(this.storageKey)
        if (sRating) {
            // если оценка уже была, то просто уведомляем об этом
            const reviewForm =
                "<div class='ps-3 pe-3 pb-3'>" +
                    "<div class='d-flex flex-row align-items-baseline pt-2 pb-2 border-bottom '>" +
                        "<div class='me-1 fs-4 fw-semibold'>" + RusNames[this.appName]  + "</div>" +
                        "<div class='badge bg-success bg-opacity-75 lift-up-3'>" + this.appVersion  + "</div>" +
                    "</div>" +
                    "<div class='fs-4 text-primary fw-semibold pt-2 pb-1'> Ваша оценка - " +  sRating + "/" + this.stars.length + "</div>" +
                    "<span class='pb-2'>Поставить оценку повторно можно, лишь для следующей версии приложения.</span>" +
                "</div>";
            this.reviewContext = ReviewContext.RATING;
            this._showForm(this.notyCantToSet, reviewForm);

        } else {
            const rating = $('#' + this.starsId + ' .text-warning').length;
            const reviewForm =
                '<form id="' + this.reviewFormId + '" novalidate>' +
                	'<div class="pt-3 ps-3 pe-1 pb-1">' +
                		'<h4 class="mb-3">Спасибо за Вашу оценку ('+ rating + '/' + this.stars.length + ')</h4>' +
                        '<label class="form-label ms-1">Будем признательны за обратную связь</label> ' +
                        '<textarea id="' + this.userReviewId + '" class="form-control  h-200px" placeholder="Суть Вашего предложения или замечений." data-min-length="6" data-bs-popup="tooltip" data-bs-placement="right" ></textarea>' +
                        '<div style="display: flex;" class="pt-1 input-group" >' +
                            '</span><input id="' + this.userNameId + '" type="text" class="form-control" placeholder="Ваше имя" data-min-length="3" data-bs-popup="tooltip" data-bs-placement="left" >' +
                            '</span><input id="' + this.userEmailId + '" type="email" class="form-control" placeholder="Ваш Email" data-validate-email="email" data-bs-popup="tooltip" data-bs-placement="right" >' +
                		'</div>' +
                	'</div>' +
                "</form>";
            this.reviewContext = ReviewContext.REVIEW_WITH_RATING;
            this._showForm(this.notyReview, reviewForm, ReviewContext.REVIEW_WITH_RATING);
        }

    }
}


const SpinnerType = {
    SIMPLE: 'ph-spinner spinner me-2',
    BORDER: 'spinner-border',
    GROW:   'spinner-grow',
}
/**
 * Класс для отображения спиннера.
 */
class Spinner {
    /**
     * Создает новый объект Spinner.
     */
    constructor(type = SpinnerType.SIMPLE) {
        this.type = type;
        this._modalClass = 'modal-open';
        this.$spinnerElement = $(`.page-content .content-wrapper .content-inner .content`);
    }
    /**
     * Запускает отображение спинера.
     * @param {string} [loadingText='Ждите идет загрузка…'] - Текст, отображаемый рядом со спинером.
     */

    start(loadingText = 'Ждите идет загрузка…'){
        const $spinnerText = $(`<strong>`).text(loadingText);
        const $spinnerContainer = $(`<div>`).addClass(`d-flex justify-content-center align-items-center`);
        const $subContainer = $(`<i>`).addClass(`${this.type}`);
        $spinnerContainer.append($subContainer);
        $spinnerContainer.append($spinnerText);
        this.$spinnerElement.append($spinnerContainer);
        this._disableScreen();
    }

    stop(){
        this.$spinnerElement.empty();
        this._enableScreen();
    }
    /**
     * Заблокировать элементы экрана.
     */
    _disableScreen() {
        // Блокировка элементов экрана
        this.$spinnerElement.addClass(this._modalClass);
    }

    /**
     * Разблокировать элементы экрана.
     */
    _enableScreen() {
        // Разблокировка элементов экрана
        this.$spinnerElement.removeClass(this._modalClass);
    }
}

/**
 * Класс для отображения прогресс-бара.
 */
class ProgressBar {
    /**
     * Создает новый объект ProgressBar.
     * @param {string} elementId - Идентификатор элемента, в котором будет отображаться прогресс-бар.
     * @param {number} [length] - Полная длина прогресс-бара.
     */
    constructor(elementId, length = 10) {
        this.length = length;
        this.$progressBarElement = $(`#${elementId}`);
        this._step = -1;
    }
    /**
     * Запускает отображение прогресс-бара.
     */
    start() {
        const progbar = $(`<div>`).addClass('progress-bar').css('width', 0);
        this.$progressBarElement.append(progbar);
    }

    /**
     * Обновляет прогресс прогресс-бара.
     * @param {number} step - Текущий шаг.
     */
    next(step= 1) {
        if (this._step <= this.length || this._step >= 0){
            this._step += step;
            this._step = this._step > this.length ? this.length : this._step;
            const percentComplete = (this._step / this.length) * 100;
            const progressBar = this.$progressBarElement.find('.progress-bar');
            progressBar.width(`${percentComplete}%`);

        }
    }

    /**
     * Завершает отображение прогресс-бара.
     */
    stop() {
        const progressBar = this.$progressBarElement.find('.progress-bar');
        progressBar.width('100%');
        this._step = -1;
    }


}