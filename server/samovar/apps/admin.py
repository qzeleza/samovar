# -*- coding: utf-8 -*-
# ------------------------------------------------------------------------------
#
#       Здесь описаны функции для управления БД
#
# ------------------------------------------------------------------------------
from flask import request, jsonify, render_template
import math
# подключаем логирование в данном файле
import logging
from apps.logger import get_function_name

logger = logging.getLogger(__name__)
from apps.models import (
    Applications,
    Versions,
    Users,
    RouterModels,
    Devices,
    ReviewTypes,
    Reviews,
)

from apps.restapi import get_last_version
from apps.database import (
    get_app_record,
    get_ver_record
)
from config import Config


# ------------------------------------------------------------------------------
# Выводим в табличном виде общую информацию о рейтингах приложений
# ------------------------------------------------------------------------------
def show_apps_summary():
    logger.debug(f"Вызвана функция '{get_function_name()}'")
    try:
        tb_reviews = Reviews.query.filter(Reviews.rating > 0).all()
        apps = {}

        for r in tb_reviews:
            tb_version = Versions.query.filter_by(id=r.ver_id).first()
            tb_app = Applications.query.filter_by(id=tb_version.app_id).first()
            app_key = (tb_app.eng_name, tb_version.version, r.ver_id)
            apps.setdefault(app_key, []).append(r.rating)

        avg_ratings = {}

        for app_key, app_ratings in apps.items():
            avg_rating = math.ceil(sum(app_ratings) / len(app_ratings))
            num_votes = len(app_ratings)
            num_reviews = sum(1 for rec in tb_reviews if rec.ver_id == app_key[2] and rec.review)
            avg_ratings[app_key] = {
                'avg_rating': avg_rating,
                'num_votes': num_votes,
                'num_reviews': num_reviews
            }

        sorted_avg_ratings = sorted(avg_ratings.items(), key=lambda x: x[0], reverse=True)
        return render_template(Config.RATING_TEMPLATE_NAME, ratings=sorted_avg_ratings)
    except Exception as e:
        logger.error(f"Ошибка при генерации страницы в show_apps_summary: {str(e)}")


# ------------------------------------------------------------------------------
# Выводим в табличном виде общую информацию об отзывах
# ------------------------------------------------------------------------------
def show_reviews_table(request):
    logger.debug(f"Вызвана функция '{get_function_name()}'")
    try:
        app_name = request.args.get('app_name')
        tb_reviews_query = Reviews.query
        # breakpoint()
        if app_name:
            _app = get_app_record(app_name)
            if _app and 'app' in _app:
                tb_app = _app['app']
                tb_reviews_query = tb_reviews_query.join(Versions, Versions.id == Reviews.ver_id).filter(
                    Versions.app_id == tb_app.id)

                tb_reviews = tb_reviews_query.all()

                apps = {}

                for r in tb_reviews:
                    tb_device = Devices.query.filter_by(id=r.device_id).first()
                    tb_user = Users.query.filter_by(id=tb_device.user_id).first()
                    tb_review_type = ReviewTypes.query.filter_by(id=r.type_id).first()
                    tb_router_model = RouterModels.query.filter_by(id=tb_device.model_id).first()
                    tb_version = Versions.query.filter_by(id=r.ver_id).first()

                    app_key = (app_name, tb_version.version) if app_name else ('All Apps', tb_version.version)
                    review_data = {
                        'date': r.date,
                        'review': r.review,
                        'email': tb_user.email,
                        'name': tb_user.full_name,
                        'type': tb_review_type.name,
                        'model': tb_router_model.model,
                        'device_id': tb_device.device_id,
                        'processor': tb_router_model.processor,
                    }
                    apps.setdefault(app_key, []).append(review_data)

                sorted_apps = sorted(apps.items(), key=lambda x: x[0], reverse=True)
                row_counts = {
                    app_key[0]: sum(len(reviews) for key, reviews in apps.items() if key[0] == app_key[0])
                    for app_key, reviews in apps.items()
                }

                return render_template(Config.REVIEWS_TEMPLATE_NAME, apps=dict(sorted_apps), row_counts=row_counts)
            else:
                err = f"{_app['description']}"
                logger.error(err)
                raise ValueError(err)

    except Exception as e:
        logger.error(f"Ошибка при генерации страницы в show_reviews_table: {str(e)}")


# ------------------------------------------------------------------------------
# Получаем полный список отзывав по имени и версии приложения в JSON формате
# ------------------------------------------------------------------------------
def get_review_list(data):
    logger.debug(f"Вызвана функция '{get_function_name()}'")
    app_name = data.get('app_name')

    voted = 0
    version = get_last_version(app_name)[app_name]
    result = {
        'success': False,
        'app_name': app_name,
        'rus_name': 'н/д',
        'version': version,
        'voted': voted,
        'review_list': []
    }

    if version:
        tb_app = Applications.query.filter_by(eng_name=app_name).first()

        if tb_app:
            result['rus_name'] = tb_app.rus_name
            tb_ver = get_ver_record(tb_app, version)
            reviews = Reviews.query.filter_by(ver_id=tb_ver.id).all()
            review_list = []

            if reviews:
                voted = len(reviews)

                for r in reviews:
                    tb_review_type = ReviewTypes.query.filter_by(id=r.type_id).first()
                    tb_device = Devices.query.filter_by(id=r.device_id).first()
                    tb_router = RouterModels.query.filter_by(id=tb_device.model_id).first()
                    tb_user = Users.query.filter_by(id=tb_device.user_id).first()

                    review_list.append({
                        'email': tb_user.email,
                        'name': tb_user.full_name,
                        'model': tb_router.model,
                        'device_id': tb_device.device_id,
                        'processor': tb_router.processor,
                        'type_review': tb_review_type.name,
                        'review': r.review,
                        'rating': r.rating,
                        'date': r.date.strftime(Config.DATE_FORMAT),
                    })

                logger.debug("Формирование списка отзывов успешно завершено.")
            else:
                logger.debug("Формирование списка отзывов завершено с нулевым результатом.")

            result.update({
                'success': True,
                'app_name': app_name,
                'version': version,
                'voted': voted,
                'review_list': review_list
            })
            return result
        else:
            logger.debug("Формирование списка отзывов завершено с нулевым результатом.")
            return result
    else:
        logger.debug("Формирование списка отзывов завершено с нулевым результатом.")
        return result
