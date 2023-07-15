from flask import request, jsonify
from flask_socketio import SocketIO, emit, send
import logging

from apps.logger import get_function_name
from apps.functions import add_new_record, get_app_rating, get_review_list

logger = logging.getLogger(__name__)

# create a Socket.IO server
# socketio = SocketIO()  # подключаем работу в режиме WebSocket
# socketio = SocketIO(logger=True, engineio_logger=True)
socketio = SocketIO(logger=True, cors_allowed_origins='*', engineio_logger=True, async_mode='gevent')


# socketio = SocketIO(logger=True, cors_allowed_origins='*', engineio_logger=True, async_mode='eventlet')

# ----------------------------------------------------------------
#  Обработка запросов через WEBSocket
# ----------------------------------------------------------------
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
    # breakpoint()
    logger.debug(f"Вызвана функция '{get_function_name()}'")
    logger.debug(f'Получены данные: {json}')
    result = get_app_rating(json)

    logger.debug(f'Отправляемые данные: {result}')
    socketio.emit('get_rating_response', result)


@socketio.on('new_record')
def handle_ws_new_record(data):
    logger.debug(f"Вызвана функция '{get_function_name()}'")
    logger.debug(f'Получены данные: {data}')
    # breakpoint()
    result = add_new_record(data)

    logger.debug(f'Отправляемые данные: {result}')
    socketio.emit('new_record_response', result)


@socketio.on('reviews_list')
def handle_ws_reviews_list(data):
    logger.debug(f"Вызвана функция '{get_function_name()}'")
    logger.debug(f'Получены данные: {data}')

    result = get_review_list(data)
    # breakpoint()
    logger.debug(f'Отправляемые данные: {result}')

    socketio.emit('reviews_list_response', result)
