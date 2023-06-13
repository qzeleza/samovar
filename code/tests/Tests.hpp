#include <gtest/gtest.h>
#include <gmock/gmock.h>
#include <sstream>
#include <iostream>
#include <fstream>

using namespace testing;

// Включаем заголовочные файлы для тестируемых функций.
#ifndef SAMOVAR_LOCALE_HPP
#include "../src/includes/locale.hpp"
#endif
#ifndef SAMOVAR_API_HPP
#include "../src/includes/api.hpp"
#endif
#ifndef SAMOVAR_SYSTEM_HPP
#include "../src/includes/system.hpp"
#endif
#ifndef MAC_SAMOVAR_CODES_HPP
#include "../src/includes/codes.hpp"
#endif
#ifndef TESTSAMOVAR_SAMOVAR_HPP
#include "../src/includes/samovar.hpp"
#endif

const std::string app_name = "samovar";

