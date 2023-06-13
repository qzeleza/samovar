//
//#include <unordered_map>
//
//const std::int16_t no_page_code         = 404;
//const std::int16_t page_ok_code         = 200;
////const std::string  no_page_text         = "File not found";
////const std::string  text_content_type    = "text/plain";
//
////file_response_resource::file_response_resource(const std::string root_path): _root_path(root_path) {};
//
//const std::shared_ptr<httpserver::http_response> file_response_resource::render_GET(const httpserver::http_request& request) {
//
//    const char slash = '/';
//    std::string full_path = std::string(request.get_arg(1));
//    std::string url_path = std::string(request.get_path());
//    std::string url_root = request.get_path_piece(1);
//    url_root.erase(std::remove(url_root.begin(), url_root.end(), slash), url_root.end());
//
//    for (const auto& path: _static_paths) {
//        if (path.find(url_root) != std::string::npos) {
//            full_path = _root_path + slash + url_path + "/found";
//        } else {
//            full_path = _root_path + "/NOT/found";
//        }
//    }
//
//    std::string mess = "Full_path is '" + full_path + "'";
//    std::cout << "Full_path is '" + full_path + "'" << std::endl;
//    httpserver::string_response* res = new httpserver::string_response(mess, page_ok_code, "text/plain");
//
////    httpserver::file_response* res = new httpserver::file_response(full_path,
////                                                                   page_ok_code,
////                                                                   text_content_type);
//    return std::shared_ptr<httpserver::http_response>(res);
//}
//
//void file_response_resource::add_static_path(std::string& path){
//            _static_paths.push_back(path);
//}
//
//
//Server::Server(const std::string& root_path, int port): _file_resp(root_path),
//                _webserver(httpserver::create_webserver(port)
//                    .not_found_resource(not_found_custom)
//                    .method_not_allowed_resource(not_allowed_custom)){
//    _file_resp.disallow_all();
//    _file_resp.set_allowing("GET", true);
//}
//
//void Server::add_static_path(std::string &path)
//{
//    _file_resp.add_static_path(path);
//    _webserver.register_resource(path, &_file_resp);
//}
//
//void Server::start()
//{
//
////    kvas_api api;
////    api.disallow_all();
////    api.set_allowing("POST", true);
////    _webserver.register_resource("/hello", &api);
//    _webserver.register_resource("/", &_file_resp);
//    _webserver.start(true);
//}
//
////#include <iostream>
////#include <httpserver.hpp>
////#include <map>
////
////class StaticServer : public httpserver::http_resource {
//// public:
////     std::map<std::string, std::string> mime_types;
////     std::string root_folder;
////
////     StaticServer(std::string root) {
////         root_folder = root;
////         mime_types = {
////             {".js", "application/javascript"},
////             {".css", "text/css"},
////             {".mpeg", "video/mpeg"},
////             {".jpeg", "image/jpeg"},
////             {".jpg", "image/jpeg"},
////             {".png", "image/png"},
////             {".svg", "image/svg+xml"}
////         };
////     }
////
////     std::shared_ptr<httpserver::http_response> render(const httpserver::http_request& req) {
////         std::string filename = root_folder + req.get_path();
////         std::string extension = filename.substr(filename.find_last_of("."));
////
////         std::shared_ptr<httpserver::file_response> file_res = std::make_shared<httpserver::file_response>(filename);
////         file_res->set_mime_type(mime_types[extension]);
////
////         return file_res;
////     }
////};
////
////class Server {
//// public:
////     httpserver::webserver ws;
////     std::string root_folder;
////     int port;
////
////     Server(std::string root, int p) {
////         root_folder = root;
////         port = p;
////         ws = httpserver::create_webserver(port);
////     }
////
////     void start() {
////         StaticServer assets(root_folder + "/asserts");
////         StaticServer data(root_folder + "/wui/data");
////         assets.disallow_all();
////         assets.set_allowing("GET", true);
////         data.disallow_all();
////         data.set_allowing("GET", true);
////         ws.register_resource("/asserts", &assets);
////         ws.register_resource("/wui/data", &data);
////         ws.start(true);
////     }
////};
////
////int main() {
////    Server server("/opt/var/www", 8080);
////    server.start();
////
////    return 0;
////}
