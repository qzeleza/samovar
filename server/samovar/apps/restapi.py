# -*- coding: utf-8 -*-
# ------------------------------------------------------------------------------
#
#       Здесь описаны функции, которые
#       непосредственно используются
#       в Websocket и RestAPI запросах
#       к данному серверу
#
# ------------------------------------------------------------------------------

import os, math, re, json
from telegram import Bot

# подключаем логирование в данном файле
import logging
from apps.logger import get_function_name

logger = logging.getLogger(__name__)

from apps.models import (
    History,
    Applications,
    Versions,
    Users,
    RouterModels,
    Devices,
    ReviewTypes,
    Reviews,
    database as db
)

from apps.library import (
    get_date_from_str,
    get_str_from_date
)
from apps.database import (
    add_review_record,
    get_app_record,
    get_ver_record,
    get_user_record,
    get_router_record,
    get_device_record,
    get_type_review_record,
    check_db_for_empty
)
from config import Config

# Инициализируем телеграм бот
bot = Bot(Config.BOT_TOKEN)


# ------------------------------------------------------------------------------
# Добавляем новую запись в БД
# ------------------------------------------------------------------------------
def add_new_record(data):
    # breakpoint()
    logger.debug(f"Вызвана функция '{get_function_name()}'")
    # breakpoint()
    eng_name = data.get('app_name')
    user_name = data.get('name')
    user_email = data.get('email')
    app_review = data.get('review')
    review_type = data.get('type')
    app_rating = data.get('rating')
    app_version = data.get('version')
    version_date = data.get('version_date')
    device_id = data.get('device_id')
    device_processor = data.get('processor')
    device_model = data.get('model')

    app_version = get_last_version(eng_name)[eng_name] if not app_version or app_version == 'latest' else app_version

    # Проверяем наличие данных в связанных таблицах и добавляем их при необходимости
    tb_app = get_app_record(eng_name)

    if tb_app and 'app' in tb_app and app_rating and app_version:
        tb_app = tb_app['app']
        tb_version = get_ver_record(tb_app, app_version, version_date)
        tb_user = get_user_record(user_email, user_name)
        tb_router = get_router_record(device_model, device_processor)
        tb_device = get_device_record(device_id, tb_router, tb_user)
        tb_type_review = get_type_review_record(review_type)
        try:

            add_review_record(app_review, app_rating, tb_type_review, tb_version, tb_device)
            logger.debug('Данные в БД успешно добавлены')
        except Exception as e:
            error = f'Данные в БД добавлены не были: {str(e)}'
            logger.debug(error)
            return {'success': False, 'description': error}
        try:
            bot.send_message(chat_id=Config.CHAT_ID,
                             text=f'Новый отзыв на {tb_app.rus_name}:\n'
                                  f'Имя: {user_name}\n'
                                  f'Email: {user_email}\n'
                                  f'Роутер: {device_id}\n'
                                  f'Модель: {device_model}\n'
                                  f'Процессор: {device_processor}\n'
                                  f'Тип отзыва: {tb_type_review.name}\n'
                                  f'Отзыв: {app_review}\n'
                                  f'Рейтинг: {app_rating}\n'
                                  f'Версия: {app_version}')
        except Exception as e:
            logger.debug(f"Сообщение в Telegram не было отправлено: {str(e)}")

        mess = "Запись успешно добавлена."
        logger.debug(mess)
        return {'success': True, 'description': mess}
    else:
        error = "Проверьте верность значений следующих переданных переменных: app_name или rating или version"
        logger.debug(error)
        return {'success': False, 'description': error}


# ------------------------------------------------------------------------------
# Функция для получения версии приложения
# ------------------------------------------------------------------------------
def get_last_version(app_name):
    # breakpoint()
    answer = {'success': False, app_name: 'н/д'}
    version = 'latest'

    check_db_for_empty(app_name, version)
    # logger.debug('Версия приложения не установлена или установлена в latest')
    # Если не передан или запись с такой версией не найдена, то находим крайнюю из тех, что есть
    last_version = db.session.query(db.func.max(Versions.version)).join(Applications).filter(
        Applications.eng_name == app_name).scalar()
    # last_version = db.session.query(db.func.max(Applications.version)).filter(Applications.name == app_name).scalar()
    if last_version:
        logger.debug(f'В БД была найдена {last_version} версия приложения {app_name}')
        answer = {'success': True, app_name: last_version}

    return answer


# ------------------------------------------------------------------------------
# Возвращаем историю версий для конкретного приложения
# ------------------------------------------------------------------------------
def get_app_history(app_name):
    # Пример сформированной структуры ответа
    # {
    # "app_name": "kvas",
    # "rus_name": "Квас",
    # "versions": [
    #     {
    #         "version": "v1.1.4"
    #         "date": "17 января 2023",
    #         "items": [
    #             "Доработан функция при обновлении правил, после которой происходил разрыв соединения <a href=\"https://github.com/qzeleza/kvas/issues/48\">тикет 48</a>.",
    #             "Доработана функция по добавлению/удалению гостевой/VPN сети - команда kvas vpn guest.",
    #             "Доработана функция получения entware интерфейса по IP, из-за чего происходило неверное распознавание данных."
    #         ],
    #     },
    # }
    app_obj = get_app_record(app_name)
    # breakpoint()
    if app_obj and 'app' in app_obj:
        data = []
        tb_app = app_obj['app']
        ver_obj = db.session.query(Versions).order_by(db.desc(Versions.date)).filter_by(app_id=tb_app.id).all()
        # ver_obj = db.session.query(Versions).filter_by(app_id=app_obj.id).all()
        for ver in ver_obj:
            hist_list = [x.item for x in db.session.query(History).filter_by(ver_id=ver.id).all()]
            data.append({'version': ver.version, 'date': get_str_from_date(ver.date), 'items': hist_list})

        return {
            'success': True,
            'app_name': app_name,
            'rus_name': tb_app.rus_name,
            'versions': data,
        }
    else:
        return app_obj


# ------------------------------------------------------------------------------
# Получаем рейтинг по имени и номеру версии
# ------------------------------------------------------------------------------
def get_app_rating(data):
    logger.debug(f"Вызвана функция '{get_function_name()}'")
    app_name = data.get('app_name')
    app_version = data.get('version')
    version = get_last_version(app_name)[app_name] if not app_version or app_version == 'latest' else app_version

    tb_app = Applications.query.filter_by(eng_name=app_name).first()

    if tb_app:
        rus_name = tb_app.rus_name  # Получаем русское название приложения
        result = {
            'success': True,
            'app_name': app_name,
            'rus_name': rus_name,
            'rating': 0,
            'voted': 0,
            'version': version
        }

        if isinstance(version, Versions):
            reviews = Reviews.query.filter_by(ver_id=version.id).all()

            if reviews:
                voted = len(reviews)
                total_rating = sum([r.rating for r in reviews if r.rating is not None])
                avg_rating = math.ceil(total_rating / voted)
                logger.debug(f'Успешная обработка данных завершена.')

                result = {
                    'success': True,
                    'app_name': app_name,
                    'rus_name': rus_name,
                    'rating': avg_rating,
                    'voted': voted,
                    'version': version
                }
                return result
            else:
                logger.debug(f'Отзывы для {app_name}:{version} в БД отсутствуют.')
                return result
        else:
            logger.debug(f'Для приложения {app_name} нет данных с версией {version} в БД.')
            return result
    else:
        logger.debug(f'Данные {app_name} в БД отсутствуют.')
        return {
            'success': False,
            'app_name': app_name,
            'rus_name': 'н/д',
            'rating': 0,
            'voted': 0,
            'version': version
        }
