from flask import request
from flask_socketio import SocketIO, emit, send, join_room, leave_room
import logging

from apps.logger import get_function_name
from apps.functions import (
    add_new_record,
    get_app_rating,
    get_review_list,
    get_last_version
    )

logger = logging.getLogger(__name__)

socketio = SocketIO(logger=True, cors_allowed_origins='*', engineio_logger=True, async_mode='gevent')

# Словарь для отслеживания активных WebSocket соединений
active_connections = {}


# Функция для добавления WebSocket соединения в словарь
def add_connection(sid):
    active_connections[sid] = True


# Функция для удаления WebSocket соединения из словаря
def remove_connection(sid):
    if sid in active_connections:
        del active_connections[sid]


def send_back(request, result):
    # Получаем тип пришедшего сообщения
    message_type = request.event["message"].split(' ')[0]

    # Формируем новый тип сообщения, добавив "_response" к текущему типу
    response_message_type = f"{message_type}_response"

    emit(response_message_type, result, room=request.sid)


def send_to_log(name_func, data):
    logger.debug(f"Вызвана функция '{name_func}'")
    logger.debug(f'Получены данные: {data}')


# ----------------------------------------------------------------
#  Обработка запросов через WebSocket
# ----------------------------------------------------------------

@socketio.on('connect')
def handle_ws_connect():
    sid = request.sid
    add_connection(sid)
    desc = "Соединение установлено"
    logger.debug(f'Заголовки:\n{request.headers}')
    logger.debug(desc)
    emit('welcome', {'success': True, 'description': desc})


@socketio.on('disconnect')
def handle_ws_disconnect():
    sid = request.sid
    remove_connection(sid)
    desc = "Соединение разорвано."
    logger.debug(desc)
    emit('goodbye', {'success': True, 'description': desc})


# breakpoint()

@socketio.on('get_rating')
def handle_ws_get_rating(json):
    send_to_log(get_function_name(), json)

    result = get_app_rating(json)

    logger.debug(f'Отправляемые данные: {result}')
    send_back(request, result)


@socketio.on('get_last_version')
def handle_ws_get_rating(json):
    send_to_log(get_function_name(), json)
    # breakpoint()
    last_version = get_last_version(json.get('app_name'))
    result = {'version': last_version}

    logger.debug(f'Отправляемые данные: {result}')
    send_back(request, result)


@socketio.on('new_record')
def handle_ws_new_record(data):
    send_to_log(get_function_name(), data)

    result = add_new_record(data)

    logger.debug(f'Отправляемые данные: {result}')
    send_back(request, result)


@socketio.on('reviews_list')
def handle_ws_reviews_list(data):
    send_to_log(get_function_name(), data)

    result = get_review_list(data)

    logger.debug(f'Отправляемые данные: {result}')
    send_back(request, result)


# Стандартный обработчик ошибок для WebSocket
@socketio.on_error_default
def default_error_handler(e):
    logger.error(f'ОШИБКА: {e}')
    logger.error(f'ОШИБКА: {request.event["message"]}')
    logger.error(f'Аргументы: {request.event["args"]}')
