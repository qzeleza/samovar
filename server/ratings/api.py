# -*- coding: utf-8 -*-

#
# Cервер на Python с использованием фреймворка Flask и
# базы данных SQLite, который позволяет отправлять оценку
# и отзыв пользователя по POST запросу, получать подсчитанный
# рейтинг и список отзывов по POST запросу для конкретного
# приложения, а также просматривать список всех приложений
# и их средний рейтинг в браузере по GET запросу
# с авторизацией по ключу.
#
#
from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from telegram import Bot
import os, math
from flask_cors import CORS


BOT_TOKEN = "6214126365:AAEVpcdojvmA47fF8afczPSI_zgJ1ueZTJ0"
CHAT_ID = "-878944874"
bot = Bot(BOT_TOKEN)

SECRET_KEY = 'secret_key'

stage = "test"
app = Flask(__name__)
rating_template_name = 'ratings.html'
reviews_template_name = 'reviews.html'

CORS(app)


api_path="/apps/api"
root_request = "/api/server"
db_name = api_path + '/ratings_' + stage + '.db'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + db_name
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Определение модели для хранения оценок и отзывов пользователей
class Rating(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    app_name = db.Column(db.String(80))
    name = db.Column(db.String(80))
    email = db.Column(db.String(120))
    review = db.Column(db.String(1000))
    rating = db.Column(db.Integer)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    version = db.Column(db.String(80))

    def __init__(self, app_name, name, email, review, rating, version):
        self.app_name = app_name
        self.name = name
        self.email = email
        self.review = review
        self.rating = rating
        self.version = version

if not os.path.exists(db_name):
    with app.app_context():
        db.create_all()


# Маршрут для просмотра списка всех приложений и их среднего рейтинга в браузере
@app.route(root_request + '/show/ratings', methods=['GET'])
def show_rating():
    key = request.args.get('key')
    if key == SECRET_KEY:
        ratings = Rating.query.all()
        apps = {}
        for r in ratings:
            app_key = (r.app_name, r.version)
            if app_key not in apps:
                apps[app_key] = []
            apps[app_key].append(r.rating)
        avg_ratings = {}

        for app_key, app_ratings in apps.items():
            # breakpoint()
            avg_ratings[app_key] = {
                'avg_rating': math.ceil(sum(app_ratings) / len(app_ratings)),
                'num_votes': len(app_ratings),
                'num_reviews': len([r for r in ratings if r.app_name == app_key[0] and r.version == app_key[1] and r.review])
            }

        sorted_avg_ratings = sorted(avg_ratings.items(), key=lambda x: (x[0][0], x[0][1]), reverse=True)
        return render_template(rating_template_name, ratings=sorted_avg_ratings)
    else:
        return jsonify({'success': False})

@app.route(root_request + '/show/reviews', methods=['GET'])
def show_reviews():
    key = request.args.get('key')
    app_name = request.args.get('app_name')
    if key == 'secret_key':
        ratings = Rating.query.filter_by(app_name=app_name).all() if app_name else Rating.query.all()
        apps = {}
        for r in ratings:
            app_key = (r.app_name, r.version)
            if app_key not in apps:
                apps[app_key] = []
            apps[app_key].append(r)
        sorted_apps = sorted(apps.items(), key=lambda x: (x[0][0], x[0][1]), reverse=True)
        row_counts = {app_key[0]: sum([len(reviews) for key, reviews in apps.items() if key[0] == app_key[0]]) for app_key, reviews in apps.items()}
        # breakpoint()
        return render_template('reviews.html', apps=dict(sorted_apps), row_counts=row_counts)
    else:
        return jsonify({'success': False})


# Маршрут для добавления новой оценки и отзыва пользователя
@app.route(root_request + '/add/review', methods=['POST'])
async def add_rating():
    data = request.get_json()
    app_name = data.get('app_name')
    name = data.get('name')
    email = data.get('email')
    review = data.get('review')
    rating = data.get('rating') or 0
    version = data.get('version')

    # проверяем передан ли номер версии программы
    if not version or version == 'latest' or not Rating.query.filter_by(app_name=app_name, version=version).first():
        # если не передан, то находим крайнюю из тех что есть
        version = db.session.query(db.func.max(Rating.version)).scalar()

    if app_name and rating and version:
        new_rating = Rating(app_name, name, email, review, rating, version)
        db.session.add(new_rating)
        db.session.commit()
        await bot.send_message(chat_id=CHAT_ID, text=f'Новый отзыв на {app_name}:\nИмя: {name}\nEmail: {email}\nОтзыв: {review}\nРейтинг: {rating}\nВерсия: {version}')
        return jsonify({'success': True})
    else:
        return jsonify({'success': False})


# Маршрут для получения подсчитанного рейтинга для конкретного приложения
@app.route(root_request + '/request/statistic', methods=['POST'])
async def get_rating():
    data = request.get_json()
    app_name = data.get('app_name')
    app_version = data.get('version')
    #await bot.send_message(chat_id=CHAT_ID, text=f'{app_name}\n{app_version}')
    # проверяем передан ли номер версии программы
    if not app_version or app_version == 'latest' or not Rating.query.filter_by(app_name=app_name, version=app_version).first():
        # если не передан, то находим крайнюю из тех что есть
        app_version = db.session.query(db.func.max(Rating.version)).scalar()

    ratings = Rating.query.filter_by(app_name=app_name, version=app_version).all()
    [r.update(rating=0) for r in ratings if r.rating == 'null']
    db.session.commit()

    if ratings:
        voted = len(ratings)
        avg_rating = math.ceil(sum([r.rating for r in ratings]) / voted)
        #await bot.send_message(chat_id=CHAT_ID, text=f'Статистика по {app_name}:\nСредняя оценка: {avg_rating}\nЧисло голосов: {voted}')
        return jsonify({
            'rating': avg_rating,
            'voted': voted,
            'version': app_version,
        })
    else:
        return jsonify({'rating': None, 'voted': None, 'version': None})


# Маршрут для получения списка всех отзывов для конкретного приложения
@app.route(root_request + '/request/reviews', methods=['POST'])
def get_reviews():
    data = request.get_json()
    app_name = data.get('app_name')
    app_version = data.get('version')
    # проверяем передан ли номер версии программы
    if not app_version or app_version == 'latest' or not Rating.query.filter_by(app_name=app_name, version=app_version).first():
        # если не передан, то находим крайнюю из тех что есть
        app_version = db.session.query(db.func.max(Rating.version)).scalar()

    ratings = Rating.query.filter_by(app_name=app_name, version=app_version).all()
    reviews = []
    if ratings:
        for r in ratings:
            reviews.append({
                'name': r.name,
                'email': r.email,
                'review': r.review,
                'rating': r.rating,
                'date': r.date,
                'version': r.version
            })
        return jsonify({'reviews': reviews})
    else:
        return jsonify({'rating': None, 'voted': None, 'version': None, 'review': None })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=61116, debug=False)
