from flask import request
from flask_socketio import SocketIO, emit, send
import logging

from apps.logger import get_function_name
from apps.functions import add_new_record, get_app_rating, get_review_list

logger = logging.getLogger(__name__)

# socketio = SocketIO(app)  # подключаем работу в режиме WebSocket
socketio = SocketIO(cors_allowed_origins='*', logger=True, engineio_logger=True)

# ----------------------------------------------------------------
#  Обработка запросов через WEBSocket
# ----------------------------------------------------------------

# # Обработка корневого запроса на WebSocket
# @app.route('/ws')
# def ws_route():
#     return socketio.handle_ws_connect(request)


# Устанавливаем обработчик события при установке соединения по WebSockets
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
    logger.error(f'ОШИБКА: {request.event["message"]}')
    logger.error(f'Аргументы: {request.event["args"]}')


@socketio.on('get_rating')
def handle_ws_get_rating(json):

    logger.debug(f"Вызвана функция '{get_function_name()}'")
    logger.debug(f'Получены данные: {json}')
    result = get_app_rating(json)

    logger.debug(f'Отправляемые данные: {result}')
    emit('get_rating_response', result)


@socketio.on('new_record')
def handle_ws_new_record(data):

    logger.debug(f"Вызвана функция '{get_function_name()}'")
    logger.debug(f'Получены данные: {data}')
    result = add_new_record(data)

    logger.debug(f'Отправляемые данные: {result}')
    emit('new_record_response', result)


@socketio.on('reviews_list')
def handle_ws_reviews_list(data):

    logger.debug(f"Вызвана функция '{get_function_name()}'")
    logger.debug(f'Получены данные: {data}')
    result = get_review_list(data)

    logger.debug(f'Отправляемые данные: {result}')
    emit('reviews_list_response', result)

