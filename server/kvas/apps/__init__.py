from flask import Flask
import os
from flask_cors import CORS
import logging

from apps.routes import register_routes
from apps.sockets import socketio

logger = logging.getLogger(__name__)


# Инициализация экземпляра приложения
def create_app(config):
    # Регистрация приложения Flask
    try:
        template_dir = os.path.abspath('templates')
        app = Flask(__name__, template_folder=template_dir)
        app.config.from_object(config)
        logger.debug("Конфигурация создана успешно")
    except Exception as e:
        error = f'При конфигурации приложения возникли ошибки: {str(e)}'
        logger.debug(error)
        return False

    # Обеспечиваем безопасность при передаче заголовком
    try:
        CORS(app)
        logger.debug("Заголовки CORS установлены успешно")
    except Exception as e:
        error = f'При установке CORS заголовков возникли ошибки: {str(e)}'
        logger.debug(error)
        return False

    try:
        # Инициализация WebSocket
        socketio.init_app(app)
        logger.debug("Инициализация WebSocket прошла успешно")
    except Exception as e:
        error = f'При инициализации WebSocket возникли ошибки: {str(e)}'
        logger.debug(error)
        return False

    try:
        # breakpoint()
        # Регистрация путепроводов и передача аргументов app и root_path
        register_routes(app, app.config['RESTAPI_ROOT_PATH'])
        logger.debug("Регистрация RestAPI запросов прошла успешно")
    except Exception as e:
        error = f'При регистрации RestAPI запросов возникли ошибки: {str(e)}'
        logger.debug(error)
        return False

    return app
