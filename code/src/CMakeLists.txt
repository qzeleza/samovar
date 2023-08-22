# Имя проекта - CAMOBAP
project(Samovar VERSION 1.0)
# Устанавливаем стандарт языка C++11
set(CMAKE_CXX_STANDARD 11)
# Добавляем исполняемый файл CAMOBAP
add_executable(${PROJECT_NAME}
    samovar.cpp
    api.cpp
    args.cpp
    locale.cpp
    server.cpp
    system.cpp
)

# Подключаем директорию с заголовочными файлами
target_include_directories(samovar PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/includes)

# Указываем, что нам нужен стандарт языка С++20
target_compile_features(samovar PUBLIC cxx_std_11)
## Получаем имя текущего пользователя в системе
#execute_process(COMMAND whoami OUTPUT_VARIABLE CURRENT_USER OUTPUT_STRIP_TRAILING_WHITESPACE)
## Устанавливаем путь к директории с заголовочными файлами в зависимости от имени пользователя
#if(${CURRENT_USER} STREQUAL "master")
#    include_directories(/usr/local/include)
#elseif(${CURRENT_USER} STREQUAL "zezl")
#    include_directories(/opt/homebrew/include)
#endif()
#
#set(SOURCES
#        api.cpp
#        args.cpp
#        locale.cpp
#        server.cpp
#        system.cpp)

#file(GLOB SOURCES "*.cpp")
# Определяем библиотеку с именем 'samovar_lib'
#add_library(samovar_lib STATIC ${SOURCES})

# Определяем исполняемый файл 'CAMOBAP'
#add_executable(${PROJECT_NAME} CAMOBAP.cpp ${SOURCES})
# Указываем точку входа в программу
#target_compile_definitions(${PROJECT_NAME} PUBLIC SAMOVAR_ENTRY=${PROJECT_NAME})
# Линкуем библиотеку с исполняемым файлом
#target_include_directories(${PROJECT_NAME} PRIVATE ${CMAKE_CURRENT_SOURCE_DIR}/includes)
#target_link_libraries(${PROJECT_NAME} PRIVATE
##        samovar_lib
#        ${HTTPSERVER_LIB}
#        ${INTL_LIBRARY}
#        )

# Указываем путь до заголовочных файлов для данной библиотеки
#target_include_directories(samovar_lib PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/includes)
## Подключаем библиотеку gettext
#find_package(Gettext REQUIRED)
#target_link_libraries(${PROJECT_NAME} PRIVATE ${GETTEXT_LIBRARIES})
#target_include_directories(${PROJECT_NAME} PRIVATE ${GETTEXT_INCLUDE_DIR})

# Устанавливаем флаги компиляции
#target_compile_options(CAMOBAP PRIVATE -Wall -Wextra -pedantic -Werror)
# Добавляем Google Test в качестве зависимости для бинарного файла 'TestSamovar'


#message(FATAL_ERROR "INTL_LIBRARY = ${INTL_LIBRARY}")



#set(SOURCE_FILES
#        api.cpp
#        args.cpp
#        locale.cpp
#        CAMOBAP.cpp
#        server.cpp
#        system.cpp)
#
#add_library(Samovar_lib ${SOURCE_FILES})
#
#target_include_directories(Samovar_lib PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/includes)
#
#find_library(GETTEXT_LIB gettext)
#target_link_libraries(Samovar_lib ${GETTEXT_LIB})
#
#find_library(HTTPSERVER_LIB httpserver)
#target_link_libraries(Samovar_lib ${HTTPSERVER_LIB})

#
#file(GLOB SOURCES "*.cpp")
#include_directories(includes)
#
#add_executable(CAMOBAP ${SOURCES})
#target_link_libraries(CAMOBAP ${GETTEXT_LIBRARY})


#set(SAMOVAR_CORE_SRC api.cpp args.cpp locale.cpp server.cpp system.cpp includes/api.hpp includes/args.hpp includes/locale.hpp includes/codes.hpp includes/json.hpp includes/system.hpp)
#add_library(core ${SAMOVAR_CORE_SRC})
##add_executable(CAMOBAP CAMOBAP.cpp)
#target_link_libraries(CAMOBAP core ${GETTEXT_LIBRARIES})

#add_executable(CAMOBAP CAMOBAP.cpp)