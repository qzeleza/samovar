# -*- coding: utf-8 -*-
# ------------------------------------------------------------------------------
#
#       Здесь описаны функции для управления логированием проекта
# 
# ------------------------------------------------------------------------------

import logging
import inspect
import time
from logging.handlers import RotatingFileHandler

from config import DebugConfig


# Получаем имя функции для автоматического определения при отладке
def get_function_name():
    # Получаем стек вызовов
    stack = inspect.stack()

    # Извлекаем информацию о текущей функции из стека
    frame = stack[1]
    function_name = frame.function

    # Возвращаем имя функции
    return function_name


# Создание форматера с префиксами и дополнительной информацией
def format_time(record, datefmt=DebugConfig.DATE_FORMAT):
    timestamp = time.strftime(datefmt, time.localtime(record.created))
    return timestamp


class LogFormatter(logging.Formatter):
    def format(self, record):
        if not hasattr(record, 'asctime'):
            record.asctime = format_time(record)

        message = super().format(record)
        return f'{record.levelname} {record.asctime} [{record.name}] >>> {message}'


formatter = LogFormatter('%(message)s')
# корневой логгер
root_logger = logging.getLogger()
root_logger.setLevel(logging.DEBUG)

# консольный логгер
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.DEBUG)
console_handler.setFormatter(formatter)

# логгер файловый
file_handler = RotatingFileHandler(
    DebugConfig.LOG_DEBUG_FILE,
    maxBytes=DebugConfig.MAX_LOG_SIZE,  # Максимальный размер файла в байтах
    backupCount=DebugConfig.NUM_LOG_BACKUPS  # Количество резервных копий файлов журнала
)
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(formatter)

root_logger.addHandler(console_handler)
root_logger.addHandler(file_handler)
