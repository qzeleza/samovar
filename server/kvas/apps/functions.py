import logging
import random
import string

from apps.logger import get_function_name
from config import Config

logger = logging.getLogger(__name__)

# Инициализируем телеграм бот
from telegram import Bot

bot = Bot(Config.BOT_TOKEN)


# Генерируем уникальный номер устройства
def generate_id_number(length=30):
    characters = string.ascii_letters + string.digits
    serial_number = ''.join(random.choice(characters) for i in range(length))
    return serial_number


# Отправляем сообщение в телеграм
def send_tel_message(mess):
    try:
        bot.send_message(chat_id=Config.CHAT_ID, text=mess)
    except Exception as e:
        logger.debug(f"Сообщение в Telegram не было отправлено: {str(e)}")


# -----------------------------------------------------------------------------------------------------------------------
#
#   Функции для отработки запросов по routes
#
# -----------------------------------------------------------------------------------------------------------------------

def get_apps_data():
    logger.debug(f"Вызвана функция '{get_function_name()}'")
    logger.debug(f'Успешная обработка данных завершена.')
    result = {
        'kvas': {
            "author_1": {'name': 'Zeleza', 'email': 'mail@zelza.ru'},
            "author_2": {'name': 'Железо', 'email': 'email@zelza.ru'},
            "app_rus_name": "Квас",
            "description": "'Белый список' для посещения сайтов через VPN.",
            "full_description": "Данный пакет позволяет осуществлять контроль и поддерживать в актуальном состоянии " +
                                "список разблокировки хостов или \"Белый список\". При обращении к любому хосту из этого списка, " +
                                "весь трафик будет идти через фактически любое VPN соединение, заранее настроенное на роутере, или через Shadowsocks соединение.",
            "last_version": '1.3',
            "last_version_date": '12.03.2021',
            "links": [
                {
                    "title": 'Службы',
                    "link": 'pages/kvas/services/services.html',
                    "icon": 'ph-stack',
                },
                {
                    "title": 'Белый список',
                    "link": 'pages/kvas/wlist/wlist.html',
                    "icon": 'ph-list-checks',
                },
                {
                    "title": 'Отчеты',
                    "link": 'pages/kvas/reports/reports.html',
                    "icon": 'ph-notepad',
                },
                {
                    "title": 'divider',
                },
                {
                    "title": 'Форум',
                    "link": 'https://forum.keenetic.com/topic/14415-пробуем-квас-shadowsocks-и-другие-vpn-клиенты/',
                    "icon": 'ph-user',
                },
                {
                    "title": 'Github',
                    "link": 'https://github.com/qzeleza/kvas',
                    "icon": 'ph-github-logo',
                },
                {
                    "title": 'Документация',
                    "link": 'https://github.com/qzeleza/kvas/wiki',
                    "icon": 'ph-book-open',
                },
            ]
        },
        'rodina': {
            "author_1": {'name': 'Zeleza', 'email': 'mail@zelza.ru'},
            "app_rus_name": "Родина",
            "full_description": "Данный пакет позволяет удобно расположить часто используемые сервисы на главной странице." +
                                "Гибок в настройке и использовании.",
            "description": "Родная, домашняя панель запуска часто-используемых ресурсов.",
            "last_version": '1.0.1',
            "last_version_date": '12.11.2023',
            "links": [
                {
                    "title": 'Панорама',
                    "link": 'pages/rodina/main.html',
                    "icon": 'ph-gauge',
                },
                {
                    "title": 'Настройки',
                    "link": 'pages/rodina/settings.html',
                    "icon": 'ph-faders',
                },
                {
                    "title": 'divider',
                },
                {
                    "title": 'Форум',
                    "link": 'https://forum.keenetic.com/topic/16612-Самовар/',
                    "icon": 'ph-user',
                },
                {
                    "title": 'Github',
                    "link": 'https://github.com/qzeleza/samovar',
                    "icon": 'ph-github-logo',
                },
                {
                    "title": 'Документация',
                    "link": 'https://github.com/qzeleza/samovar/wiki',
                    "icon": 'ph-book-open',
                },
            ]
        }
    }
    return result


# Отправляем историю по конкретному приложению
def get_app_history(data):
    logger.debug(f"Вызвана функция '{get_function_name()}'")
    app_name = data.get('app_name')
    logger.debug(f'Успешная обработка данных завершена.')
    result = {
        'rodina': {
            'app_name': app_name,
            'app_name_rus': 'Родина',
            'version': {
                '1.0.1': [
                    {
                        1: "Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute, non cupidatat skateboard dolor brunch."},
                    {
                        2: "Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute."},
                    {
                        3: "Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. non cupidatat skateboard dolor brunch."},
                    {
                        4: "Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson cupidatat skateboard dolor brunch."},
                    {
                        5: "Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry wolf moon officia aute, non cupidatat skateboard dolor brunch."},
                    {
                        6: "Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus teria aute, non cupidatat skateboard dolor brunch."},
                    {
                        7: "Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute, non cupidateboard dolor brunch."},

                ],
            },
        },
        'kvas': {
            'app_name': app_name,
            'app_name_rus': 'Квас',
            'version': {
                '1.3': [
                    {
                        1: "Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute, non cupidatat skateboard dolor brunch."},
                    {
                        2: "Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute."},
                    {
                        3: "Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. non cupidatat skateboard dolor brunch."},
                    {
                        4: "Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson cupidatat skateboard dolor brunch."},
                    {
                        5: "Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry wolf moon officia aute, non cupidatat skateboard dolor brunch."},
                    {
                        6: "Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus teria aute, non cupidatat skateboard dolor brunch."},
                    {
                        7: "Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute, non cupidateboard dolor brunch."},

                ],
                '1.2': [
                    {
                        1: "Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute, non cupidatat skateboard dolor brunch."},
                    {
                        2: "Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute."},
                    {
                        3: "Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. non cupidatat skateboard dolor brunch."},
                    {
                        4: "Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson cupidatat skateboard dolor brunch."},
                    {
                        5: "Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry wolf moon officia aute, non cupidatat skateboard dolor brunch."},
                    {
                        7: "Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute, non cupidateboard dolor brunch."},

                ],
                '1.1': [
                    {
                        1: "Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute, non cupidatat skateboard dolor brunch."},
                    {
                        4: "Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson cupidatat skateboard dolor brunch."},
                    {
                        5: "Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry wolf moon officia aute, non cupidatat skateboard dolor brunch."},
                    {
                        6: "Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus teria aute, non cupidatat skateboard dolor brunch."},
                    {
                        7: "Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute, non cupidateboard dolor brunch."},

                ]
            }
        },
        'CAMOBAP': {
            'app_name': app_name,
            'app_name_rus': 'Самовар',
            'version': {
                '1.0.2': [
                    {
                        1: "Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute, non cupidatat skateboard dolor brunch."},
                    {
                        2: "Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute."},
                    {
                        3: "Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. non cupidatat skateboard dolor brunch."},
                    {
                        4: "Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson cupidatat skateboard dolor brunch."},
                    {
                        6: "Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus teria aute, non cupidatat skateboard dolor brunch."},
                    {
                        7: "Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute, non cupidateboard dolor brunch."},

                ],
                '1.0.1': [
                    {
                        1: "Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute, non cupidatat skateboard dolor brunch."},
                    {
                        2: "Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute."},
                    {
                        5: "Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry wolf moon officia aute, non cupidatat skateboard dolor brunch."},
                    {
                        6: "Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus teria aute, non cupidatat skateboard dolor brunch."},
                    {
                        7: "Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute, non cupidateboard dolor brunch."},

                ],
                '1.0.0': [
                    {
                        5: "Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry wolf moon officia aute, non cupidatat skateboard dolor brunch."},
                    {
                        6: "Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus teria aute, non cupidatat skateboard dolor brunch."},
                    {
                        7: "Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute, non cupidateboard dolor brunch."},

                ]
            }
        }
    }

    if app_name in result:
        return result[app_name]
    else:
        return {'error': f"Запрошенное приложение '{app_name}' не существует."}


# Отправляем рейтинг по имени и номеру версии
def apps_update(data):
    logger.debug(f"Вызвана функция '{get_function_name()}'")
    app_name = data.get('app_name')

    versions = {
        'CAMOBAP': '1.0.1',
        'kvas': '1.4',
        'rodina': '1.0.2'
    }

    logger.debug(f'Успешная обработка данных завершена.')
    if app_name in versions:
        return {
            'app_name': app_name,
            'update': random.choice([True, False]),
            'version': versions[app_name],
        }
    else:
        return {'error': f"Запрошенное приложение '{app_name}' не существует."}


# Отправляем данные роутера по запросу
def get_router_data():
    logger.debug(f"Вызвана функция '{get_function_name()}'")
    # breakpoint()
    logger.debug(f'Успешная обработка данных завершена.')
    routers = {
        'Ultra KN-1811': 'mipsel',
        'Giga KN-1011': 'mipsel',
        'Viva KN-1911': 'mipsel',
        'Peak KN-2710': 'aarch64',
        'Hero 4G+ KN-2311': 'mipsel',
        'Ultra SE KN-2510': 'mips',
        'Giga SE KN-2410': 'mips',
    }
    model = random.choice([m for m in routers.keys()])
    processor = routers[model]
    return {
        'model': model,
        'processor': processor,
        'device_id': generate_id_number(),
    }
