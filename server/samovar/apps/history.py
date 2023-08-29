# -*- coding: utf-8 -*-
# ------------------------------------------------------------------------------
#
#       Здесь описаны функции для считывания данных
#       по истории версий приложений и данных из
#       файла конфигурации приложений и их переноса в БД
#
# ------------------------------------------------------------------------------

import re, os

# подключаем логирование в данном файле
import logging
from apps.logger import get_function_name

logger = logging.getLogger(__name__)

from config import Config


# ------------------------------------------------------------------------------
# Получаем данные из файлов истории версий по каждому приложению
# ------------------------------------------------------------------------------
def get_history_items(file_history):
    # from apps.functions import get_history_items
    # get_history_items('./data/kvas/HISTORY.md')

    ver_data, items, count = {}, [], 0

    # шаблоны для выявления даты и версии в файле конфигурации
    re_date_templ = r'\d{1,2} \w+ \d{4}'
    re_ver_templ = r'v\d{1,2}.{1}\d{1,2}.{0,1}\d{0,3}\w{0,1}'

    # шаблоны для обнаружения ссылок в markdown файлах и перевода их в html
    re_md_templ = r'\[([^\[]+)\]\(([^\)]+)\)'
    re_html_templ = r'<a href="\2">\1</a>'

    if os.path.exists(file_history):
        with open(file_history, "r", encoding='utf-8') as f:
            lines = f.readlines()
            versions_list = [(i, re.findall(re_ver_templ, x)[0]) for i, x in enumerate(lines) if
                             re.findall(re_ver_templ, x)]

            for count, line in versions_list:
                # breakpoint()

                # ищем номер версии первой строкой
                if line in lines[count]:
                    ver_line = line
                    # Если нашли номер версии, то вторая и
                    # далее строки, до пустой строки или сроки с новым номером версии
                    # подлежат обработке из буфера
                    if ver_line:
                        date = re.findall(re_date_templ, lines[count + 1])[0]
                        count += 2
                        item_count = 0
                        for item in lines[count:]:
                            if '-' in item:
                                item = item.strip('- \n')
                                item = re.sub(re_md_templ, re_html_templ, item)
                                if item:
                                    items.append(item)
                                    item_count += 1
                            else:
                                count += item_count
                                break

                        ver_data[ver_line] = {'date': date, 'items': items}
                        items = []

    return ver_data


# ------------------------------------------------------------------------------
# Получаем данные из файла конфигурации приложений
# ------------------------------------------------------------------------------
def get_config_data(app_name):
    app_data = dict()
    config_fields = ['rus_name', 'app_desc', 'app_full_desc', 'available']
    inside = False

    if os.path.exists(Config.FILE_CONFIG):
        with open(Config.FILE_CONFIG, "r", encoding='utf-8') as f:

            for line in f:
                # если поле найдено в сроке, то извлекаем его
                if inside and line:
                    for val in config_fields:
                        if val in line:
                            app_data[val] = line[line.find('=') + 1:].strip(' ,\n')

                # Отсекаем блок поиска - искомый блок содержит
                # в начале блока строку вида [app_name]
                if (app_name in line) and ('[' in line) and (']' in line):
                    inside = True
                elif inside and ('[' in line) and (']' in line):
                    inside = False
        # breakpoint()
        if app_data:
            # если приложение пока в разработке и недоступно, то история у него пустая
            available = app_data['available'].upper()
            app_data['available'] = True if available == 'YES' or available == 'ДА' else False
            if app_data['available']:
                history_file = f"{os.path.dirname(Config.FILE_CONFIG)}/{app_name}/{Config.HISTORY_FILE_NAME}"
                app_data['history'] = get_history_items(history_file)
            else:
                app_data['history'] = {}
            config_fields.append('history')
            # breakpoint()
        else:
            return '', '', '', '', []
    else:
        assert f"Файл конфигурации '{Config.FILE_CONFIG}' не существует!"
    return (app_data[val] for val in config_fields)
