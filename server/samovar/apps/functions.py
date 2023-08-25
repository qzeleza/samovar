import os, math, re
from telegram import Bot
from flask import request, jsonify, render_template
import logging
from datetime import datetime
# if you are using SQLite
from sqlalchemy.dialects.sqlite import insert

# if you are using PostgreSQL
# from sqlalchemy.dialects.postgresql import insert

from apps.logger import get_function_name
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
# from apps import app
from config import Config

logger = logging.getLogger(__name__)

# Инициализируем телеграм бот
bot = Bot(Config.BOT_TOKEN)


#
# @app.before_first_request
# def create_tables():
#     db.create_all()


# проверяем есть ли в БД записи
def check_db_for_empty(app_name, version):
    # breakpoint()
    # проверяем передан ли номер версии программы
    first_rec_of_version = Applications.query.filter_by(eng_name=app_name).first()
    if not first_rec_of_version and (not version or version == 'latest'):
        update_db_from_config()
        # error = "ОШИБКА: Не задан номер версии и нет записей в БД."
        # logger.error(error)
        # return jsonify({'success': False, 'description': error})


# Добавляем запись в таблицу (при наличии уникальной группы колонок)
def add_record_to_db(table, table_index_fields_list, values_dict, do_update_on_conflict=False):
    db_result = insert(table).values(**values_dict)
    if do_update_on_conflict:
        # Если нужно при ошибке добавления данных сделать обновление
        # Удаляем индексы из словаря со значениями
        [values_dict.pop(x) for x in list(values_dict) if x in table_index_fields_list]
        # Обновляем данные
        db_result.on_conflict_do_update(index_elements=table_index_fields_list, set_=values_dict)
    else:
        # Если нужно при ошибке добавления данных ничего не предпринимать
        db_result.on_conflict_do_nothing(index_elements=table_index_fields_list)
    db.session.execute(db_result)
    return table.query.filter_by(**values_dict).first()


# получаем экземпляр Истории версий приложения
def get_history_records(apps, version, date, items=[]):
    ver = get_ver_record(apps, version, date)
    # breakpoint()
    # Проверяем наличие данных в связанных таблицах и добавляем их при необходимости
    history = History.query.filter_by(ver_id=ver.id).all()
    if not history:
        for item in items:
            values = {'ver_id': ver.id, 'item': item}
            indexes = ['index_ver_id_item']
            history = add_record_to_db(History, indexes, values)

            # history = History(ver.id, item)
            # db.session.add(history)
            # db.session.commit()

    return history


# получаем экземпляр Приложения по имени и версии
def get_app_record(eng_name):
    # from apps.functions import get_app_record
    # get_app_record('kvas')

    # Проверяем наличие данных в связанных таблицах и добавляем их при необходимости
    result = Applications.query.filter_by(eng_name=eng_name).first()

    if not result:
        apps = update_db_from_config_by_app_name(eng_name)
        if not apps['success']:
            error = f"Запрошенное приложение {eng_name} не найдено в файле конфигурации.\nДобавьте в файл конфигурации {Config.FILE_CONFIG} данные о приложении и повторите попытку снова."
            logger.debug(error)
            result = {'success': False, 'description': error}
        else:
            result = apps['app']

    return result


# Обновляет все данные собранные из FILE_CONFIG (в том числе и историю)
def update_db_from_config(do_update=False):
    re_app_templ = r'\[(.*?)\]$'
    result = {'success': False, 'description': 'Ошибка при открытии файла конфигурации.'}
    with open(Config.FILE_CONFIG, "r", encoding='utf-8') as f:
        lines = f.readlines()
        for eng_name in [re.findall(re_app_templ, x)[0].strip(' ') for x in lines if re.findall(re_app_templ, x)]:
            result = update_db_from_config_by_app_name(eng_name, do_update)
            if not result['success']:
                break
        if result['success']:
            # breakpoint()
            app_list = ", ".join([ u[0] for u in db.session.query(Applications.eng_name).all()])
            app_count = Applications.query.count()
            result['description'] = f'Добавлено в БД [{app_list}] - {app_count} шт.'

    return result


def update_db_from_config_by_app_name(eng_name, do_update):

    # Если такого приложения нет, то запрашиваем его из файла конфигурации
    (rus_name, desc, full_desc, history_dict) = get_config_data(eng_name)
    # breakpoint()
    if rus_name:
        # apps = Applications(eng_name, rus_name, desc, full_desc)
        values = {'eng_name': eng_name, 'rus_name': rus_name, 'app_desc': desc, 'app_full_desc': full_desc}
        indexes = ['index_eng_name_rus_name_app_desc']
        apps = add_record_to_db(Applications, indexes, values, do_update)
        # db.session.add(apps)
        # db.session.commit()
        for version, history in history_dict.items():
            get_history_records(apps, version, history['date'], history['items'])
        result = {'success': True, 'app': apps}
    else:
        error = f"Запрошенное приложение {eng_name} не найдено в файле конфигурации.\nДобавьте в файл конфигурации {Config.FILE_CONFIG} данные о приложении и повторите попытку снова."
        logger.debug(error)
        result = {'success': False, 'description': error}

    return result


def get_data_from_str(str_date):
    import datetime
    import locale
    locale.setlocale(locale.LC_TIME, 'ru_RU.UTF-8')
    # breakpoint()
    date = str_date.rstrip('года').strip(' ')
    return datetime.datetime.strptime(date, '%d %B %Y')


# получаем экземпляр Приложения по имени и версии
def get_ver_record(app, version, date):
    # Проверяем наличие данных в связанных таблицах и добавляем их при необходимости
    ver = Versions.query.filter_by(app_id=app.id, version=version).first()
    if not ver:

        if not date:
            # Если не задано номера версии, то ищем его в файле конфигурации
            _, _, _, history_dict = get_config_data(app.eng_name)
            date = history_dict[version]['date']

        date = get_data_from_str(date)

        values = {'app_id': app.id, 'version': version, 'date': date}
        indexes = ['index_app_id_version_date']
        ver = add_record_to_db(Versions, indexes, values)

        # ver = Versions(app.id, version, date)
        # db.session.add(ver)
        # db.session.commit()

    return ver


# получаем экземпляр Пользователя по имени и email
def get_user_record(user_email, user_name):
    # Проверяем наличие данных в связанных таблицах и добавляем их при необходимости
    user = Users.query.filter_by(email=user_email).first()
    if not user:
        values = {'user_email': user_email, 'user_name': user_name}
        indexes = ['index_email_full_name', 'user_email']
        user = add_record_to_db(Users, indexes, values)

        # user = Users(user_email, user_name)
        # db.session.add(user)
        # db.session.commit()
    return user


# получаем экземпляр ТипаРоутера по модели и процессоре
def get_router_record(model, processor):
    router_model = RouterModels.query.filter_by(model=model, processor=processor).first()
    if not router_model:
        values = {'model': model, 'processor': processor}
        indexes = ['index_model_processor']
        router_model = add_record_to_db(RouterModels, indexes, values)

        # router_model = RouterModels(model, processor)
        # db.session.add(router_model)
        # db.session.commit()
    return router_model


def get_device_record(device_id, router, user):
    device = Devices.query.filter_by(device_id=device_id).first()
    if not device:
        values = {'router_id': router.id, 'user_id': user.id, 'device_id': device_id}
        indexes = ['index_model_id_user_id_device_id', 'device_id']
        device = add_record_to_db(Devices, indexes, values)

        # device = Devices(router.id, user.id, device_id)
        # db.session.add(device)
        # db.session.commit()
    return device


def get_type_review_record(type):
    type_review = ReviewTypes.query.filter_by(desc=type).first()
    if not type_review:
        values = {'type': type}
        indexes = ['index_id_desc']
        type_review = add_record_to_db(ReviewTypes, indexes, values)

        # type_review = ReviewTypes(type)
        # db.session.add(type_review)
        # db.session.commit()
    return type_review


def add_review_record(review, rating, type_review, ver, device):
    # breakpoint()
    values = {
        'date': datetime.utcnow(),
        'review': review,
        'rating': rating,
        'type_id': type_review.id,
        'ver_id': ver.id,
        'device_id': device.id,
    }
    indexes = ['index_app_id_review_device_id', 'date']
    review = add_record_to_db(Reviews, indexes, values)

    # review = Reviews(datetime.utcnow(), review, rating, type_review.id, ver.id, device.id)
    # db.session.add(review)
    # db.session.commit()

    return review


def add_new_record(data):
    # breakpoint()
    logger.debug(f"Вызвана функция '{get_function_name()}'")
    # breakpoint()
    eng_name = data.get('app_name')
    user_name = data.get('name')
    user_email = data.get('email')
    app_review = data.get('review')
    review_type = data.get('type')
    app_rating = data.get('rating')
    app_version = data.get('version')
    version_date = data.get('version_date')
    device_id = data.get('device_id')
    device_processor = data.get('processor')
    device_model = data.get('model')

    app_version = get_last_version(eng_name)[eng_name] if not app_version or app_version == 'latest' else app_version

    # Проверяем наличие данных в связанных таблицах и добавляем их при необходимости
    app = get_app_record(eng_name)
    app_ver = get_ver_record(app, app_version, version_date)
    user = get_user_record(user_email, user_name)
    router = get_router_record(device_model, device_processor)
    device = get_device_record(device_id, router, user)
    type_review = get_type_review_record(review_type)

    if app and app_rating and app_version:
        try:
            add_review_record(app_review, app_rating, type_review, app_ver, device)
            logger.debug('Данные в БД успешно добавлены')
        except Exception as e:
            error = f'Данные в БД добавлены не были: {str(e)}'
            logger.debug(error)
            return {'success': False, 'description': error}
        try:
            bot.send_message(chat_id=Config.CHAT_ID,
                             text=f'Новый отзыв на {app.rus_name}:\n'
                                  f'Имя: {user_name}\n'
                                  f'Email: {user_email}\n'
                                  f'Роутер: {device_id}\n'
                                  f'Модель: {device_model}\n'
                                  f'Процессор: {device_processor}\n'
                                  f'Тип отзыва: {type_review.desc}\n'
                                  f'Отзыв: {app_review}\n'
                                  f'Рейтинг: {app_rating}\n'
                                  f'Версия: {app_version}')
        except Exception as e:
            logger.debug(f"Сообщение в Telegram не было отправлено: {str(e)}")

        mess = "Запись успешно добавлена."
        logger.debug(mess)
        return {'success': True, 'description': mess}
    else:
        error = "Один из параметров не задан: app_name или rating или version"
        logger.debug(error)
        return {'success': False, 'description': error}


# Функция для получения версии приложения
def get_last_version(app_name):
    # breakpoint()
    answer = {app_name: 'н/д'}
    version = 'latest'

    check_db_for_empty(app_name, version)
    # logger.debug('Версия приложения не установлена или установлена в latest')
    # Если не передан или запись с такой версией не найдена, то находим крайнюю из тех, что есть
    last_version = db.session.query(db.func.max(Versions.version)).join(Applications).filter(
        Applications.eng_name == app_name).scalar()
    # last_version = db.session.query(db.func.max(Applications.version)).filter(Applications.name == app_name).scalar()
    if last_version:
        logger.debug(f'В БД была найдена {last_version} версия приложения {app_name}')
        answer = {app_name: last_version}

    return answer


# Получаем рейтинг по имени и номеру версии
def get_app_rating(data):
    logger.debug(f"Вызвана функция '{get_function_name()}'")
    app_name = data.get('app_name')
    app_version = data.get('version')
    version = get_last_version(app_name)[app_name] if not app_version or app_version == 'latest' else app_version

    app = Applications.query.filter_by(eng_name=app_name).first()

    if app:
        rus_name = app.rus_name  # Получаем русское название приложения
        result = {
            'app_name': app_name,
            'rus_name': rus_name,
            'rating': 0,
            'voted': 0,
            'version': version
        }

        if version:
            app_id = app.id
            reviews = Reviews.query.filter_by(app_id=app_id).all()

            if reviews:
                voted = len(reviews)
                total_rating = sum([r.rating for r in reviews if r.rating is not None])
                avg_rating = math.ceil(total_rating / voted)
                logger.debug(f'Успешная обработка данных завершена.')

                result = {
                    'app_name': app_name,
                    'rus_name': rus_name,
                    'rating': avg_rating,
                    'voted': voted,
                    'version': version
                }
                return result
            else:
                logger.debug(f'Отзывы для {app_name}:{version} в БД отсутствуют.')
                return result
        else:
            logger.debug(f'Для приложения {app_name} нет данных с версией {version} в БД.')
            return result
    else:
        logger.debug(f'Данные {app_name} в БД отсутствуют.')
        return {
            'app_name': app_name,
            'rus_name': 'н/д',
            'rating': 0,
            'voted': 0,
            'version': version
        }


# Получаем полный список отзывав по имени и версии приложения в JSON формате
def get_review_list(data):
    logger.debug(f"Вызвана функция '{get_function_name()}'")
    app_name = data.get('app_name')

    voted = 0
    version = get_last_version(app_name)[app_name]
    result = {
        'app_name': app_name,
        'rus_name': 'н/д',
        'version': version,
        'voted': voted,
        'review_list': []
    }

    if version:
        app = Applications.query.filter_by(eng_name=app_name).first()

        if app:
            result['rus_name'] = app.rus_name
            reviews = Reviews.query.filter_by(app_id=app.id).all()
            review_list = []

            if reviews:
                voted = len(reviews)

                for r in reviews:
                    review_type = ReviewTypes.query.filter_by(id=r.type_id).first()
                    device = Devices.query.filter_by(id=r.device_id).first()
                    router = RouterModels.query.filter_by(id=device.model_id).first()
                    user = Users.query.filter_by(id=device.user_id).first()

                    review_list.append({
                        'email': user.email,
                        'name': user.full_name,
                        'model': router.model,
                        'device_id': device.device_id,
                        'processor': router.processor,
                        'type_review': review_type.desc,
                        'review': r.review,
                        'rating': r.rating,
                        'date': r.date.strftime(Config.DATE_FORMAT),
                    })

                logger.debug("Формирование списка отзывов успешно завершено.")
            else:
                logger.debug("Формирование списка отзывов завершено с нулевым результатом.")

            result = {
                'app_name': app_name,
                'version': version,
                'voted': voted,
                'review_list': review_list
            }
            return result
        else:
            logger.debug("Формирование списка отзывов завершено с нулевым результатом.")
            return result
    else:
        logger.debug("Формирование списка отзывов завершено с нулевым результатом.")
        return result


def show_apps_summary():
    logger.debug(f"Вызвана функция '{get_function_name()}'")
    try:
        reviews = Reviews.query.filter(Reviews.rating > 0).all()
        apps = {}

        for r in reviews:
            version = Versions.query.filter_by(id=r.app_id).first()
            app = Applications.query.filter_by(id=version.app_id).first()
            app_key = (app.eng_name, version.version, r.app_id)
            apps.setdefault(app_key, []).append(r.rating)

        avg_ratings = {}

        for app_key, app_ratings in apps.items():
            avg_rating = math.ceil(sum(app_ratings) / len(app_ratings))
            num_votes = len(app_ratings)
            num_reviews = sum(1 for r in reviews if r.app_id == app_key[2] and r.review)
            avg_ratings[app_key] = {
                'avg_rating': avg_rating,
                'num_votes': num_votes,
                'num_reviews': num_reviews
            }

        sorted_avg_ratings = sorted(avg_ratings.items(), key=lambda x: x[0], reverse=True)
        return render_template(Config.RATING_TEMPLATE_NAME, ratings=sorted_avg_ratings)
    except Exception as e:
        logger.error(f"Ошибка при генерации страницы: {str(e)}")


def show_reviews_table(request):
    logger.debug(f"Вызвана функция '{get_function_name()}'")
    try:
        app_name = request.args.get('app_name')
        reviews_query = Reviews.query
        # breakpoint()
        if app_name:
            app = get_app_record(app_name)
            reviews_query = reviews_query.join(Versions, Versions.id == Reviews.app_id).filter(
                Versions.app_id == app.id)

        reviews = reviews_query.all()

        apps = {}

        for r in reviews:
            device = Devices.query.filter_by(id=r.device_id).first()
            user = Users.query.filter_by(id=device.user_id).first()
            review_type = ReviewTypes.query.filter_by(id=r.type_id).first()
            router_model = RouterModels.query.filter_by(id=device.model_id).first()

            app_key = (app_name, r.version) if app_name else ('All Apps', r.version)
            review_data = {
                'date': r.date,
                'review': r.review,
                'email': user.email,
                'name': user.full_name,
                'type': review_type.desc,
                'model': router_model.model,
                'device_id': device.device_id,
                'processor': router_model.processor,
            }
            apps.setdefault(app_key, []).append(review_data)

        sorted_apps = sorted(apps.items(), key=lambda x: x[0], reverse=True)
        row_counts = {
            app_key[0]: sum(len(reviews) for key, reviews in apps.items() if key[0] == app_key[0])
            for app_key, reviews in apps.items()
        }

        return render_template(Config.REVIEWS_TEMPLATE_NAME, apps=dict(sorted_apps), row_counts=row_counts)

    except Exception as e:
        logger.error(f"Ошибка при генерации страницы: {str(e)}")


def get_history_items(file_history):
    # from apps.functions import get_history_items
    # get_history_items('./data/kvas/HISTORY.md')

    ver_data, items, count = {}, [], 0
    re_date_templ = r'\d{1,2} \w+ \d{4}'
    re_ver_templ = r'v\d{1,2}.{1}\d{1,2}.{0,1}\d{0,3}'
    re_md_templ = r'\[([^\[]+)\]\(([^\)]+)\)'
    re_html_templ = r'<a href="\2">\1</a>'

    with open(file_history, "r", encoding='utf-8') as f:
        lines = f.readlines()
        versions_list = [(i, re.findall(re_ver_templ, x)[0]) for i, x in enumerate(lines) if
                         re.findall(re_ver_templ, x)]

        for count, line in versions_list:
            # breakpoint()

            # ищем номер версии первой строкой
            if line in lines[count]:
                ver_line = line
                # Если нашли номер версии, то вторая и
                # далее строки, до пустой строки или сроки с новым номером версии
                # подлежат обработке из буфера
                if ver_line:
                    date = re.findall(re_date_templ, lines[count + 1])[0]
                    count += 2
                    item_count = 0
                    for item in lines[count:]:
                        if '-' in item:
                            item = item.strip('- \n')
                            item = re.sub(re_md_templ, re_html_templ, item)
                            items.append(item)
                            item_count += 1
                        else:
                            count += item_count
                            break

                    ver_data[ver_line] = {'date': date, 'items': items}
                    items = []

    return ver_data


def get_config_data(app_name):
    # from apps.functions import get_config_data
    # get_config_data('kvas')

    app_data = dict()
    config_fields = ['rus_name', 'app_desc', 'app_full_desc', 'history']
    inside = False

    with open(Config.FILE_CONFIG, "r", encoding='utf-8') as f:

        for line in f:
            # если поле найдено в сроке, то извлекаем его
            if inside and line:
                for val in config_fields:
                    if val in line:
                        app_data[val] = line[line.find('=') + 1:].strip(' ,\n')

            # Отсекаем блок поиска - искомый блок содержит
            # в начале блока строку вида [app_name]
            if (app_name in line) and ('[' in line) and (']' in line):
                inside = True
            elif inside and ('[' in line) and (']' in line):
                inside = False

    history_file = f"./data/{app_data['history']}"
    app_data['history'] = get_history_items(history_file.strip('\n'))

    return (app_data[val] for val in config_fields)
