//
// Created by master on 31.01.2023.
#ifndef _LIBCPP_MEMORY
#include <memory>
#endif

#ifndef SAMOVAR_API_HPP
#include "includes/api.hpp"
#endif

#ifndef SAMOVAR_SYSTEM_HPP
#include "includes/system.hpp"
#endif

const str text_context_type = "text/plain";

str get_line(int num_chars, char c ){
    return {static_cast<char>(num_chars), c};
}

const std::shared_ptr<httpserver::http_response> RestAPI::render_POST(const httpserver::http_request& request) {

    str content = std::string(request.get_content());
    json data = json::parse(request.get_content());

    data["field1"] = zb("POST запрос успешно принят.");
    std::cout << "content: " << content << std::endl;

    auto response = std::shared_ptr<httpserver::http_response>(new httpserver::string_response(data.dump(), 200));

    response->with_header("Access-Control-Allow-Origin", "*");
    response->with_header("Access-Control-Allow-Methods", "POST");
    response->with_header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
    response->with_header("Access-Control-Max-Age", "86400");
    response->with_header("Content-Type", "application/json");

    return response;
}

void api_access_log(const std::string& url) {
    printMessage(zb("ЗАПРОС: %s"), url);
}

void api_error_log(const std::string& url) {
    printMessage(zb("ОШИБКА В ЗАПРОСЕ: %s"), url);
}

const std::shared_ptr<httpserver::http_response> api_not_found(const httpserver::http_request& req) {

    int error_code = 404;

    str error_mess = printMessage(zb("Запрос '%s' не распознан!"), req.get_path());
    return std::make_shared<httpserver::string_response>(error_mess, error_code, text_context_type);
}

const std::shared_ptr<http_response> api_not_allowed(const http_request& req) {

    int error_code = 405;
    str error_mess;

    str method = req.get_method();
    str content = req.get_content();
    str line = get_line();

    auto headers = req.get_headers();
    for (auto & header : headers) {
        error_mess += "\n" + header.first + ": " + header.second;
    }
    str err_mess = printMessage(zb("Запрос не разрешен:\n%s\nИспользуемый метод: %s\nТело запроса: %s\n%s\n%s\n$s"), line, method, content, line, error_mess, line );

    return std::make_shared<string_response>(err_mess, error_code, text_context_type);
}

const std::shared_ptr<http_response> api_internal_error(const http_request& ) {

    size_t error_code = 500;
    str error_mess = printMessage(zb("Запрос '%s' НЕ распознан!"), error_code);

    return std::make_shared<string_response>(error_mess, error_code, text_context_type);
}

