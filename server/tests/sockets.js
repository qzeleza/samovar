// sockets.js
const serverSamovar = "wss://api.zeleza.ru:11211";
const serverKvas = "wss://router.zeleza.ru:11133";
let socket = null;

$(document).ready(function() {
    const messageData = $("#messageData");
    const serverType = $("#serverType");
    const messageType = $("#messageType");
    const sendButton = $("#sendButton");
    const responseContainer = $("#responseContainer");

    // Переменная defaultData с данными для каждого типа сообщения
    const defaultData = {
        samovar: [
            {
                value: "get_rating",
                text: "Получить рейтинг приложения",
                default: '{"app_name": "CAMOBAP"}',
            },
            {
                value: "new_record",
                text: "Добавить новую запись",
                default: '{' +
                    '"app_name": "kvas",' +
                    '"version":"latest",' +
                    '"name": "WebSocket",' +
                    '"email":"ws@email.ws",' +
                    '"reviewElem":"Тестовый отзыв: программа отличная так держать!",' +
                    '"rating":"9",' +
                    '"type": "Отзыв с рейтингом",' +
                    '"device_id":"42csr4rc435v34v2c5tc2",' +
                    '"processor": "mipsel",' +
                    '"model": "Ultra KN-3118"' +
                    '}',
            },
            {
                value: "reviews_list",
                text: "Получить список всех отзывов",
                default: '{"app_name": "CAMOBAP"}'
            },
            {
                value: "get_last_version",
                text: "Получить крайнюю версию приложения",
                default: '{"app_name": "CAMOBAP"}'
            }
        ],
        kvas: [
            {
                value: "update",
                text: "Обновление",
                default: '{"app_name": "kvas"}'
            },
            {
                value: "get_router_data",
                text: "Получить данные роутера",
                default: '{}'
            },
            {
                value: "get_apps_data",
                text: "Получить данные приложений",
                default: '{}'
            },
        ]
    };

    function call_kvas_socket_handlers(){

        // Обработчик события 'new_record_response'
        socket.on('update_response', (response) => {
            displayResponse(response);
        });

        // Обработчик события 'new_record_response'
        socket.on('get_router_data_response', (response) => {
            displayResponse(response);
        });

        // Обработчик события 'new_record_response'
        socket.on('get_apps_data_response', (response) => {
            displayResponse(response);
        });
    }
    function call_samovar_socket_handlers(){

                // Обработчик события 'get_rating_response'
        socket.on('get_rating_response', (response) => {
            displayResponse(response);
        });

        // Обработчик события 'new_record_response'
        socket.on('new_record_response', (response) => {
            displayResponse(response);
        });

        // Обработчик события 'new_record_response'
        socket.on('get_last_version_response', (response) => {
            displayResponse(response);
        });

        // Обработчик события 'reviews_list_response'
        socket.on('reviews_list_response', (response) => {
            displayResponse(response);
        });



    }

    function displayResponse(response) {
        // Очистка контейнера с предыдущими ответами
        responseContainer.empty();
        // Создание элемента для отображения ответа
        const responseElement = $("<div>").addClass("alert alert-primary").text(JSON.stringify(response));
        // Добавление элемента в контейнер с ответами
        responseContainer.append(responseElement);
        // alert(response.error)
    }


    // Функция для получения значения "default" по значению "value" и типу сервера
    function getDefaultData(serverType, value) {
        const serverData = defaultData[serverType];
        const foundItem = serverData.find(item => item.value === value);
        return foundItem ? foundItem.default : null;
    }

    // Функция для изменения содержимого элемента messageType в зависимости от выбранного сервера
    function updateMessageTypeOptions() {
        const selectedServerType = serverType.val();
        const messageOptions = defaultData[selectedServerType];
        const optionsHtml = messageOptions.map(option => `<option value="${option.value}">${option.text}</option>`).join('');
        messageType.html(optionsHtml);
    }

    function displayError(error) {
        console.log('Произошла ошибка:', error);
        const errorElement = $("<div>").addClass("alert alert-danger").text("Ошибка: \n" + error);
        responseContainer.empty();
        // Добавление элемента в контейнер с ответами
        responseContainer.append(errorElement);
    }
    function connectToServer(selectedServerType) {

        if (selectedServerType === "samovar") {
            messageType.val("get_rating").trigger('change');
            // Удаляем предыдущие обработчики событий
            if (socket) {
                socket.disconnect();
                socket.removeAllListeners();
            }
            // Изменение адреса и порта для сервера "CAMOBAP"
            socket = io(serverSamovar);
        } else if (selectedServerType === "kvas") {
            messageType.val("update").trigger('change');
            // Удаляем предыдущие обработчики событий
            if (socket) {
                socket.disconnect();
                socket.removeAllListeners();
            }
            // Изменение адреса и порта для сервера "kvas"
            socket = io(serverKvas);
        }

        // Обработчик события при установке соединения
        socket.on('connect', () => {
            console.log('Подключились к серверу');
        });

            // Обработчик события при ошибке
        socket.on('error', (error) => {
            displayError(error)
        });

        // В скрипте обновим обработчик события 'wrong_message_response'
        socket.on('wrong_message_response', (response) => {
            displayError(response.message)
        });

        // Обработчик события при разрыве соединения
        socket.on('disconnect', (data) => {
            console.log('Отключились от сервера');
            displayResponse(data.description);
        });

        socket.on('goodbye', (data) => {
            console.log(data.description);
            displayResponse(data.description);
        });

        // Обработчик события 'welcome' - приветственное сообщение от сервера
        socket.on('welcome', (data) => {
            console.log(data.description);
            displayResponse(data.description);
        });

        call_samovar_socket_handlers();
        call_kvas_socket_handlers();

        // Обработчик отправки формы
        sendButton.on("click", function() {
            let data = null;
            // Очистка контейнера с предыдущими ответами
            responseContainer.empty();

            // Проверка наличия данных в поле сообщения для отправки
            if (!messageData.val()) {
                alert("Пожалуйста, введите сообщение для отправки.");
                return;
            }
            // Преобразование данных в JSON-строку
            try {
                data = JSON.parse(messageData.val());
            } catch (error) {
                alert("Ошибка при разборе JSON: " + error.message);
                return;
            }

            // Отправка сообщения на сервер
            socket.emit(messageType.val(), data);
        });
    }

    // Обработчик выбора типа сервера
    serverType.on("change", function() {
        updateMessageTypeOptions();
        const selectedServerType = $(this).val();
        connectToServer(selectedServerType);
        sendButton.trigger("click");
    });

    messageType.on("change", function() {
        const defaultValue = getDefaultData(serverType.val(), $(this).val());
        messageData.val(defaultValue);
        sendButton.trigger("click");
    });

    // Установка значений по умолчанию
    serverType.val("kvas").trigger("change"); // Задаем "kvas" как значение по умолчанию для сервера
});
