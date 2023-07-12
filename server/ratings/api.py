# -*- coding: utf-8 -*-

#
# Cервер на Python с использованием фреймворка Flask и
# базы данных SQLite, который позволяет отправлять оценку
# и отзыв пользователя по POST запросу, получать подсчитанный
# рейтинг и список отзывов по POST запросу для конкретного
# приложения, а также просматривать список всех приложений
# и их средний рейтинг в браузере по GET запросу
# с авторизацией по ключу.
#
#
import os

from sys import exit
from apps.logger import root_logger

from apps import create_app
from apps.events import socketio
from config import config_dict

# WARNING: Don't run with debug turned on in production!
DEBUG = (os.getenv('DEBUG', 'False') == 'True')

# The configuration
get_config_mode = 'Debug' if DEBUG else 'Production'
try:

    # Load the configuration using the default values
    app_config = config_dict[get_config_mode.capitalize()]

except KeyError:
    exit('Ошибка: Недопустимый <config_mode>. Ожидалось одно из значений [Debug, Production] ')

app = create_app(app_config)

if DEBUG:
    # Настраиваем логирование в файл
    root_logger.info('ОТЛАДКА ВКЛЮЧЕНА')
    root_logger.info('Логирование ведется в файл ' + app_config.LOG_DEBUG_FILE)
    root_logger.info('Файл базы данных ' + app_config.DATABASE_PATH)


if __name__ == '__main__':
    socketio.run(app, host=app_config.HOST, port=app_config.PORT, debug=DEBUG)
