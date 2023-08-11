const PROD_ROUTER_URL = window.location.href;
const TEST_ROUTER_URL = "kvas.zeleza.ru";

const TEST_STAGE = true

let ROUTER_URL = TEST_STAGE ? TEST_ROUTER_URL : PROD_ROUTER_URL


class DeviceManager {
    constructor(server) {
        this.server = server
        this.info = null;
    }

    // Получаем данные об обновлении (если есть) для запрошенного приложения
    getAppUpdateInfo(app_name, callback) {
        tryGetDataFromServer(this.server, 'update', {"app_name": app_name}, (response) => {
            this.info = response;
            callback(response);
        }, `при запросе обновления ${app_name}`);
    }


    // Получаем данные, которые позволяют определить модель устройства
    getDeviceInfo(callback) {

        if (this.info) {
            return this.info;
        } else {
            tryGetDataFromServer(this.server, 'get_router_data', {}, (response) => {
                this.info = response;
                callback(response);
            }, "при запросе информации о роутере пользователя");
        }

    }
}