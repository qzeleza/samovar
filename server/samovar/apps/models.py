# -*- coding: utf-8 -*-
# ------------------------------------------------------------------------------
#
#       Здесь описаны содержание табличных данных БД
#
# ------------------------------------------------------------------------------
from sqlalchemy import Index, func

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
# подключаем логирование в данном файле
import logging
from apps.logger import get_function_name
logger = logging.getLogger(__name__)

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
    eng_name = database.Column(database.String(50), nullable=False, index=True, unique=True)
    rus_name = database.Column(database.String(50), nullable=False, unique=True)
    app_desc = database.Column(database.Text, nullable=False)
    available = database.Column(database.Boolean, default=False, nullable=False)
    app_full_desc = database.Column(database.Text, nullable=False)
    __table_args__ = (
        database.Index(func.lower(eng_name), func.lower(rus_name), unique=True),
        database.UniqueConstraint(eng_name, rus_name),
    )
    # __table_args__ = (database.UniqueConstraint(eng_name, rus_name),)

    def __init__(self, eng_name, rus_name, app_desc, app_full_desc):
        self.eng_name = eng_name
        self.rus_name = rus_name
        self.app_full_desc = app_full_desc
        self.app_desc = app_desc


class History(database.Model):
    __tablename__ = 'history'
    id = database.Column(database.Integer, primary_key=True)
    ver_id = database.Column(database.Integer, database.ForeignKey('versions.id'), nullable=False)
    item = database.Column(database.Text, nullable=False)
    __table_args__ = (
        database.Index(f'uniq_{__tablename__}_index', ver_id, func.lower(item), unique=True),
        database.UniqueConstraint(ver_id, item,),
    )
    # __table_args__ = (database.UniqueConstraint(ver_id, item,),)

    def __init__(self, ver_id, item):
        self.ver_id = ver_id
        self.item = item


class Versions(database.Model):
    __tablename__ = 'versions'
    id = database.Column(database.Integer, primary_key=True)
    app_id = database.Column(database.Integer, database.ForeignKey('applications.id'), nullable=False)
    version = database.Column(database.String(20), nullable=False)
    date = database.Column(database.DateTime, nullable=False, index=True)
    __table_args__ = (
        database.Index(f'uniq_{__tablename__}_index', app_id, func.lower(version), date, unique=True),
        database.UniqueConstraint(app_id, version, date),
    )
    # __table_args__ = (database.UniqueConstraint(app_id, version, date),)

    def __init__(self, app_id, version, date):
        self.app_id = app_id
        self.version = version
        self.date = date


class RouterModels(database.Model):
    __tablename__ = 'router_models'
    id = database.Column(database.Integer, primary_key=True)
    model = database.Column(database.String(50), nullable=False)
    processor = database.Column(database.String(20), nullable=False)
    __table_args__ = (
        database.Index(f'uniq_{__tablename__}_index', func.lower(model), func.lower(processor), unique=True),
        database.UniqueConstraint(model, processor,),
    )
    # __table_args__ = (database.UniqueConstraint(model, processor,),)

    def __init__(self, model, processor):
        self.model = model
        self.processor = processor


class Users(database.Model):
    __tablename__ = 'users'
    id = database.Column(database.Integer, primary_key=True)
    email = database.Column(database.String(120), unique=True, nullable=False)
    full_name = database.Column(database.String(150), nullable=False)
    __table_args__ = (
        database.Index(f'uniq_{__tablename__}_index', func.lower(email), func.lower(full_name), unique=True),
        database.UniqueConstraint(email, full_name,),
    )
    # __table_args__ = (database.UniqueConstraint(email, full_name,),)

    def __init__(self, email, full_name):
        self.email = email
        self.full_name = full_name


class Devices(database.Model):
    __tablename__ = 'devices'
    id = database.Column(database.Integer, primary_key=True)
    model_id = database.Column(database.Integer, database.ForeignKey('router_models.id'), nullable=False)
    user_id = database.Column(database.Integer, database.ForeignKey('users.id'), nullable=False)
    device_id = database.Column(database.String(100), nullable=False, unique=True)  # обезличенный идентификатор устройства
    __table_args__ = (
        database.Index(f'uniq_{__tablename__}_index', model_id, user_id, func.lower(device_id), unique=True),
        database.UniqueConstraint(model_id, user_id, device_id),
    )
    # __table_args__ = (database.UniqueConstraint(model_id, user_id, device_id),)

    def __init__(self, model_id, user_id, device_id):
        self.model_id = model_id
        self.user_id = user_id
        self.device_id = device_id


class ReviewTypes(database.Model):
    __tablename__ = 'review_types'
    id = database.Column(database.Integer, primary_key=True)
    name = database.Column(database.String(100), nullable=False, unique=True)
    # __table_args__ = (
    #     database.Index(f'uniq_{__tablename__}_index', func.lower(name), unique=True),
    #     database.UniqueConstraint(name),
    # )
    # __table_args__ = (database.UniqueConstraint(desc),)

    def __init__(self, name):
        self.name = name


class Reviews(database.Model):
    __tablename__ = 'reviews'
    id = database.Column(database.Integer, primary_key=True)
    date = database.Column(database.DateTime, default=datetime.utcnow, onupdate=datetime.now(), index=True)
    review = database.Column(database.Text, nullable=False)
    rating = database.Column(database.Integer)
    type_id = database.Column(database.Integer, database.ForeignKey('review_types.id'), nullable=False)
    ver_id = database.Column(database.Integer, database.ForeignKey('versions.id'), nullable=False)
    device_id = database.Column(database.Integer, database.ForeignKey('devices.id'), nullable=False)
    __table_args__ = (
        database.Index(f'uniq_{__tablename__}_index', ver_id, device_id, func.lower(review), unique=True),
        database.UniqueConstraint(ver_id, device_id, review),
    )
    # __table_args__ = (database.UniqueConstraint(app_id, device_id, review),)

    def __init__(self, date, review, rating, type_id, app_id, device_id):
        self.date = date
        self.review = review
        self.rating = rating
        self.type_id = type_id
        self.app_id = app_id
        self.device_id = device_id
