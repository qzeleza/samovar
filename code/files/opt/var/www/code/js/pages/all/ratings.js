// Генерируем случайное целое число в диапазоне
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
//
//  Отображает текущий рейтинг программы,
//  полученный с сервера в виде звездочек-иконок
//
//  для работы необходимо название программы на английском,
//  дополнительно можно передать версию программы,
//  по умолчанию берется крайняя из БД версия программы
//
//  ВАЖНО:
//  На странице должны присутствовать элементы
//      1. Элемент li для отображения звездочек-иконок:
//          li с id = appName + '_rating', например
//          <li id='samovar_rating'></li>
//      2. Элемент внутри <li> для отображения числа голосов:
//          span с id = appName + '_voted', например
//          <span id='samovar_voted'></span>
//      3. Элемент при нажатии на который будет отображаться окно
//         для отправки отзыва на сервер рейтинга:
//         с id = appName + '_review', например
//         <a id='samovar_review' href='#'>Отправить отзыв</a>
//
class Rating {
    // Конструктор
    /**
     * @param {string} appName - базовое имя программы на английском
     * @param {string} appCurrentVersion - версия программы
     * @param {boolean} callRightPanel - необходимость вызывать правую панель после отправки отзыва
     */
    constructor(appName, appCurrentVersion = 'latest', callRightPanel = false) {

        // после отладки - закомментировать
        this.clearRating();

        this.server = new ServerRequester('https://api.zeleza.ru', 61116);

        this.starsId = appName + '_rating';
        this.votedId = appName + '_voted'
        this.reviewId = appName + '_review'
        this.userNameId = appName + '_user_name';
        this.userReviewId = appName + '_user_review';
        this.userEmailId = appName + '_user_email';
        this.reviewFormId = appName + '_form_review';


        this.appName = appName;
        this.appVersion = appCurrentVersion;
        this.storageKey = this.starsId;

        this.voted = $('#' + this.votedId);
        this.stars = this.createStarsRating();
        this.review = $('#' + this.reviewId);
        this.validator = new FormDataValidator(this.reviewFormId);

        const themeNoty = 'bootstrap-v4';
        this.rightPannelShown = callRightPanel;
        let self = this;
        this.notyReview = new Noty({
            timeout: false,
            modal: true,
            killer: true,
            dismissQueue: true,
            layout: 'topCenter',
            closeWith: ['button'], // ['click', 'button', 'hover', 'backdrop']
            theme: themeNoty,
            type: 'confirm',
            buttons: [
                Noty.button('Отменить', 'btn btn-link mb-2', () => {this.notyReview.close();}),
                Noty.button('Отправить <i class="ph-paper-plane-tilt ms-2"></i>','btn btn-outline-secondary ms-2 me-4 mb-2', () => { self._pressOnSendButton();}),
            ],
            callbacks:{
                beforeShow: function() {
                    rightPanelAct('hide');
                },
                afterShow: function () {
                    $('#' + self.userReviewId).focus();
                },
                afterClose: function() {
                    rightPanelAct('show');
                },
                onClose: function() {
                    // костыль, который позволяет показывать окно при повторных вызовах
                    this.showing = false;
                    this.shown = false;

                },
            }
        });
        this.notyError = new Noty({
            closeWith: ['click', 'backdrop', 'button'], // ['click', 'button', 'hover', 'backdrop']
            timeout: 5000,
            theme: themeNoty,
            type: 'error',
            modal: true,
            layout: 'topCenter',
            callbacks:{
                afterClose: function() {
                    // костыль, который позволяет показывать окно при повторных вызовах
                    this.showing = false;
                    this.shown = false;
                },
            }
        })

        this.stars.on('mouseover', this.setStarRating.bind(this));
        this.stars.on('mouseout', this._setRating.bind(this));
        this.stars.on('click', this.showRatingForm.bind(this));
        this.review.on('click', this.showReviewForm.bind(this));

    }

    //
    // Создаем элемент <li> из звезд иконок
    //
    createStarsRating() {

        this._getRatingFromServer();

        let $li = $('li#' + this.starsId);
        $li.removeClass('placeholder-glow').removeClass('w-80px');
        // Создание и добавление элементов <i> (звезд) внутрь <li>
        for (let i = 0; i < 10; i++) {
            $('<i>', {
                class: 'ph-star fs-base lh-base align-top'
            }).prependTo($li);
        }

        return $(`#${this.starsId} .ph-star`);
    }
    //
    // Получение рейтинга с сервера
    //
    _getRatingFromServer() {

        let self = this;
        // для тестирования возвращаем случайный рейтинг
        this.server.send('/api/server/request/statistic', (response)=>{

            if (response['voted'] === null) {
                self.voted.html('(0)');
                self.appVersion = 'latest';
            } else {
                self.rating = response['rating'];
                self.voted.html('(' + response['voted'] + ')');
                self.appVersion = response['version'];
                self._setRating();
            }

        }, {'app_name': this.appName, 'version': this.appVersion})

    }

    //
    // Установка звездочек при наведении на элемент мышью
    //
    _setRating() {
        // Установка рейтинга
        this.stars.slice(0, this.rating).addClass('text-warning')
        this.stars.slice(this.rating, this.stars.length).removeClass('text-warning');
    }


    //
    // Удаляем хранимый рейтинг на локальном хранилище
    //
    clearRating(){
         localStorage.removeItem(this.storageKey)
    }

    //
    // Устанавливаем цвет звездочек иконок в зависимости
    // от того сколько звездочек выбрал мышью пользователь
    //
    setStarRating(e){
        let index = this.stars.index(e.target);
        this.stars.slice(0, index + 1).addClass('text-warning');
        this.stars.slice(index + 1, this.stars.length).removeClass('text-warning');
        this.index = index + 1;
    }


    //
    // Отправляем отзыв на сервер
    //
    _pressOnSendButton(event){

        const self = this;
        // event.preventDefault(); // Предотвращает отправку формы
        if (this.validator.validate()) {
            // Если все поля прошли проверку, можно отправить форму
            // Вы можете добавить свой код здесь для отправки данных формы
            this.server.send('/api/server/add/review', () => {
                localStorage.setItem(self.storageKey, self.rating);
                self.notyReview.close();
                self._getRatingFromServer();
            }, {
                'app_name': this.appName,
                'version': this.appVersion,
                'name': $('#' + this.userNameId).val(),
                'email': $('#' + this.userEmailId).val(),
                'review': $('#' + this.userReviewId).val(),
                'rating': this.rating || 0,
            });
        }
    }

    _showForm(notyWindows, htmlForm) {

        notyWindows.setText(htmlForm, true);
        notyWindows.show();

    }
    //
    // Отправляем ТОЛЬКО отзыв
    //
    showReviewForm() {

        console.log('Обработчик события click для #' + this.reviewId +' вызван');
        const reviewForm =
            '<form id="' + this.reviewFormId + '" novalidate>' +
            '<div class="ps-3 pb-1">' +
            "<div class='d-flex flex-row align-items-baseline pt-2 '>" +
            '<div class="fs-3 mb-3 text-primary me-2">Отзыв на ' + this.appName + '</div>' +
            "<div class='badge bg-success bg-opacity-75 lift-up-3'>" + this.appVersion + "</div>" +
            "</div>" +
            '<div class="mb-2">Пишите по существу и самое главное</div>' +
            '<textarea id="' + this.userReviewId + '" class="form-control  h-200" placeholder="Суть Вашего предложения или замечений." data-min-length="6" data-bs-popup="tooltip" data-bs-placement="right" ></textarea>' +
            '<div style="display: flex;" class="pt-1 input-group" >' +
            '</span><input id="' + this.userNameId + '" type="text" class="form-control" placeholder="Ваше имя" data-min-length="3" data-bs-popup="tooltip" data-bs-placement="left" >' +
            '</span><input id="' + this.userEmailId + '" type="email" class="form-control" placeholder="Ваш Email" data-validate-email="email" data-bs-popup="tooltip" data-bs-placement="right" >' +
            '</div>' +
            '</div>' +
            "</form>";

        this._showForm(this.notyReview, reviewForm);

    }


    //
    // Отправляем отзыв вместе с рейтингом
    //
    showRatingForm(){
        const sRating = localStorage.getItem(this.storageKey)
        if (sRating) {
            // если оценка уже была, то просто уведомляем об этом
            const reviewForm =
                "<div class='ps-3 pe-3 pb-3'>" +
                    "<div class='d-flex flex-row align-items-baseline pt-2 pb-2 border-bottom '>" +
                        "<div class='me-1 fs-4 fw-semibold'>" + this.appName + "</div>" +
                        "<div class='badge bg-success bg-opacity-75 lift-up-3'>" + this.appVersion  + "</div>" +
                    "</div>" +
                    "<div class='fs-4 text-primary fw-semibold pt-2 pb-1'> Ваша оценка - " +  sRating + "/" + this.stars.length + "</div>" +
                    "<span class='pb-2'>Поставить оценку повторно можно, лишь для следующей версии приложения.</span>" +
                "</div>";
            this._showForm(this.notyError, reviewForm);

        } else {
            const thanksFor =
                "<form>" +
                    '<div class="pt-3 ps-3 pe-1 pb-1">' +
                        '<h4 class="mb-3">Спасибо за Вашу оценку ('+ this.rating + '/' + this.stars.length + ')</h4>' +
                        '<label class="form-label ms-1">Будем признательны за обратную связь</label> ' +
                        '<textarea id="' + this.appName + '_user_review" class="form-control" placeholder="Что необходимо добавить или изменить?" style="height: 200px;"></textarea>' +
                        '<div style="display: flex;" class="pt-1" >' +
                            '<input id="' + this.appName + '_user_name" class="form-control" placeholder="Как к Вам обращаться?" >' +
                            '<input id="' + this.appName + '_user_email" type="email" class="form-control" placeholder="Ваш Email" >' +
                        '</div>' +
                    '</div>' +
                "</form>";
            this._showForm(this.notyReview, thanksFor);
        }

    }
}
