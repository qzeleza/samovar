cmake_minimum_required(VERSION 3.24)
# Устанавливаем стандарт языка C++11
set(CMAKE_CXX_STANDARD 11)
project(TestSamovar)

# Получаем имя текущего пользователя в системе
execute_process(COMMAND whoami OUTPUT_VARIABLE CURRENT_USER OUTPUT_STRIP_TRAILING_WHITESPACE)
# Устанавливаем путь к директории с заголовочными файлами в зависимости от имени пользователя
if(${CURRENT_USER} STREQUAL "master")
    set(ROOT_DIR_LIBS /usr/local)
    set(CMAKE_INCLUDE_PATH ${CMAKE_INCLUDE_PATH} ${ROOT_DIR_LIBS}/include)
    set(CMAKE_LIBRARY_PATH ${CMAKE_LIBRARY_PATH} ${ROOT_DIR_LIBS}/lib)
elseif(${CURRENT_USER} STREQUAL "zezl")
    set(ROOT_DIR_LIBS /opt/homebrew)
    set(CMAKE_INCLUDE_PATH ${CMAKE_INCLUDE_PATH} ${ROOT_DIR_LIBS}/include)
    set(CMAKE_LIBRARY_PATH ${CMAKE_LIBRARY_PATH} ${ROOT_DIR_LIBS}/lib)
endif()

## Найти заголовочные файлы для libintl
set(BOOST_ROOT /usr/local/Cellar/boost/1.81.0_1)
find_package(Boost REQUIRED COMPONENTS system filesystem)
find_path(LIBINTL_INCLUDE_DIR libintl.h PATHS ${ROOT_DIR_LIBS}/include)
#message(FATAL_ERROR "BOOST_ROOT = ${Boost_LIBRARIES}")
#
## Найти библиотеки
find_library(BOOST_LIB NAMES libboost PATHS ${ROOT_DIR_LIBS}/lib)
find_library(HTTPSERVER_LIB NAMES httpserver PATHS ${ROOT_DIR_LIBS}/lib)
#find_library(GETTEXT_LIB NAMES gettext PATHS ${ROOT_DIR_LIBS}/lib)
find_library(LIBINTL_LIBRARY NAMES intl PATHS ${ROOT_DIR_LIBS}/lib)

#message(FATAL_ERROR "BOOST_LIB = ${BOOST_LIB}")

# Подключаем Google Test
include(FetchContent)
FetchContent_Declare(
    googletest
    GIT_REPOSITORY https://github.com/google/googletest.git
    GIT_TAG        release-1.11.0
)
FetchContent_MakeAvailable(googletest)

file(GLOB SOURCES "../src/*.cpp")
# Определяем цель "TestSamovar" и список исходных файлов для нее
add_executable(${PROJECT_NAME} ${SOURCES}
        TestMain.cpp
        TestLocale.cpp
        TestSystem.cpp
        )


# Подключаем директорию с заголовочными файлами
target_include_directories(${PROJECT_NAME} PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/../src/includes ${CMAKE_INCLUDE_PATH} ${Boost_INCLUDE_DIRS})

# Подключаем библиотеку Google Test к тестовому исполняемому файлу
target_link_libraries(${PROJECT_NAME} PRIVATE gtest gmock ${HTTPSERVER_LIB} ${LIBINTL_LIBRARY} ${Boost_LIBRARIES} pthread)

# Добавляем опцию для запуска отдельно тестов
option(RUN_TESTS "Build and run the tests" OFF)
    if(RUN_TESTS)
    include(GoogleTest)
    gtest_discover_tests(${PROJECT_NAME})
endif()

# Указываем, что нам нужен стандарт языка С++11
set(CMAKE_CXX_STANDARD 11)
# Требуем использовать только указанную версию компилятора
set(CMAKE_CXX_STANDARD_REQUIRED ON)
# Запрещаем использование расширений компилятора, которые не являются стандартом языка.
set(CMAKE_CXX_EXTENSIONS OFF)
# Устанавливаем опции компилятора
target_compile_options(${PROJECT_NAME} PUBLIC "-std=c++11" "-Wextra" "-pedantic-errors") #) "-Wall")
#   -std=c++11 - выбирает C++11 в качестве стандарта языка.
#   -Wall - включает все предупреждения компилятора.
#   -Wextra - включает дополнительные предупреждения компилятора.
#   -pedantic-errors - включает предупреждения компилятора при несоответствии кода стандарту C++.


