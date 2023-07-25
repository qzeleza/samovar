const PROD_ROUTER_URL = window.location.href;
const TEST_ROUTER_URL = "kvas.zeleza.ru";

const TEST_STAGE = true

let ROUTER_URL = TEST_STAGE ? TEST_ROUTER_URL : PROD_ROUTER_URL


class DeviceManager {
    constructor() {
        this.server = new NetworkRequestManager(ROUTER_URL, 11133, '/kvas/v1');

        let ip_id = ROUTER_URL.match(/\d+/g);
        ip_id = ip_id === null ? "" : ip_id.join('_')

        this.modelKey = 'modelKey_' + ip_id;
        this.routerIdKey = 'routerIdKey_' + ip_id;
        this.processorKey = 'processorKey_' + ip_id;
    }

    // Получаем данные, которые позволяют определить модель устройства
    getDeviceDataID() {

        const routerId = localStorage.getItem(this.routerIdKey);

        if (routerId) {
            return {
                'device_id': routerId,
                'model': localStorage.getItem(this.modelKey),
                'processor': localStorage.getItem(this.processorKey),
            }
        } else {
            const self = this;
            let model, processor, device_id = null
            this.server.send('get_router_data', {}, (response) => {
                if (response.success) {
                    localStorage.setItem(self.modelKey, response.model);
                    localStorage.setItem(self.processorKey, response.processor);
                    localStorage.setItem(self.routerIdKey, response.device_id);

                    model = response.model;
                    processor = response.processor;
                    device_id = response.device_id;

                } else {
                    console.log('Ошибка получения данных с роутера ' + ROUTER_URL)
                }

            });
            return {
                'device_id': device_id,
                'model': model,
                'processor': processor,
            }
        }

    }
}