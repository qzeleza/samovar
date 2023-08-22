cmake_minimum_required(VERSION 3.12)

# Устанавливаем название проекта
project(Samovar)

# Добавляем поддиректорию для сборки
add_subdirectory(src)

# Добавляем поддиректорию для тестов
add_subdirectory(tests)

# Получаем имя текущего пользователя в системе
#execute_process(COMMAND whoami OUTPUT_VARIABLE CURRENT_USER OUTPUT_STRIP_TRAILING_WHITESPACE)
## Устанавливаем путь к директории с заголовочными файлами в зависимости от имени пользователя
#if(${CURRENT_USER} STREQUAL "master")
#    include_directories(/usr/local/include)
#elseif(${CURRENT_USER} STREQUAL "zezl")
#    include_directories(/opt/homebrew/include)
#endif()

# Подключаем библиотеку gettext
#find_package(Gettext REQUIRED)
##find_library(GETTEXT_LIB NAMES gettext)
#
#include_directories(${GETTEXT_INCLUDE_DIR})
#link_directories(${GETTEXT_LIBRARY_DIR})
#
#find_library(INTL_LIBRARY NAMES intl)
#find_library(HTTPSERVER_LIB NAMES httpserver)




#cmake_minimum_required(VERSION 3.10)
#project(CAMOBAP)
#project(TestsSamovar)
#
## Подключение Google Test
#include(FetchContent)
#FetchContent_Declare(
#  googletest
#  GIT_REPOSITORY https://github.com/google/googletest.git
#  GIT_TAG        release-1.10.0
#)
#
#FetchContent_MakeAvailable(googletest)
#
## Подключение Google Test
#enable_testing()
#
## Подключение gettext
#find_package(Gettext REQUIRED)
#include_directories(${GETTEXT_INCLUDE_DIR})
#include_directories(/usr/local/include/)
#
#add_subdirectory(src)
#add_subdirectory(tests)


#
#cmake_minimum_required(VERSION 3.3)
#
#project(CAMOBAP)
#
#set(CMAKE_CXX_STANDARD 20)
#find_package(Gettext REQUIRED)
#
## Добавьте каталоги include для gettext
#include_directories(/usr/local/include/)
#
#add_subdirectory(src)
#add_subdirectory(tests)
#

#add_executable(main_samovar src/CAMOBAP.cpp)
#set(SAMOVAR_CORE_SRC
#        src/api.cpp
#        src/args.cpp src/locale.cpp src/server.cpp src/system.cpp src/includes/api.hpp src/includes/args.hpp src/includes/locale.hpp src/includes/codes.hpp src/includes/json.hpp src/includes/system.hpp)
#add_library(core ${SAMOVAR_CORE_SRC})
#add_executable(main_samovar src/CAMOBAP.cpp)
#target_link_libraries(main_samovar core ${GETTEXT_LIBRARIES})


#add_executable(test_samovar tests/TestMainSamovar.cpp tests/TestLocale.cpp)
#target_link_libraries(test_samovar gtest gmock ${INTL_LIBRARY})

#set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -DENABLE_NLS=ON")
#set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -I /usr/local/include/")


