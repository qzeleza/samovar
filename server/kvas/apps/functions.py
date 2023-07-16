import logging

from apps.logger import get_function_name
from config import Config

logger = logging.getLogger(__name__)

# Инициализируем телеграм бот
from telegram import Bot
bot = Bot(Config.BOT_TOKEN)
def send_tel_message(mess):
    try:
        bot.send_message(chat_id=Config.CHAT_ID, text=mess)
    except Exception as e:
        logger.debug(f"Сообщение в Telegram не было отправлено: {str(e)}")


# Получаем рейтинг по имени и номеру версии
def apps_update(data):
    logger.debug(f"Вызвана функция '{get_function_name()}'")
    app_name = data.get('app_name')

    logger.debug(f'Успешная обработка данных завершена.')
    return {
        'app_name': app_name,
        'update': True if app_name == 'kvas' else False,
        'version': '1.4' if app_name == 'kvas' else ('1.0.1' if app_name == 'samovar' else None),
    }
