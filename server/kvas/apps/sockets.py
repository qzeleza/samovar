from flask import request
from flask_socketio import emit, send
from flask_socketio import SocketIO

from apps.logger import get_function_name
from apps.functions import (
    apps_update, get_router_data,
    get_app_history, get_apps_data
)

import logging

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


# @socketio.on_event(namespace='/socket.io')
# def send_unknown_message_error(request, error_message):
#     breakpoint()
#     response_message_type = f"wrong_message_response"
#     emit(response_message_type, {'success': False, 'description': error_message}, room=request.sid)


def send_back(request, result):
    # Получаем тип пришедшего сообщения
    message_type = request.event["message"].split(' ')[0]

    # if message_type not in socketio.server.handlers['/']:
    #     send_unknown_message_error(request, message_type)
    #     return

    # Формируем новый тип сообщения, добавив "_response" к текущему типу
    response_message_type = f"{message_type}_response"

    emit(response_message_type, result, room=request.sid)


@socketio.on('get_apps_data')
def handle_ws_get_apps_data(json):
    logger.debug(f"Вызвана функция '{get_function_name()}'")
    # breakpoint()
    result = get_apps_data()
    send_back(request, result)


@socketio.on('get_app_history')
def handle_ws_get_app_history(json):
    logger.debug(f"Вызвана функция '{get_function_name()}'")
    # breakpoint()
    result = get_app_history(json)
    send_back(request, result)


@socketio.on('update')
def handle_ws_get_rating(json):
    logger.debug(f"Вызвана функция '{get_function_name()}'")
    # breakpoint()
    result = apps_update(json)
    send_back(request, result)


@socketio.on('get_router_data')
def handle_ws_get_rating(json):
    logger.debug(f"Вызвана функция '{get_function_name()}'")
    # breakpoint()
    result = get_router_data()
    send_back(request, result)


@socketio.on('connect')
def handle_ws_connect():
    sid = request.sid
    add_connection(sid)
    desc = "Соединение установлено"
    logger.debug(f'Заголовки {request.headers}')
    logger.debug(desc)
    emit('welcome', {'success': True, 'description': desc})


@socketio.on('disconnect')
def handle_ws_disconnect():
    sid = request.sid
    remove_connection(sid)
    desc = "Соединение разорвано."
    logger.debug(desc)
    emit('goodbye', {'success': True, 'description': desc})


# Стандартный обработчик ошибок для WebSocket
@socketio.on_error_default
def default_error_handler(e):
    logger.debug(f"Вызвана функция '{get_function_name()}'")
    error_message = f"Ошибка: {e}"
    logger.error(error_message)
    logger.error(f'Сообщение: {request.event["message"]}')
    logger.error(f'Аргументы: {request.event["args"]}')
