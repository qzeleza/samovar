from flask import Flask
import os
from flask_cors import CORS

from apps.events import socketio
from apps.database import database
from apps.routes import register_routes


# Инициализация БД
def init_database(app):
    database.init_app(app)
    # Создание базы данных в случае ее отсутствия на диске при первом запуске
    if not os.path.exists(app.config['DATABASE_PATH']):
        with app.app_context():
            database.create_all()


# Инициализация экземпляра приложения
def create_app(config):

    # Регистрация приложения Flask
    template_dir = os.path.abspath('templates')
    app = Flask(__name__, template_folder=template_dir)
    app.config.from_object(config)
    # Обеспечиваем безопасность при передаче заголовком
    CORS(app)
    # Регистрация БД
    init_database(app)
    # Инициализация WebSocket
    socketio.init_app(app)
    # breakpoint()
    # Регистрация путепроводов и передача аргументов app и root_path
    register_routes(app, app.config['RESTAPI_ROOT_PATH'])

    return app
