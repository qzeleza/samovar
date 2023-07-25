from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

# -----------------------------------------------------------------------
#
#   Описание БД
#
# -----------------------------------------------------------------------

# Префикс БД
database = SQLAlchemy()


class Applications(database.Model):
    __tablename__ = 'applications'
    id = database.Column(database.Integer, primary_key=True)
    name = database.Column(database.String(100), nullable=False)
    version = database.Column(database.String(80), nullable=False)

    def __init__(self, name, version):
        self.name = name
        self.version = version


class ReviewTypes(database.Model):
    __tablename__ = 'router_types'
    id = database.Column(database.Integer, primary_key=True)
    desc = database.Column(database.String(100), nullable=False)

    def __init__(self, type):
        self.desc = type


class RouterModels(database.Model):
    __tablename__ = 'router_models'
    id = database.Column(database.Integer, primary_key=True)
    model = database.Column(database.String(50), index=True, nullable=False)
    processor = database.Column(database.String(20), nullable=False)

    def __init__(self, model, processor):
        self.model = model
        self.processor = processor


class Users(database.Model):
    __tablename__ = 'users'
    id = database.Column(database.Integer, primary_key=True)
    email = database.Column(database.String(120), unique=True, nullable=False)
    full_name = database.Column(database.String(150), nullable=False)

    def __init__(self, email, full_name):
        self.email = email
        self.full_name = full_name

class Devices(database.Model):
    __tablename__ = 'devices'
    id = database.Column(database.Integer, primary_key=True)
    model_id = database.Column(database.Integer, database.ForeignKey('router_models.id'), nullable=False)
    user_id = database.Column(database.Integer, database.ForeignKey('users.id'), nullable=False)
    device_id = database.Column(database.String(100), nullable=False) # обезличенный идентификатор устройства

    def __init__(self, model_id, user_id, device_id):
        self.model_id = model_id
        self.user_id = user_id
        self.device_id = device_id



class Reviews(database.Model):
    __tablename__ = 'reviews'
    id = database.Column(database.Integer, primary_key=True)
    date = database.Column(database.DateTime, default=datetime.utcnow)
    review = database.Column(database.String(4000))
    rating = database.Column(database.Integer, index=True)
    type_id = database.Column(database.Integer, database.ForeignKey('router_types.id'), nullable=False)
    app_id = database.Column(database.Integer, database.ForeignKey('applications.id'), nullable=False)
    device_id = database.Column(database.Integer, database.ForeignKey('devices.id'), nullable=False)

    def __init__(self, date, review, rating, type_id, app_id, device_id):
        self.date = date
        self.review = review
        self.rating = rating
        self.type_id = type_id
        self.app_id = app_id
        self.device_id = device_id



