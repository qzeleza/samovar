# -*- coding: utf-8 -*-
# ------------------------------------------------------------------------------
#
#       Здесь описаны функции общего
#       характера в виде библиотеки
#
# ------------------------------------------------------------------------------

import datetime
import locale

# подключаем логирование в данном файле
import logging
from apps.logger import get_function_name
logger = logging.getLogger(__name__)

# from apps import app
from config import Config


# Получаем дату из строки с поддержкой русских
# имен в названии месяцев и дней недели
def get_date_from_str(str_date):
    locale.setlocale(locale.LC_TIME, 'ru_RU.UTF-8')
    # breakpoint()
    date = str_date.rstrip('года').strip(' ')
    return datetime.datetime.strptime(date, Config.JSON_DATE_FORMAT)


# Получаем строку из даты с поддержкой русских
# # имен в названии месяцев и дней недели
def get_str_from_date(date):
    locale.setlocale(locale.LC_TIME, 'ru_RU.UTF-8')
    return date.strftime(f"{Config.JSON_DATE_FORMAT}")
