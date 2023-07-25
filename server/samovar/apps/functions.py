import os, math
from telegram import Bot
from flask import request, jsonify, render_template
import logging
from datetime import datetime

from apps.logger import get_function_name
from apps.models import Applications, Users, RouterModels, Devices, ReviewTypes, Reviews, database as db
from config import Config

logger = logging.getLogger(__name__)

# Инициализируем телеграм бот
bot = Bot(Config.BOT_TOKEN)


# получаем экземпляр Приложения по имени и версии
def get_app_record(app_name, version):
    # Проверяем наличие данных в связанных таблицах и добавляем их при необходимости
    app = Applications.query.filter_by(name=app_name, version=version).first()
    if not app:
        app = Applications(app_name, version)
        db.session.add(app)
        db.session.commit()
    return app


# получаем экземпляр Пользователя по имени и email
def get_user_record(user_email, user_name):
    # Проверяем наличие данных в связанных таблицах и добавляем их при необходимости
    user = Users.query.filter_by(email=user_email).first()
    if not user:
        user = Users(user_email, user_name)
        db.session.add(user)
        db.session.commit()
    return user

# получаем экземпляр ТипаРоутера по модели и процессоре
def get_router_record(model, processor):
    router_model = RouterModels.query.filter_by(model=model, processor=processor).first()
    if not router_model:
        router_model = RouterModels(model, processor)
        db.session.add(router_model)
        db.session.commit()
    return router_model

def get_device_record(device_id, router, user):
    device = Devices.query.filter_by(device_id=device_id).first()
    if not device:
        device = Devices(router.id, user.id, device_id)
        db.session.add(device)
        db.session.commit()
    return device


def get_type_review_record(type):
    type_review = ReviewTypes.query.filter_by(desc=type).first()
    if not type_review:
        type_review = ReviewTypes(type)
        db.session.add(type_review)
        db.session.commit()
    return type_review

def add_review_record(review, rating, type_review, app, device):
    # breakpoint()
    review = Reviews(datetime.utcnow(), review, rating, type_review.id, app.id, device.id)
    db.session.add(review)
    db.session.commit()

    return review

def add_new_record(data):
    # breakpoint()
    logger.debug(f"Вызвана функция '{get_function_name()}'")

    app_name = data.get('app_name')
    user_name = data.get('name')
    user_email = data.get('email')
    app_review = data.get('review')
    review_type = data.get('type')
    app_rating = data.get('rating') or 0
    app_version = data.get('version')
    device_id = data.get('device_id')
    device_processor = data.get('processor')
    device_model = data.get('model')

    # Проверяем наличие данных в связанных таблицах и добавляем их при необходимости
    app = get_app_record(app_name, app_version)
    user = get_user_record(user_email, user_name)
    router = get_router_record(device_model, device_processor)
    device = get_device_record(device_id, router, user)
    type_review = get_type_review_record(review_type)

    if app and app_rating and app_version:
        try:
            add_review_record(app_review, app_rating, type_review, app, device)
            logger.debug('Данные в БД успешно добавлены')
        except Exception as e:
            error = f'Данные в БД добавлены не были: {str(e)}'
            logger.debug(error)
            return {'success': False, 'description': error}
        try:
            bot.send_message(chat_id=Config.CHAT_ID,
                             text=f'Новый отзыв на {app_name}:\n'
                                  f'Имя: {user_name}\n'
                                  f'Email: {user_email}\n'
                                  f'Роутер: {device_id}\n'
                                  f'Модель: {device_model}\n'
                                  f'Процессор: {device_processor}\n'
                                  f'Тип отзыва: {type_review.desc}\n'
                                  f'Отзыв: {app_review}\n'
                                  f'Рейтинг: {app_rating}\n'
                                  f'Версия: {app_version}')
        except Exception as e:
            logger.debug(f"Сообщение в Telegram не было отправлено: {str(e)}")

        mess = "Запись успешно добавлена."
        logger.debug(mess)
        return {'success': True, 'description': mess}
    else:
        error = "Один из параметров не задан: app_name или rating или version"
        logger.debug(error)
        return {'success': False, 'description': error}



# проверяем есть ли в БД записи
def check_db_for_empty(app_name, version):
    # breakpoint()
    # проверяем передан ли номер версии программы
    first_rec_of_version = Applications.query.filter_by(name=app_name).first()
    if not first_rec_of_version and (not version or version == 'latest'):
        error = "ОШИБКА: Не задан номер версии и нет записей в БД."
        logger.error(error)
        return jsonify({'success': False, 'description': error})


# Функция для получения версии приложения
def get_version(app_name, version):
    check_db_for_empty(app_name, version)
    if not version or version == 'latest':
        logger.debug('Версия приложения не установлена или установлена в latest')
        # Если не передан или запись с такой версией не найдена, то находим крайнюю из тех, что есть
        last_version = db.session.query(db.func.max(Applications.version)).filter(Applications.name == app_name).scalar()
        if last_version:
            logger.debug(f'В БД была найдена {last_version} версия приложения {app_name}')
            version = last_version
        else:
            version = -1
    return version


# Получаем рейтинг по имени и номеру версии
def get_app_rating(data):

    logger.debug(f"Вызвана функция '{get_function_name()}'")
    app_name = data.get('app_name')
    app_version = data.get('version')

    result = {
        'app_name': app_name,
        'rating': -1,
        'voted': -1,
        'version': -1
    }

    version = get_version(app_name, app_version)

    if version:

        app = Applications.query.filter_by(name=app_name, version=version).first()

        if app:
            reviews = Reviews.query.filter_by(app_id=app.id).all()
            for r in reviews:
                if r.rating == 'null':
                    logger.debug(f'Обнаружена запись с рейтингом = null, установлена на 0')
                    r.rating = 0
            db.session.commit()

            if reviews:
                voted = len(reviews)
                avg_rating = math.ceil(sum([r.rating for r in reviews]) / voted)
                logger.debug(f'Успешная обработка данных завершена.')

                result = {
                    'app_name': app_name,
                    'rating': avg_rating,
                    'voted': voted,
                    'version': version
                }

                return  result
            else:
                logger.debug('Обработка данных завершена с нулевым результатом.')
                return result
        else:
            logger.debug('Обработка данных завершена с нулевым результатом.')
            return result
    else:
        logger.debug('Обработка данных завершена с нулевым результатом.')
        return result

# Получаем полный список отзывав по имени и версии приложения в JSON формате
def get_review_list(data):

    logger.debug(f"Вызвана функция '{get_function_name()}'")
    app_name = data.get('app_name')
    app_version = data.get('version')

    voted = 0
    version = get_version(app_name, app_version)
    result = {
        'app_name': app_name,
        'version': version,
        'voted': voted,
        'review_list': []
    }

    if version:

        app = Applications.query.filter_by(name=app_name, version=version).first()

        if app:
            reviews = Reviews.query.filter_by(app_id=app.id).all()
            review_list = []
            if reviews:
                voted = len(reviews)
                for r in reviews:
                    review_type = ReviewTypes.query.filter_by(id=r.type_id).first()
                    device = Devices.query.filter_by(id=r.device_id).first()
                    router = RouterModels.query.filter_by(id=device.model_id).first()
                    user = Users.query.filter_by(id=device.user_id).first()
                    review_list.append({
                        'email': user.email,
                        'name': user.full_name,
                        'model': router.model,
                        'device_id': device.device_id,
                        'processor': router.processor,
                        'type_review': review_type.desc,
                        'review': r.review,
                        'rating': r.rating,
                        'date': r.date.strftime(Config.DATE_FORMAT),
                    })

                logger.debug("Формирование списка отзывов успешно завершено.")
            else:
                logger.debug("Формирование списка отзывов завершено с нулевым результатом.")

            result = {'app_name': app_name, 'version': version, 'voted': voted, 'review_list': review_list}
            return result
        else:
            logger.debug("Формирование списка отзывов завершено с нулевым результатом.")
            return result
    else:
        logger.debug("Формирование списка отзывов завершено с нулевым результатом.")
        return result



def show_apps_summary():

    logger.debug(f"Вызвана функция '{get_function_name()}'")
    try:
        reviews = Reviews.query.filter(Reviews.rating > 0).all()
        apps = {}
        for r in reviews:
            app = Applications.query.filter_by(id=r.app_id).first()
            app_key = (app.name, app.version, r.app_id)
            apps.setdefault(app_key, []).append(r.rating)
        # breakpoint()
        avg_ratings = {
            app_key: {
                'avg_rating': math.ceil(sum(app_ratings) / len(app_ratings)),
                'num_votes': len(app_ratings),
                'num_reviews': sum(1 for r in reviews if r.app_id == app_key[2] and r.review)
            }
            for app_key, app_ratings in apps.items()
        }

        sorted_avg_ratings = sorted(avg_ratings.items(), key=lambda x: x[0], reverse=True)
        return render_template(Config.RATING_TEMPLATE_NAME, ratings=sorted_avg_ratings)
    except Exception as e:
        logger.error(f"Ошибка при генерации страницы: {str(e)}")


def show_reviews_table(request):
    logger.debug(f"Вызвана функция '{get_function_name()}'")
    try:
        app_name = request.args.get('app_name')
        app = Applications.query.filter_by(name=app_name).first()
        reviews = (
            Reviews.query.filter_by(app_id=app.id).all()
            if app_name
            else Reviews.query.all()
        )
        apps = {}

        for r in reviews:
            app = Applications.query.filter_by(id=r.app_id).first()
            device = Devices.query.filter_by(id=r.device_id).first()
            user = Users.query.filter_by(id=device.user_id).first()
            review_type = ReviewTypes.query.filter_by(id=r.type_id).first()
            router_model = RouterModels.query.filter_by(id=device.model_id).first()

            # breakpoint()
            app_key = (app.name, app.version)
            review_data = {
                'date': r.date,
                'review': r.review,
                'email': user.email,
                'name': user.full_name,
                'type': review_type.desc,
                'model': router_model.model,
                'device_id': device.device_id,
                'processor': router_model.processor,
            }
            apps.setdefault(app_key, []).append(review_data)

        sorted_apps = sorted(apps.items(), key=lambda x: x[0], reverse=True)
        row_counts = {
            app_key[0]: sum(len(reviews) for key, reviews in apps.items() if key[0] == app_key[0])
            for app_key, reviews in apps.items()
        }

        return render_template(Config.REVIEWS_TEMPLATE_NAME, apps=dict(sorted_apps), row_counts=row_counts)

    except Exception as e:
        logger.error(f"Ошибка при генерации страницы: {str(e)}")

