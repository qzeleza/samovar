#include <iostream>
#include <httpserver.hpp>
#include <vector>
#include <string>

#ifndef SAMOVAR_LOCALE_HPP
#include "locale.hpp"
#endif

class file_response_resource: public httpserver::http_resource {

    public:

        file_response_resource(const std::string root_path);
        ~file_response_resource() {};

        const std::shared_ptr<httpserver::http_response> render_GET(const httpserver::http_request& request);
        void add_static_path(std::string& path);

    private:

        const std::string _root_path;
        std::vector<std::string> _static_paths;
};

class Server {

    public:

        Server(const std::string& root_path, int port);
        ~Server() {};

        void start();
        void add_static_path(std::string& path);

    private:

        httpserver::webserver _webserver;
        file_response_resource _file_resp;
};
