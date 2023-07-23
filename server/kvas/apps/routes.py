from flask import request, jsonify

from apps.logger import get_function_name
from apps.functions import apps_update
import logging

logger = logging.getLogger(__name__)


def register_routes(app, root_path):
    # Маршрут для получения подсчитанного рейтинга для конкретного приложения
    # Маршрут для получения подсчитанного рейтинга для конкретного приложения
    @app.route(root_path + '/update', methods=['POST'])
    def get_rating_route():
        logger.debug(f"Вызвана функция '{get_function_name()}'")
        return jsonify(apps_update(request.json))

