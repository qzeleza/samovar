import os


class Config(object):

    basedir = os.path.abspath(os.path.dirname(__file__))
    DATE_FORMAT = "%d-%m-%Y %H:%M:%S"

    # Set up the App SECRET_KEY
    SECRET_KEY = os.getenv('SECRET_KEY', 'secret_key')
    BOT_TOKEN = "6214126365:AAEVpcdojvmA47fF8afczPSI_zgJ1ueZTJ0"
    CHAT_ID = "-878944874"

    HOST = '0.0.0.0'
    PORT = 33666

    RESTAPI_ROOT_PATH = "/kvas/v1/"

    CERT_PEM = basedir + '/certs/api.zeleza.ru.crt'
    CERT_KEY = basedir + '/certs/api.zeleza.ru.key'


class ProductionConfig(Config):
    DEBUG = False
    STAGE = 'dev'


class DebugConfig(Config):
    DEBUG = True
    STAGE = 'test'
    NUM_LOG_BACKUPS = 3
    MAX_LOG_SIZE = 15000
    LOG_DEBUG_FILE = Config.basedir + '/logs/ws.log'


# Load all possible configurations
config_dict = {
    'Production': ProductionConfig,
    'Debug': DebugConfig
}
