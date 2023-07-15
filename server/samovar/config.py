import os, random, string


class Config(object):
    basedir = os.path.abspath(os.path.dirname(__file__))

    # Assets Management
    # ASSETS_ROOT = os.getenv('ASSETS_ROOT', '/static/assets')
    DATE_FORMAT = "%d-%m-%Y %H:%M:%S"

    # Set up the App SECRET_KEY
    SECRET_KEY = os.getenv('SECRET_KEY', 'secret_key')
    BOT_TOKEN = "6214126365:AAEVpcdojvmA47fF8afczPSI_zgJ1ueZTJ0"
    CHAT_ID = "-878944874"

    HOST = '0.0.0.0'
    PORT = 61116

    RESTAPI_ROOT_PATH = "/api/v1/"

    RATING_TEMPLATE_NAME = 'ratings.html'
    REVIEWS_TEMPLATE_NAME = 'reviews.html'

    CERT_PEM = 'certs/api.crt'
    CERT_KEY = 'certs/api.key'

    # if not SECRET_KEY:
    #     SECRET_KEY = ''.join(random.choice( string.ascii_lowercase  ) for i in range( 32 ))

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    USE_SQLITE = True


def db_init(stage, basedir):
    db_name = os.path.join(basedir, 'databases/samovar_' + stage + '.db')
    return 'sqlite:///' + db_name, db_name


class ProductionConfig(Config):
    DEBUG = False
    STAGE = 'dev'
    SQLALCHEMY_DATABASE_URI, DATABASE_PATH = db_init(STAGE, Config.basedir)

    # Security
    SESSION_COOKIE_HTTPONLY = True
    REMEMBER_COOKIE_HTTPONLY = True
    REMEMBER_COOKIE_DURATION = 3600


class DebugConfig(Config):
    DEBUG = True
    STAGE = 'test'
    NUM_LOG_BACKUPS = 3
    MAX_LOG_SIZE = 15000
    LOG_DEBUG_FILE = Config.basedir + '/logs/ws.log'
    SQLALCHEMY_DATABASE_URI, DATABASE_PATH = db_init(STAGE, Config.basedir)


# Load all possible configurations
config_dict = {
    'Production': ProductionConfig,
    'Debug': DebugConfig
}
