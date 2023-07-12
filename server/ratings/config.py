import os, random, string


class Config(object):
    basedir = os.path.abspath(os.path.dirname(__file__))

    # Assets Management
    # ASSETS_ROOT = os.getenv('ASSETS_ROOT', '/static/assets')

    # Set up the App SECRET_KEY
    SECRET_KEY = os.getenv('SECRET_KEY', 'secret_key')
    BOT_TOKEN = "6214126365:AAEVpcdojvmA47fF8afczPSI_zgJ1ueZTJ0"
    CHAT_ID = "-878944874"

    HOST = '0.0.0.0'
    PORT = 61116

    RESTAPI_ROOT_PATH = "/api/v1/"

    RATING_TEMPLATE_NAME = 'ratings.html'
    REVIEWS_TEMPLATE_NAME = 'reviews.html'

    # if not SECRET_KEY:
    #     SECRET_KEY = ''.join(random.choice( string.ascii_lowercase  ) for i in range( 32 ))

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # DB_ENGINE   = os.getenv('DB_ENGINE'   , None)
    # DB_USERNAME = os.getenv('DB_USERNAME' , None)
    # DB_PASS     = os.getenv('DB_PASS'     , None)
    # DB_HOST     = os.getenv('DB_HOST'     , None)
    # DB_PORT     = os.getenv('DB_PORT'     , None)
    # DB_NAME     = os.getenv('DB_NAME'     , None)

    USE_SQLITE = True

    # try to set up a Relational DBMS
    # if DB_ENGINE and DB_NAME and DB_USERNAME:
    #
    #     try:
    #
    #         # Relational DBMS: PSQL, MySql
    #         SQLALCHEMY_DATABASE_URI = '{}://{}:{}@{}:{}/{}'.format(
    #             DB_ENGINE,
    #             DB_USERNAME,
    #             DB_PASS,
    #             DB_HOST,
    #             DB_PORT,
    #             DB_NAME
    #         )
    #
    #         USE_SQLITE  = False
    #
    #     except Exception as e:
    #
    #         print('> Error: DBMS Exception: ' + str(e) )
    #         print('> Fallback to SQLite ')


def db_init(stage, basedir):
    db_name = os.path.join(basedir, 'apps/samovar_' + stage + '.db')
    return 'sqlite:///' + db_name, db_name


class ProductionConfig(Config):
    DEBUG = False
    STAGE = 'dev'
    SQLALCHEMY_DATABASE_URI, DATABASE_PATH = db_init(STAGE, Config.basedir)

    # Security
    # SESSION_COOKIE_HTTPONLY = True
    # REMEMBER_COOKIE_HTTPONLY = True
    # REMEMBER_COOKIE_DURATION = 3600


class DebugConfig(Config):
    DEBUG = True
    STAGE = 'test'
    NUM_LOG_BACKUPS = 3
    MAX_LOG_SIZE = 5000
    LOG_DEBUG_FILE = Config.basedir + '/logs/ws.log'
    SQLALCHEMY_DATABASE_URI, DATABASE_PATH = db_init(STAGE, Config.basedir)


# Load all possible configurations
config_dict = {
    'Production': ProductionConfig,
    'Debug': DebugConfig
}
