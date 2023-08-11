from flask import request, jsonify

from apps.logger import get_function_name
from apps.functions import (
    apps_update, get_router_data,
    get_app_history, get_apps_data
)
import logging

logger = logging.getLogger(__name__)


def register_routes(app, root_path):

    # Путь для обработки истории версий приложения
    @app.route(root_path + '/get_app_history', methods=['POST'])
    def get_app_history_route():
        logger.debug(f"Вызвана функция '{get_function_name()}'")
        return jsonify(get_app_history(request.json))

    # Маршрут для получения подсчитанного рейтинга для конкретного приложения
    @app.route(root_path + '/update', methods=['POST'])
    def get_rating_route():
        logger.debug(f"Вызвана функция '{get_function_name()}'")
        return jsonify(apps_update(request.json))

    # Маршрут для получения данных об устройстве
    @app.route(root_path + '/get_router_data', methods=['POST'])
    def get_device_data_route():
        logger.debug(f"Вызвана функция '{get_function_name()}'")
        return jsonify(get_router_data())

    # Маршрут получения данных о приложении
    @app.route(root_path + '/get_apps_data', methods=['POST'])
    def get_apps_data_route():
        logger.debug(f"Вызвана функция '{get_function_name()}'")
        return jsonify(get_apps_data())
