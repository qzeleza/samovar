class ReviewsManager {
    constructor() {
        this.server = new NetworkRequestManager("api.zeleza.ru", 11211, '/api/v1')
    }
    getLastVersion(app_name, callback) {
        let last_version;
        this.server.send('get_last_version', {
            app_name: app_name

        }, (response) => {
            last_version = response;
            callback(response);
        });
        return last_version;
    }
    getRating(app_name, version, callback){

        this.server.send('get_rating', {
            app_name: app_name,
            version: version

        }, (response) => {
            callback(response);
        });
    }
    addNewReview(app_name, version, name, email, review, type, rating, callback){
        this.server.send('new_record', {
            app_name: app_name,
            version     : version,
            name        : name,
            email       : email,
            review      : review,
            model       : ROUTER_INFO.model,
            device_id   : ROUTER_INFO.device_id,
            processor   : ROUTER_INFO.processor,
            type        : type,
            rating      : rating || 0,

        }, (response) => {
            callback(response);
        });
    }
}

