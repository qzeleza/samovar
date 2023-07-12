import os, math
from telegram import Bot
from flask import request, jsonify, render_template
import logging

from apps.logger import get_function_name
from apps.database import Rating, database as db
from config import Config

logger = logging.getLogger(__name__)

# Инициализируем телеграм бот
bot = Bot(Config.BOT_TOKEN)


# проверяем есть ли в БД записи
def check_db_for_empty(app_name, version):
    # проверяем передан ли номер версии программы
    first_rec_of_version = Rating.query.filter_by(app_name=app_name, version=version).first()
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
        last_version = db.session.query(db.func.max(Rating.version)).filter(Rating.app_name == app_name).scalar()
        if last_version:
            logger.debug(f'В БД была найдена {last_version} версия приложения {app_name}')
            version = last_version
    return version


# Получаем рейтинг по имени и номеру версии
async def get_app_rating(data):
    logger.debug(f"Вызвана функция '{get_function_name()}'")
    app_name = data.get('app_name')
    version = data.get('version')

    version = get_version(app_name, version)

    ratings = Rating.query.filter_by(app_name=app_name, version=version).all()
    for r in ratings:
        if r.rating == 'null':
            logger.debug(f'Обнаружена запись с рейтингом = null, установлена на 0')
            r.rating = 0
    db.session.commit()

    if ratings:
        voted = len(ratings)
        avg_rating = math.ceil(sum([r.rating for r in ratings]) / voted)
        # await bot.send_message(chat_id=CHAT_ID, text=f'Статистика по {app_name}:\nСредняя оценка: {
        # avg_rating}\nЧисло голосов: {voted}')
        logger.debug(f'Успешная обработка данных завершена.')
        return jsonify({
            'app_name': app_name,
            'rating': avg_rating,
            'voted': voted,
            'version': version,
        })
    else:
        logger.debug('Обработка данных завершена с нулевым результатом.')
        return jsonify({
            'app_name': app_name,
            'rating': None,
            'voted': None,
            'version': None
        })


# Добавляем новый отзыв или новый рейтинг в БД
async def add_new_record(data):
    logger.debug(f"Вызвана функция '{get_function_name()}'")

    app_name = data.get('app_name')
    name = data.get('name')
    email = data.get('email')
    review = data.get('review')
    rating = data.get('rating') or 0
    version = data.get('version')

    version = get_version(app_name, version)

    if app_name and rating and version:
        try:
            new_rating = Rating(app_name, name, email, review, rating, version)
            db.session.add(new_rating)
            db.session.commit()
            logger.debug('Данные в БД успешно добавлены')
        except Exception as e:
            error = f'Данные в БД добавлены не были: {str(e)}'
            logger.debug(error)
            return jsonify({'success': False, 'description': error})
        try:
            await bot.send_message(chat_id=Config.CHAT_ID, text=f'Новый отзыв на {app_name}:\n'
                                                                f'Имя: {name}\n'
                                                                f'Email: {email}\n'
                                                                f'Отзыв: {review}\n'
                                                                f'Рейтинг: {rating}\n'
                                                                f'Версия: {version}')
        except Exception as e:
            logger.debug(f"Сообщение в Telegram не было отправлено: {str(e)}")

        return jsonify({'success': True, 'description': "Запись добавлена."})
    else:
        error = "Один из параметров не задан: app_name или rating или version"
        logger.debug(error)
        return jsonify({'success': False, 'description': error})


# Получаем полный список отзывав по имени и версии приложения в JSON формате
def get_review_list(data):

    logger.debug(f"Вызвана функция '{get_function_name()}'")
    app_name = data.get('app_name')
    version = data.get('version')

    # проверяем передан ли номер версии программы
    check_db_for_empty(app_name, version)

    ratings = Rating.query.filter_by(app_name=app_name, version=version).all()
    reviews = []
    if ratings:
        for r in ratings:
            reviews.append({
                'name': r.name,
                'email': r.email,
                'review': r.review,
                'rating': r.rating,
                'date': r.date,
                'version': r.version
            })
        logger.debug("Формирование списка отзывов успешно завершено.")
        return jsonify({'reviews': reviews})
    else:
        logger.debug("Формирование списка отзывов завершено с нулевым результатом.")
        return jsonify({'rating': None, 'voted': None, 'version': None, 'review': None})


def show_apps_summary():

    logger.debug(f"Вызвана функция '{get_function_name()}'")
    try:
        ratings = Rating.query.filter(Rating.rating > 0).all()
        apps = {}
        for r in ratings:
            app_key = (r.app_name, r.version)
            apps.setdefault(app_key, []).append(r.rating)

        avg_ratings = {
            app_key: {
                'avg_rating': math.ceil(sum(app_ratings) / len(app_ratings)),
                'num_votes': len(app_ratings),
                'num_reviews': sum(1 for r in ratings if r.app_name == app_key[0] and r.version == app_key[1] and r.review)
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
        ratings = (
            Rating.query.filter_by(app_name=app_name).all()
            if app_name
            else Rating.query.all()
        )
        apps = {}
        for r in ratings:
            app_key = (r.app_name, r.version)
            apps.setdefault(app_key, []).append(r)

        sorted_apps = sorted(apps.items(), key=lambda x: x[0], reverse=True)
        row_counts = {
            app_key[0]: sum(len(reviews) for key, reviews in apps.items() if key[0] == app_key[0])
            for app_key, reviews in apps.items()
        }

        return render_template(Config.REVIEWS_TEMPLATE_NAME, apps=dict(sorted_apps), row_counts=row_counts)
    except Exception as e:
        logger.error(f"Ошибка при генерации страницы: {str(e)}")


# # просмотр списка всех приложений и их среднего рейтинга в браузере
# def show_apps_summary():
#     logger.debug(f"Вызвана функция '{get_function_name()}'")
#     # breakpoint()
#     # ratings = Rating.query.all()
#     ratings = Rating.query.filter(Rating.rating > 0).all()
#     apps = {}
#     for r in ratings:
#         app_key = (r.app_name, r.version)
#         if app_key not in apps:
#             apps[app_key] = []
#         apps[app_key].append(r.rating)
#     avg_ratings = {}
#
#     for app_key, app_ratings in apps.items():
#         # breakpoint()
#         avg_ratings[app_key] = {
#             'avg_rating': math.ceil(sum(app_ratings) / len(app_ratings)),
#             'num_votes': len(app_ratings),
#             'num_reviews': len(
#                 [r for r in ratings if r.app_name == app_key[0] and r.version == app_key[1] and r.review])
#         }
#
#     sorted_avg_ratings = sorted(avg_ratings.items(), key=lambda x: (x[0][0], x[0][1]), reverse=True)
#     return render_template(Config.RATING_TEMPLATE_NAME, ratings=sorted_avg_ratings)
#
#
# # Отображаем страницу с таблицей всех отзывов сгруппированных по приложению и версии
# def show_reviews_table(request):
#     logger.debug(f"Вызвана функция '{get_function_name()}'")
#     # data = request.get_json()
#     app_name = request.args.get('app_name')
#     ratings = Rating.query.filter_by(app_name=app_name).all() if app_name else Rating.query.all()
#     apps = {}
#     for r in ratings:
#         app_key = (r.app_name, r.version)
#         if app_key not in apps:
#             apps[app_key] = []
#         apps[app_key].append(r)
#     sorted_apps = sorted(apps.items(), key=lambda x: (x[0][0], x[0][1]), reverse=True)
#     row_counts = {app_key[0]: sum([len(reviews) for key, reviews in apps.items() if key[0] == app_key[0]]) for
#                   app_key, reviews in apps.items()}
#     # breakpoint()
#     return render_template(Config.REVIEWS_TEMPLATE_NAME, apps=dict(sorted_apps), row_counts=row_counts)
