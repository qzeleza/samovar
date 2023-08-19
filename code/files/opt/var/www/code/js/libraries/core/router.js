const PROD_ROUTER_URL = window.location.href;
const TEST_ROUTER_URL = "kvas.zeleza.ru";

const TEST_STAGE = true

let ROUTER_URL = TEST_STAGE ? TEST_ROUTER_URL : PROD_ROUTER_URL


class DeviceManager {
    constructor(server) {
        this.server = server
        this.info = [];
    }

    // Получаем данные об обновлении (если есть) для запрошенного приложения
    getAppUpdateInfo(app_name, callback) {
        tryGetDataFromServer(this.server, 'update', {"app_name": app_name}, (response) => {
            callback(response);
        }, `при запросе обновления ${app_name}`);
    }


    // Получаем данные, которые позволяют определить модель устройства
    getDeviceInfo(callback) {
        const key = 'get_router_data';
        if (this.info && key in this.info) {
            return this.info[key];
        } else {
            tryGetDataFromServer(this.server, 'get_router_data', {}, (response) => {
                this.info[key] = response;
                callback(response);
            }, "при запросе информации о роутере пользователя");
        }

    }
}