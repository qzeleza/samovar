const PROD_ROUTER_URL = window.location.href;
const TEST_ROUTER_URL = "kvas.zeleza.ru";

const TEST_STAGE = true

let ROUTER_URL = TEST_STAGE ? TEST_ROUTER_URL : PROD_ROUTER_URL


class DeviceManager {
    constructor() {
        this.server = new NetworkRequestManager(ROUTER_URL, 11133, '/kvas/v1');
        this.router_info = null;
    }

    // Получаем данные об обновлении (если есть) для запрошенного приложения
    getAppUpdateInfo(app_name, callback) {
        this.server.send('update', {"app_name": app_name}, (response) => {
            callback(response);
        });
    }


    // Получаем данные, которые позволяют определить модель устройства
    getDeviceDataID(callback) {

        if (this.router_info) {
            return this.router_info;
        } else {
            const self = this;
            this.server.send('get_router_data', {}, (response) => {
                self.router_info = response;
                callback(response);
            });
        }

    }
}