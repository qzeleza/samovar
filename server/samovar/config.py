import os, random, string


class Config(object):
    basedir = os.path.abspath(os.path.dirname(__file__))

    # Файл конфигурации всех существующих приложений для инициализации БД
    FILE_CONFIG = './data/apps.ini'
    # Формат даты и времени для логирования
    DATE_FORMAT = "%d-%m-%Y %H:%M:%S"
    JSON_DATE_FORMAT = '%d %B %Y'

    # Секретный ключ
    SECRET_KEY = os.getenv('SECRET_KEY', 'secret_key')
    BOT_TOKEN = "6214126365:AAEVpcdojvmA47fF8afczPSI_zgJ1ueZTJ0"
    CHAT_ID = "-878944874"

    # Хост и адрес на котором работает API
    HOST = '0.0.0.0'
    PORT = 61116

    # Корневой запрос для всех запросов в текущую версию API
    RESTAPI_ROOT_PATH = "/api/v1/"

    # Имена шаблонов таблиц для предоставления данных о рейтингах
    RATING_TEMPLATE_NAME = 'ratings.html'
    REVIEWS_TEMPLATE_NAME = 'reviews.html'

    # Ключи для доменного имени api.zeleza.ru
    CERT_PEM = basedir + '/certs/api.zeleza.ru.crt'
    CERT_KEY = basedir + '/certs/api.zeleza.ru.key'

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    USE_SQLITE = True


def db_init(stage, basedir):
    db_name = os.path.join(basedir, 'databases/samovar_' + stage + '.db')
    return 'sqlite:///' + db_name, db_name


class ProductionConfig(Config):
    DEBUG = False
    STAGE = 'dev'
    SQLALCHEMY_DATABASE_URI, DATABASE_PATH = db_init(STAGE, Config.basedir)


class DebugConfig(Config):
    DEBUG = True
    # Приставка к имени БД в режиме отладки
    STAGE = 'test'
    # порт на котором запускается API в режиме отладки
    PORT = 11211
    # Конфигурация логирования
    NUM_LOG_BACKUPS = 3
    MAX_LOG_SIZE = 15000
    LOG_DEBUG_FILE = Config.basedir + '/logs/ws.log'

    SQLALCHEMY_DATABASE_URI, DATABASE_PATH = db_init(STAGE, Config.basedir)


# Load all possible configurations
config_dict = {
    'Production': ProductionConfig,
    'Debug': DebugConfig
}
