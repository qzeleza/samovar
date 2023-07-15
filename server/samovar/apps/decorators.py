from functools import wraps
import inspect
from flask import request, jsonify
from config import Config

import logging
logger = logging.getLogger(__name__)


# Декоратор для проверки на тип передаваемых данных
def check_data_and_key(f):
    @wraps(f)
    async def decorated_function(*args, **kwargs):

        # Проверка ключа запроса для GET-запроса
        if request.method == 'GET':
            _key = request.args.get('key')

        # Проверка ключа запроса для POST-запроса
        elif request.method == 'POST':
            _key = request.form.get('key')

        # Проверка ключа запроса для WebSocket-запроса
        elif socketio_handler:
            _key = request.get('key')

        if _key is not None:
            if Config.SECRET_KEY == _key:
                if inspect.iscoroutinefunction(f):
                    logger.debug(f"Ключ указан верно - вызываем асинхронную функцию {f.__name__}")
                    return await f(*args, **kwargs)
                else:
                    logger.debug(f"Ключ указан верно - вызываем обыкновенную функцию {f.__name__}")
                    return f(*args, **kwargs)
            else:
                error = "Указан неверный секретный ключ!"
                logger.error(error)
                return jsonify({'success': False, 'description': error})
        else:
            error = "Не удалось получить секретный ключ!"
            logger.error(error)
            return jsonify({'success': False, 'description': error})

    socketio_handler = True if hasattr(f, 'socketio_handler') else False

    return decorated_function
