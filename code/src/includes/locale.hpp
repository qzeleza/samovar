//
// Created by master on 10.02.2023.
//
#ifndef SAMOVAR_LOCALE_HPP
#define SAMOVAR_LOCALE_HPP

#ifndef _LIBCPP_IOSTREAM
#include <iostream>
#endif
#ifndef _LIBINTL_H
#include <libintl.h>
#endif
//#include <clocale>

enum language {
    RUSSIAN,
    ENGLISH,
};

typedef std::string str;
inline str zb(const str& text) { return {gettext(text.c_str())};}
bool setLocale(language lang = RUSSIAN);
void initLocale(const str& domain, language lang = RUSSIAN);

#endif //SAMOVAR_LOCALE_HPP
