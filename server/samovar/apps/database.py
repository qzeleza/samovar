# -*- coding: utf-8 -*-
# ------------------------------------------------------------------------------
#
#       Здесь описаны функции для непосредственной работы с БД
#
# ------------------------------------------------------------------------------

# При использовании SQLite
from sqlalchemy.dialects.sqlite import insert
from sqlalchemy.exc import IntegrityError
# При использовании PostgreSQL
# from sqlalchemy.dialects.postgresql import insert
import re
from flask import jsonify
from datetime import datetime

from apps.history import (
    get_config_data,
)
from apps.models import (
    History,
    Applications,
    Versions,
    Users,
    RouterModels,
    Devices,
    ReviewTypes,
    Reviews,
    database as db
)

from apps.library import (
    get_date_from_str,
    get_str_from_date
)
from config import Config

# подключаем логирование в данном файле
import logging
from apps.logger import get_function_name

logger = logging.getLogger(__name__)


# ------------------------------------------------------------------------------
# проверяем есть ли в БД записи
# ------------------------------------------------------------------------------
def check_db_for_empty(app_name, version):
    # breakpoint()
    # проверяем передан ли номер версии программы

    first_rec_of_version = Applications.query.filter_by(eng_name=app_name).first()
    # breakpoint()
    if not first_rec_of_version and (not version or version == 'latest'):
        # если записей нет, то обновляем БД из файла конфигурации приложений
        update_db_from_config()
        # Повторная проверка
        first_rec_of_version = Applications.query.filter_by(eng_name=app_name).first()
        if not first_rec_of_version:
            error = "ОШИБКА: Проблема со считыванием данных из файла конфигурации приложений и записью их в БД."
            logger.error(error)
            return jsonify({'success': False, 'description': error})


# ------------------------------------------------------------------------------
# Добавляем запись в таблицу (при наличии уникальной группы колонок)
# ------------------------------------------------------------------------------
def add_or_update_record(table, values_dict, uniq_fields_list):
    # breakpoint()
    session = db.session
    # убираем из списка полей - поля индексы
    values_to_update = {col: values_dict[col] for col in values_dict if col not in uniq_fields_list}
    # если они остались, то проводим обновление по ним
    try:
        if values_to_update:
            # формируем запрос
            insert_stmt = insert(table).values(**values_dict).on_conflict_do_update(
                # в этом случае в описаниях модели должен
                # быть индекс с одним и тем же названием uniq_index
                index_elements=uniq_fields_list,
                set_=values_to_update,
            )
            # исполняем запрос записываем в БД
            session.execute(insert_stmt)
            session.commit()
        else:
            # breakpoint()
            new_data = table(**values_dict)
            session.add(new_data)
            session.commit()

        return table.query.filter_by(**values_dict).first()

    except IntegrityError as e:
        # в случае
        db.session.rollback()  # Откатываем текущую транзакцию
        logger.debug(f"Ошибка при добавлении данных:\n"
                     f"Конфликт при создании уникальных записей в таблице {table.__name__}\n"
                     f"{e}")
        return None




# ------------------------------------------------------------------------------
# получаем экземпляр Истории версий приложения
# ------------------------------------------------------------------------------
def get_history_records(tb_apps, version, date, items=[]):
    # breakpoint()
    tb_ver = get_ver_record(tb_apps, version, date)
    # Проверяем наличие данных в связанных таблицах и добавляем их при необходимости
    history = History.query.filter_by(ver_id=tb_ver.id).all()
    if not history:
        for item in items:
            values = {'ver_id': tb_ver.id, 'item': item}
            indexes = ["ver_id", "item"]
            history = add_or_update_record(History, values, indexes)

    return history


# ------------------------------------------------------------------------------
# получаем экземпляр Приложения по имени и версии
# ------------------------------------------------------------------------------
def get_app_record(eng_name):
    # from apps.functions import get_app_record
    # get_app_record('kvas')

    # Проверяем наличие данных в связанных таблицах и добавляем их при необходимости
    app = Applications.query.filter_by(eng_name=eng_name).first()

    if not app:
        apps = update_db_from_config_by_app_name(eng_name)
        if apps['success']:
            result = {'success': False, 'app': apps['app']}
        else:
            error = f"Запрошенное приложение {eng_name} не найдено в файле конфигурации.\nДобавьте в файл конфигурации {Config.FILE_CONFIG} данные о приложении и повторите попытку снова."
            logger.debug(error)
            result = {'success': False, 'description': error}

    else:
        result = {'success': True, 'app': app}

    return result


# ------------------------------------------------------------------------------
# получаем экземпляр Приложения по имени и версии
# ------------------------------------------------------------------------------
def get_ver_record(tb_app, version, date=None):
    # breakpoint()
    # Проверяем наличие данных в связанных таблицах и добавляем их при необходимости
    ver = Versions.query.filter_by(app_id=tb_app.id, version=version).first()
    if not ver:
        if not date:
            # Если не задано номера версии, то ищем его в файле конфигурации
            _, _, _, _, history_dict = get_config_data(tb_app.eng_name)
            date = history_dict[version]['date']

        date = get_date_from_str(date)

        values = {'app_id': tb_app.id, 'version': version, 'date': date}
        indexes = ["app_id", "version", "date"]
        ver = add_or_update_record(Versions, values, indexes)

    return ver


# ------------------------------------------------------------------------------
# получаем экземпляр Пользователя по имени и email
# ------------------------------------------------------------------------------
def get_user_record(user_email, user_name):
    # Проверяем наличие данных в связанных таблицах и добавляем их при необходимости
    user = Users.query.filter_by(email=user_email).first()
    if not user:
        values = {'email': user_email, 'full_name': user_name}
        indexes = ['full_name', 'email']
        user = add_or_update_record(Users, values, indexes)

    return user


# ------------------------------------------------------------------------------
# получаем экземпляр ТипаРоутера по модели и процессоре
# ------------------------------------------------------------------------------
def get_router_record(model, processor):
    router_model = RouterModels.query.filter_by(model=model, processor=processor).first()
    if not router_model:
        values = {'model': model, 'processor': processor}
        indexes = ["model", "processor"]
        router_model = add_or_update_record(RouterModels, values, indexes)

    return router_model


# ------------------------------------------------------------------------------
# получаем экземпляр Устройства по его id и данным из таблиц Routers и Users
# ------------------------------------------------------------------------------
def get_device_record(device_id, tb_router, tb_user):
    device = Devices.query.filter_by(device_id=device_id).first()
    if not device:
        values = {'model_id': tb_router.id, 'user_id': tb_user.id, 'device_id': device_id}
        indexes = ["model_id", "user_id", "device_id"]
        device = add_or_update_record(Devices, values, indexes)

    return device


# ------------------------------------------------------------------------------
# Получаем экземпляр Типа отзыва по его типу
# ------------------------------------------------------------------------------
def get_type_review_record(type):
    type_review = ReviewTypes.query.filter_by(name=type).first()
    if not type_review:
        values = {'name': type}
        indexes = ["name"]
        type_review = add_or_update_record(ReviewTypes, values, indexes)

    return type_review


# ------------------------------------------------------------------------------
# Добавляем новый отзыв в БД
# ------------------------------------------------------------------------------
def add_review_record(review, rating, tb_type_review, tb_version, tb_device):
    # breakpoint()
    values = {
        'date': datetime.utcnow(),
        'review': review,
        'rating': rating,
        'type_id': tb_type_review.id,
        'ver_id': tb_version.id,
        'device_id': tb_device.id,
    }
    indexes = ["ver_id", "review", "device_id"]
    new = add_or_update_record(Reviews, values, indexes)

    return new


# ------------------------------------------------------------------------------
# Обновляет все данные собранные из FILE_CONFIG (в том числе и историю)
# ------------------------------------------------------------------------------
def update_db_from_config():
    re_app_templ = r'\[(.*?)\]$'
    result = {'success': False, 'description': 'Ошибка при открытии файла конфигурации.'}
    with open(Config.FILE_CONFIG, "r", encoding='utf-8') as f:
        lines = f.readlines()
        apps_config_list = [re.findall(re_app_templ, x)[0].strip(' ') for x in lines if re.findall(re_app_templ, x)]
        for eng_name in apps_config_list:
            result = update_db_from_config_by_app_name(eng_name)
            if not result['success']:
                break
        if result['success']:
            # breakpoint()
            tb_apps = [app for app in Applications.query.all()]
            apps_to_del = [app for app in tb_apps if app.eng_name not in apps_config_list]
            for app in apps_to_del:
                vers_to_del = Versions.query.filter_by(app_id=app.id)
                for ver in vers_to_del:
                    try:
                        History.query.filter_by(ver_id=ver.id).delete()
                        Reviews.query.filter_by(ver_id=ver.id).delete()
                        db.session.commit()
                    except Exception as e:
                        error = f'Ошибка при удалении истории и отзывов приложения: {e}'
                        logger.error(error)
                        db.session.rollback()
                # Делаем попытку удалить приложение
                try:
                    db.session.delete(app)
                    db.session.commit()
                except Exception as e:
                    error = f'Ошибка при удалении приложения: {e}'
                    logger.error(error)
                    db.session.rollback()
                    assert error

            app_count = Applications.query.count()
            result['description'] = (f'Обновлено [{", ".join([z.rus_name for z in tb_apps])}] - {app_count} шт.,\n'
                                     f'Удалено [{", ".join(apps_to_del)}] {len(apps_to_del)} шт.')

    return result


# ------------------------------------------------------------------------------
# Так как данные в FILE_CONFIG являются эталоном, то после добавления данных
# из файла конфигурации приложений необходимо удалить все записи, которых
# нет в файле FILE_CONFIG, при этом, не удаляются те записи, у которых имеются
# уже зависимости в таблицах один-ко-многим
# ------------------------------------------------------------------------------
# def delete_unused_in_config(tb_apps, apps_config_list):


# ------------------------------------------------------------------------------
# Обновляет данные по запрошенному приложению собранные из FILE_CONFIG (в том числе и историю)
# ------------------------------------------------------------------------------
def update_db_from_config_by_app_name(eng_name):
    # Если такого приложения нет, то запрашиваем его из файла конфигурации
    (rus_name, desc, full_desc, available, history_dict) = get_config_data(eng_name)
    # breakpoint()
    if rus_name:
        # apps = Applications(eng_name, rus_name, desc, full_desc)
        values = {'eng_name': eng_name, 'rus_name': rus_name, 'app_desc': desc, 'app_full_desc': full_desc,
                  'available': available}
        unique_index_list = ['eng_name', 'rus_name']
        # Получаем добавленную запись в БД
        tb_app = add_or_update_record(Applications, values, unique_index_list)

        if isinstance(history_dict, dict):
            # Добавляем данные из файла конфигурации приложений
            for version, history in history_dict.items():
                get_history_records(tb_app, version, history['date'], history['items'])
            # Удаляем данные из БД, которых нет в файле конфигурации приложений
            # breakpoint()
            # Создаем множество идентификаторов версий, для которых есть отзывы
            versions_with_reviews = {review.ver_id for review in Reviews.query.distinct(Reviews.ver_id)}

            # Получаем список элементов версий отличный от эталона - для удаления
            ver_list = Versions.query.filter_by(app_id=tb_app.id).all()
            ver_list_to_del = [v for v in ver_list if v.version not in history_dict.keys()]
            for ver in ver_list_to_del:
                # если у данной версии нет отзывов и она не находится в файле конфигурации,
                # то удаляем все записи в таблицах истории и отзывов с ней связанные
                if ver.id not in versions_with_reviews:
                    # производим удаление записей
                    History.query.filter_by(ver_id=ver.id).delete()
                    Versions.query.filter_by(id=ver.id).delete()
                    db.session.commit()

        result = {'success': True, 'app': tb_app}
    else:
        error = f"Запрошенное приложение {eng_name} не найдено в файле конфигурации.\nДобавьте в файл конфигурации {Config.FILE_CONFIG} данные о приложении и повторите попытку снова."
        logger.debug(error)
        result = {'success': False, 'description': error}

    return result



