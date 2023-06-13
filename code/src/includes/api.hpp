//
// Created by master on 31.01.2023.
//

#ifndef SAMOVAR_API_HPP
#define SAMOVAR_API_HPP

#ifndef _HTTPSERVER_HPP_
#include <httpserver.hpp>
#endif

#ifndef INCLUDE_NLOHMANN_JSON_HPP_
#include "json.hpp"
#endif

using json = nlohmann::json;
using namespace httpserver;


std::string get_line(int num_chars = 100, char c = '-');

// Функции ручной обработки ошибок
void api_access_log(const std::string& url);
void api_error_log(const std::string& url);
const std::shared_ptr<http_response> api_not_found(const http_request&);
const std::shared_ptr<http_response> api_not_allowed(const http_request& req);
const std::shared_ptr<http_response> api_internal_error(const http_request& req);

class RestAPI : public http_resource {

public:
    //  Функции обработки API запросов
    const std::shared_ptr<http_response> render_POST(const http_request&) override;

private:
    json content_types;
};

class ServerAPI {

public:

    explicit ServerAPI(std::uint16_t port);

    size_t start();
    size_t stop();

private:
    httpserver::webserver _server;
    RestAPI _api;
};
#endif