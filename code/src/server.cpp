#ifndef SAMOVAR_API_HPP
#include "includes/api.hpp"
#endif
#ifndef MAC_SAMOVAR_CODES_HPP
#include "includes/codes.hpp"
#endif
#ifndef SAMOVAR_SYSTEM_HPP
#include "includes/system.hpp"
#endif

const std::string METHOD_TYPE_DEFAULT = "POST";
const std::string API_PATH_DEFAULT = "/api/v2";

ServerAPI::ServerAPI(std::uint16_t port): _server(httpserver::create_webserver(port)
                                                          .log_access(api_access_log)
                                                          .log_error(api_error_log)
                                                          .not_found_resource(api_not_found)
                                                          .method_not_allowed_resource(api_not_allowed)
                                                          .internal_error_resource(api_internal_error)) {

    _api.disallow_all();
    _api.set_allowing(METHOD_TYPE_DEFAULT, true);
    _server.register_resource(API_PATH_DEFAULT, &_api, true);

}

size_t ServerAPI::start(){

    size_t result = SERVER_ALREADY_RUN;

    if (!_server.is_running()) {
        printMessage(zb("Запускаем API сервер..."));
        if (!_server.start(true)){
            result = SERVER_RUNNING_ERROR;
        }
        if (!_server.is_running()) {
            result = SERVER_STOPPED;
        }

    }
    printMessage(zb("API сервер успешно запущен."));
    return result;
}

size_t ServerAPI::stop(){

    size_t result = SERVER_NOT_RUNNING;

    if (_server.is_running()) {
        if (_server.stop()) {
            result = SERVER_STOPPED;
        } else {
            result = SERVER_STOPPING_ERROR;
        }
    }

    printMessage(zb("API сервер успешно остановлен."));
    return result;
}
