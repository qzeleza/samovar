from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

# -----------------------------------------------------------------------
#
#   Описание БД
#
# -----------------------------------------------------------------------

# Префикс БД
database = SQLAlchemy()


# Определение модели для хранения оценок и отзывов пользователей
class Rating(database.Model):
    id = database.Column(database.Integer, primary_key=True)
    app_name = database.Column(database.String(80), index=True)
    name = database.Column(database.String(80))
    email = database.Column(database.String(120))
    review = database.Column(database.String(1000))
    rating = database.Column(database.Integer, index=True)
    date = database.Column(database.DateTime, default=datetime.utcnow)
    version = database.Column(database.String(80), index=True)

    def __init__(self, app_name, name, email, review, rating, version):
        self.app_name = app_name
        self.name = name
        self.email = email
        self.review = review
        self.rating = rating
        self.version = version
