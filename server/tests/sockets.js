// Создание WebSocket-соединения
// const socket = io("http://api.zeleza.ru:61116/socket.io/?EIO=4&transport=websocket");
const socket = io("wss://api.zeleza.ru:63331/");

// Обработчик события при установке соединения
socket.on('connect', () => {
    console.log('Подключились к серверу');
});

// Обработчик события при ошибке
socket.on('error', (error) => {
    console.log('Произошла ошибка:', error);
    const errorElement = $("<div>").addClass("alert alert-danger").text("Ошибка: \n" + error);

    // Добавление элемента в контейнер с ответами
    $("#responseContainer").append(errorElement);

});

$(window).on('error', function(e) {
    console.log('Произошла ошибка:', e);
    const errorElement = $("<div>").addClass("alert alert-danger").text("Ошибка: \n" + e);

    // Добавление элемента в контейнер с ответами
    $("#responseContainer").append(errorElement);

});
// Обработчик события при разрыве соединения
socket.on('disconnect', () => {
    console.log('Отключились от сервера');
});

// Обработчик события 'welcome' - приветственное сообщение от сервера
socket.on('welcome', (data) => {
    console.log(data.description);
    displayResponse(data.description);
});

// Обработчик события 'get_rating_response'
socket.on('get_rating_response', (response) => {
    displayResponse(response);
});

// Обработчик события 'new_record_response'
socket.on('new_record_response', (response) => {
    displayResponse(response);
});

// Обработчик события 'reviews_list_response'
socket.on('reviews_list_response', (response) => {
    displayResponse(response);
});

$(document).ready(function() {
    // Задаем значения по умолчанию для каждого типа сообщения
    let defaultData = {
        get_rating: '{"app_name": "samovar"}',
        new_record: '{' +
            '"app_name": "kvas",' +
            '"version":"latest",' +
            '"name": "WebSocket",' +
            '"email":"ws@email.ws",' +
            '"review":"Тестовый отзыв: программа отличная так держать!",' +
            '"rating":"9"' +
            '}',
        reviews_list: '{ "app_name": "samovar"}'
    };

        let msgType = $("#messageType");

        function setDef() {
            msgType.val("reviews_list").trigger('change');
        }

        // Установка значения по умолчанию при выборе типа сообщения
        msgType.on("change", function() {
            const messageType = $(this).val();
            const defaultText = defaultData[messageType];
            $("#messageData").val(defaultText);
        });

        setDef();


    // Обработчик отправки формы
    $("#sendButton").on("click", function() {
        const messageType = msgType.val();
        let messageData = $("#messageData").val();

        // Очистка контейнера с предыдущими ответами
        $("#responseContainer").empty();

        // Проверка наличия данных в поле сообщения для отправки
        if (!messageData) {
            alert("Пожалуйста, введите сообщение для отправки.");
            return;
        }
        // Преобразование данных в JSON-строку
        try {
            messageData = JSON.parse(messageData);
        } catch (error) {
            alert("Ошибка при разборе JSON: " + error.message);
            return;
        }

        // Отправка сообщения на сервер
        socket.emit(messageType, messageData);
    });
});

// Функция для отображения ответов от сервера
function displayResponse(response) {
    const responseContainer = $("#responseContainer");

    // Создание элемента для отображения ответа
    const responseElement = $("<div>").addClass("alert alert-primary").text(JSON.stringify(response));
    // Добавление элемента в контейнер с ответами
    responseContainer.append(responseElement);
    // alert(response.error)
}