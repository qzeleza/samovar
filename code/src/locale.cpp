#ifndef SAMOVAR_SYSTEM_HPP
#include "includes/system.hpp"
#endif

#include <stdexcept>


bool setLocale(language lang) {
    bool success = true;
    str current_lang = "ru_RU.UTF-8";

    if (lang == ENGLISH) {
        #if defined(__APPLE__)
            current_lang = "en_US.UTF-8";
        #else
            current_lang = "en_EN.UTF-8";
        #endif
    }
    const char* current_locale = setlocale(LC_ALL, current_lang.c_str());

    if (current_locale == nullptr) {

        printMessage(zb("Ошибка при установке языка '%s'"), current_lang);
        success = false;
    } else {
        printMessage(zb("'%s' установлен языком по умолчанию."), current_lang);
    }

    return success;
}

void initLocale(const str& domain, language lang){

    const str locale_path = "./locale";
    try {
        if (setLocale(lang)) {
            bindtextdomain(domain.c_str(), locale_path.c_str());
            textdomain(domain.c_str());
        }
    } catch (const std::exception& e) {
        std::cerr << e.what() << std::endl;
    }

}