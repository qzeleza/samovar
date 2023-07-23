from flask import request, jsonify
import logging

from apps.decorators import check_data_and_key
from apps.logger import get_function_name
from apps.functions import show_apps_summary, show_reviews_table, add_new_record, get_app_rating, get_review_list

logger = logging.getLogger(__name__)


def register_routes(app, root_path):
    # Маршрут для получения подсчитанного рейтинга для конкретного приложения
    # Маршрут для получения подсчитанного рейтинга для конкретного приложения
    @app.route(root_path + '/get_rating', methods=['POST'])
    def get_rating_route():
        logger.debug(f"Вызвана функция '{get_function_name()}'")
        logger.debug(f"Отправлен ответ через restapi")
        return jsonify(get_app_rating(request.json))

    # Маршрут для добавления новой оценки и отзыва пользователя
    @app.route(root_path + '/new_record', methods=['POST'])
    def get_new_record_route():
        # breakpoint()
        logger.debug(f"Вызвана функция '{get_function_name()}'")
        logger.debug(f"Отправлен ответ через restapi")
        return jsonify(add_new_record(request.json))

    # Маршрут для получения списка всех отзывов для конкретного приложения
    @app.route(root_path + '/reviews_list', methods=['POST'])
    def get_review_list_route():
        logger.debug(f"Вызвана функция '{get_function_name()}'")
        logger.debug(f"Отправлен ответ через restapi")
        return jsonify(get_review_list(request.json))

    # Маршрут для просмотра агрегированной информации о предложениях
    @app.route(root_path + '/reviews_table_page', methods=['GET'])
    @check_data_and_key
    def show_reviews_table_route():
        logger.debug(f"Вызвана функция '{get_function_name()}'")
        return show_reviews_table(request)

    # Маршрут для просмотра списка всех приложений и их среднего рейтинга в браузере
    @app.route(root_path + '/summary_table_page', methods=['GET'])
    @check_data_and_key
    def show_apps_summary_route():
        logger.debug(f"Вызвана функция '{get_function_name()}'")
        return show_apps_summary()
