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

BOT_TOKEN = "6214126365:AAEVpcdojvmA47fF8afczPSI_zgJ1ueZTJ0"
CHAT_ID = "-878944874"
bot = Bot(BOT_TOKEN)


stage = "test"
app = Flask(__name__)
rating_html_template = 'ratings.html'
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


@app.route('/test', methods=['GET'])
def hello_world():
    return "Hello World!\n"

# Маршрут для добавления новой оценки и отзыва пользователя
@app.route(root_request + '/send/review', methods=['POST'])
async def add_rating():
    data = request.get_json()
    app_name = data.get('app_name')
    name = data.get('name')
    email = data.get('email')
    review = data.get('review')
    rating = data.get('rating')
    version = data.get('version')
    if app_name and name and email and review and rating and version:
        new_rating = Rating(app_name, name, email, review, rating, version)
        db.session.add(new_rating)
        db.session.commit()
        await bot.send_message(chat_id=CHAT_ID, text=f'Новый отзыв на {app_name}:\nИмя: {name}\nEmail: {email}\nОтзыв: {review}\nРейтинг: {rating}\nВерсия: {version}')
        return jsonify({'success': True})
    else:
        return jsonify({'success': False})

# Маршрут для просмотра списка всех приложений и их среднего рейтинга в браузере
@app.route(root_request + '/show/ratings', methods=['GET'])
def get_rating():
    key = request.args.get('key')
    if key == 'secret_key':
        ratings = Rating.query.all()
        apps = {}
        for r in ratings:
            if r.app_name not in apps:
                apps[r.app_name] = []
            apps[r.app_name].append(r.rating)
        avg_ratings = {}
        for app_name, app_ratings in apps.items():
            avg_ratings[app_name] = math.ceil(sum(app_ratings) / len(app_ratings))


        return render_template(rating_html_template, ratings=avg_ratings)
    else:
        return jsonify({'success': False})

# Маршрут для получения подсчитанного рейтинга для конкретного приложения
@app.route(root_request + '/statistic', methods=['POST'])
async def avg_rating():
    data = request.get_json()
    app_name = data.get('app_name')
    app_version = data.get('version')
    # проверяем передан ли номер версии программы
    if not app_version or app_version == 'latest':
        # если не передан, то находим крайнюю из тех что есть
        app_version = db.session.query(db.func.max(Rating.version)).scalar()

    ratings = Rating.query.filter_by(app_name=app_name, version=app_version).all()

    if ratings:
        voted = len(ratings)
        avg_rating = math.ceil(sum([r.rating for r in ratings]) / voted)
        await bot.send_message(chat_id=CHAT_ID, text=f'Статистика {app_name}:\nСредняя оценка: {avg_rating}\nЧисло голосов: {voted}')
        return jsonify({
            'rating': avg_rating,
            'voted': voted,
            'version': app_version,
        })
    else:
        return jsonify({'rating': None, 'voted': None, 'version': None})


# Маршрут для получения списка всех отзывов для конкретного приложения
@app.route(root_request + '/show/reviews', methods=['POST'])
def get_reviews():
    data = request.get_json()
    app_name = data.get('app_name')
    ratings = Rating.query.filter_by(app_name=app_name).all()
    reviews = []
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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=51153)