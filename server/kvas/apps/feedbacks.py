from flask import request, jsonify
from flask_socketio import emit, send

from apps.logger import get_function_name
from apps.functions import apps_update
import logging

logger = logging.getLogger(__name__)


def register_routes(app, socketio, root_path):
    register_ws_basis(socketio)
    # Маршрут для получения подсчитанного рейтинга для конкретного приложения
    # Маршрут для получения подсчитанного рейтинга для конкретного приложения
    @app.route(root_path + '/update', methods=['POST'])
    def get_rating_route():
        logger.debug(f"Вызвана функция '{get_function_name()}'")
        return jsonify(apps_update(request.json))

    @socketio.on('get_rating')
    def handle_ws_get_rating(json):
        logger.debug(f"Вызвана функция '{get_function_name()}'")

        result = apps_update(json)
        socketio.emit('apps_update_response', result)




def register_ws_basis(socketio):
    @socketio.on('connect')
    # @check_data_and_key
    def handle_ws_connect(auth):
        # breakpoint()
        desc = "Соединение установлено"
        logger.debug(desc)
        emit('welcome', {'success': True, 'description': desc})


    # Устанавливаем обработчик события при установке соединения по WebSockets
    @socketio.on('disconnect')
    def handle_ws_disconnect():
        desc = "Соединение разорвано."
        logger.debug(desc)
        emit('welcome', {'success': True, 'description': desc})


    # Стандартный обработчик ошибок для WebSocket
    @socketio.on_error_default
    def default_error_handler(e):
        logger.debug(f"Вызвана функция '{get_function_name()}'")
        logger.error(f'ОШИБКА: {request.event["message"]}')
        logger.error(f'Аргументы: {request.event["args"]}')


