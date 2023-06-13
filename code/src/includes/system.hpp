//
// Created by master on 07.02.2023.
//
#ifndef SAMOVAR_SYSTEM_HPP
#define SAMOVAR_SYSTEM_HPP

#ifndef SAMOVAR_LOCALE_HPP
#include "locale.hpp"
#endif

#ifndef _PWD_H_
#include <pwd.h>
#endif

#include <iostream>
#include <type_traits>
#include <stdexcept>
#include <regex>
#include <fstream>
#include <sstream>

template<typename T>
typename std::enable_if<std::is_same<typename std::decay<T>::type, std::string>::value, std::string>::type
to_string(T&& t) {
    return std::forward<T>(t);
}

template<typename T>
typename std::enable_if<std::is_same<typename std::decay<T>::type, const char*>::value, std::string>::type
to_string(T&& t) {
    return std::string(std::forward<T>(t));
}

template<typename T>
typename std::enable_if<std::is_error_code_enum<typename std::decay<T>::type>::value, std::string>::type
to_string(T&& t) {
    return std::error_code(static_cast<int>(std::forward<T>(t)), std::generic_category()).message();
}

template<typename T>
typename std::enable_if<std::is_arithmetic<typename std::decay<T>::type>::value, std::string>::type
to_string(T&& t) {
    return std::to_string(std::forward<T>(t));
}

// Функция принимает строку формата и список аргументов для замены шаблонов %s в строке формата.
template<typename... Args>
std::string printMessage(const std::string& format, Args&&... args) {

    // слово-триггер, при котором сообщение будет выводится в cerr
    const std::string err_trigger = "ошибка";

    const size_t num_args = sizeof...(args);

    // производим подсчет числа шаблонов замен в строке format;
    std::regex placeholder_regex("%s");
    const auto num_placeholders = static_cast<size_t>(std::distance(
        std::sregex_iterator(format.begin(), format.end(), placeholder_regex),
        std::sregex_iterator()
    ));
    if (num_placeholders == 0) {
        if ( num_args > 0) {
            throw std::invalid_argument("В строке отсутствуют шаблоны для переданных аргументов.");
        }
    } else if (num_args != num_placeholders) {
        throw std::invalid_argument("Количество шаблонов '%s' в строке не совпадает с числом переданных аргументов");
    }

    std::string result = format;
    size_t arg_count = 0;

//    std::initializer_list<std::string> loop_range = {std::forward<Args>(args)... };
    std::initializer_list<std::string> loop_range = { to_string(std::forward<Args>(args))... };


    for (const auto& arg : loop_range) {
        std::regex replace_regex("\\%s");
        result = std::regex_replace(result, replace_regex, arg, std::regex_constants::format_first_only);
        ++arg_count;
        if (arg_count >= num_args) {
            break;
        }
    }

    std::ofstream output_file("output.log");
    std::ostringstream output_stream;
    output_stream << result;
    output_file << output_stream.str();
    output_file.close();

    std::ostringstream error_stream;
    if (std::regex_search(result, std::regex(err_trigger, std::regex_constants::icase))) {
        error_stream << result << '\n';
    } else {
        output_stream << result << '\n';
    }

    std::ofstream error_file("error.log");
    error_file << error_stream.str();
    error_file.close();

    return result;
}

//template<typename T>
//typename std::enable_if<std::is_same<typename std::decay<T>::type, std::string>::value, std::string>::type
//to_string(T&& t) {
//    return std::forward<T>(t);
//}
//
//template<typename T>
//typename std::enable_if<std::is_same<typename std::decay<T>::type, const char*>::value, std::string>::type
//to_string(T&& t) {
//    return std::string(std::forward<T>(t));
//}
//
//template<typename T>
//typename std::enable_if<std::is_error_code_enum<typename std::decay<T>::type>::value, std::string>::type
//to_string(T&& t) {
//    return std::error_code(static_cast<int>(std::forward<T>(t)), std::generic_category()).message();
//}
//
//template<typename T>
//typename std::enable_if<std::is_same<typename std::decay<T>::type, fs::path>::value, std::string>::type
//to_string(T&& t) {
//    return t.string();
//}
//
//template<typename T>
//typename std::enable_if<std::is_arithmetic<typename std::decay<T>::type>::value, std::string>::type
//to_string(T&& t) {
//    return std::to_string(std::forward<T>(t));
//}
//
//
//template<typename... Args>
//str printMessage(const str& format_string, Args&&... args){
//
//    // слово-триггер, при котором сообщение будет выводится в cerr
//    str err_trigger = "ошибка";
//
//    const size_t num_args = sizeof...(args);
//    std::regex re("%s");
//    const auto num_placeholders = std::distance(std::sregex_iterator(format_string.begin(), format_string.end(), re), std::sregex_iterator());
//
//    if (num_args != static_cast<size_t>(num_placeholders)) {
//        throw std::invalid_argument("Количество шаблонов '%s' в строке не совпадает с числом переданных аргументов");
//    }
//
////    str result = format_string;
////    int dummy[] = {0, ((void)(result = std::regex_replace(result, re, to_string(args))), 0)...};
////    (void)dummy;
//
//    str result = format_string;
//    std::vector<std::string> arg_strings{to_string(args)...};
//    for (const auto& arg : arg_strings) {
//        std::smatch match;
//        if (std::regex_search(result, match, re)) {
//            result.replace(match.position(0), match.length(0), arg);
//        }
//    }
//
//
//    if (std::regex_search(result, std::regex(err_trigger, std::regex_constants::icase))) {
//        std::cerr << result << '\n';
//    } else {
//        std::cout << result << '\n';
//    }
//    return result;
//}




#endif //SAMOVAR_SYSTEM_HPP
