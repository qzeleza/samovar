
class ExtensionsManager {
    constructor() {
        this.server = new NetworkRequestManager("api.zeleza.ru", 11211, '/api/v1')
        this.lastVersion = {};
    }
    getLastVersion(app_name, force = false, callback = function() {}) {

        // если ранее версия не была получена
        // и не надо получать рейтинг с сервера
        let result = this.lastVersion[app_name];

        // если настаиваем на получении рейтинга с сервера
        // или крайняя версия приложения не была получена с сервера
        if (force || ! (result)) {
            tryGetDataFromServer(this.server, 'get_last_version', {app_name: app_name}, (response)=> {
                // добавили в словарь новую версию приложения или обновили его
                result = this.lastVersion[app_name] = response[app_name];
                callback(response);

            }, `при получении крайней версии ${app_name}`);
        }

        return result;
    }
}

