// Генерируем случайное целое число в диапазоне
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Rating {

    constructor(elementId, appName, appCurrentVersion) {
        this.elementId = elementId;
        this.appName = appName;
        this.appVersion = appCurrentVersion;
        this.storageKey = elementId + '_rating';
        this.stars = $(`#${this.elementId} .ph-star`);
        this.voted = $('#' + this.appName + '_voted');
        this.server = new ServerRequester('http://api.zeleza.ru', 51153);
        this.getRatingFromServer();

        this.stars.on('mouseover', this.setStarRating.bind(this));
        this.stars.on('mouseout', this.setRating.bind(this));
        this.stars.on('click', this.sendFeedbackToServer.bind(this));

    }

    getRatingFromServer() {
        // Получение рейтинга с сервера
        let self = this;
        // для тестирования возвращаем случайный рейтинг
        this.server.send('/api/server/statistic', (response)=>{
            if (response['voted'] === null) {
                self.voted.html('(0)');
                self.appVersion = 'крайняя';
            } else {
                self.rating = response['rating'];
                self.voted.html('(' + response['voted'] + ')');
                self.appVersion = response['version'];
                self.setRating();
            }

        }, {'app_name': this.appName, 'version': this.appVersion})


        // return getRandomInt(1, 10);
    }

    setRating() {
        // Установка рейтинга
        this.stars.slice(0, this.rating).addClass('text-warning')
        this.stars.slice(this.rating, this.stars.length).removeClass('text-warning');
    }

    clearRating(){
        localStorage.removeItem(this.storageKey)
    }

    setStarRating(e){
        let index = this.stars.index(e.target);
        this.stars.slice(0, index + 1).addClass('text-warning');
        this.stars.slice(index + 1, this.stars.length).removeClass('text-warning');
        this.index = index + 1;
    }

    sendFeedbackToServer(){
        const sRating = localStorage.getItem(this.storageKey)
        if (sRating) {
            // если оценка уже была, то просто уведомляем об этом
            const html = "" +
                "<div class='ps-3 pe-3 pb-3'>" +
                    "<div class='d-flex flex-row align-items-baseline pt-2 pb-2 border-bottom '>" +
                        "<div class='me-1 fs-4 fw-semibold'>" + this.appName + "</div>" +
                        "<div class='badge bg-success bg-opacity-75 lift-up-3'>" + this.appVersion  + "</div>" +
                    "</div>" +
                    "<div class='fs-4 text-primary fw-semibold pt-2 pb-1'> Ваша оценка - " +  sRating + "/" + this.stars.length + "</div>" +
                    "<span class='pb-2'>Поставить оценку повторно можно, лишь для следующей версии приложения.</span>" +
                "</div>";

            //
            // Документация по Noty
            // https://ned.im/noty/v2/options.html
            //
            new Noty({
                text: html,
                closeWith: ['button', 'click'], // ['click', 'button', 'hover', 'backdrop']
                timeout: 5000,
                theme: 'bootstrap-v4',
                type: 'error',
                // theme: 'metroui',
                modal: true,
                layout: 'topCenter',
            }).show();

        } else {
            let self = this;
            // отправляем данные при первой оценке
            // Документация по Noty
            // https://ned.im/noty/v2/options.html
            //
            let notyConfirm = new Noty({
                text:   '<div class="pt-3 ps-3 pe-1 pb-1">' +
                    '<h4 class="mb-3">Спасибо за Вашу оценку ('+ this.rating + '/' + this.stars.length + ')</h4>' +
                    '<label class="form-label ms-1">Будем признательны за обратную связь</label> ' +
                    '<textarea id="user_review" class="form-control" placeholder="Что необходимо добавить или изменить?" style="height: 200px;"></textarea>' +
                    '<div style="display: flex;" class="pt-1" >' +
                    '<input id="user_name" class="form-control" placeholder="Как к Вам обращаться?" >' +
                    '<input id="user_email" type="email" class="form-control" placeholder="Ваш Email" >' +
                    '</div></div>',
                timeout: false,
                modal: true,
                layout: 'topCenter',
                closeWith: ['button'], // ['click', 'button', 'hover', 'backdrop']
                theme: 'bootstrap-v4',
                type: 'confirm',
                buttons: [
                    {
                        addClass: 'btn btn-outline-secondary ms-2 me-4 mb-2',
                        text: 'Отправить <i class="ph-paper-plane-tilt ms-2"></i>',
                        onClick: function($noty) {
                            // this = button element
                            // $noty = $noty element

                            // console.log($noty.$bar.find('input#example').val());
                            self.server.send('/api/server/send/review', null, {
                                'app_name': self.appName,
                                'version': self.appVersion,
                                'name': $noty.$bar.find('input#user_name').val(),
                                'email': $noty.$bar.find('input#user_email').val(),
                                'review': $noty.$bar.find('input#user_review').val(),
                                'rating': self.rating,
                            });

                            // сохранили данные об установленном рейтинге в локальное хранилище
                            localStorage.setItem(self.storageKey, self.rating);
                            // закрываем окно и сообщаем об отправке
                            $noty.close();
                            // self.notyConfirm({text: 'Данные успешно отправлены', type: 'success'});
                        }
                    },
                    {
                        addClass: 'btn btn-link mb-2', text: 'Отменить', onClick: function($noty) {
                            // если нажали кнопку отмены
                            $noty.close();
                            // notyConfirm({text: 'You clicked "Cancel" button', type: 'error'});
                        }
                    }

                    // Noty.button('Отменить', 'btn btn-link mb-2', function () {
                    //     notyConfirm.close();
                    // }),
                    //
                    // Noty.button('Отправить <i class="ph-paper-plane-tilt ms-2"></i>', 'btn btn-outline-secondary ms-2 me-4 mb-2', function () {
                    //     alert('Отправлено!');
                    //     // здесь размещаем код по отправке
                    //     // обратной связи по расширению
                    //     server.send('/apps/api/send/review', null, {
                    //         'app_name': this.appName,
                    //         'version': this.appVersion,
                    //         'name':
                    //     });
                    //     localStorage.setItem(key, rating);
                    //     notyConfirm.close();
                    // },
                    //     {id: 'send_to_server_button', 'data-status': 'ok'}
                    // )
                ]
            }).show();
        }

    }
}

// $(document).on("appReady", function() {


    // Убираем в рабочей версии и добавляем при обновлении пакетов
    // samovar.clearRating();
    // kvas.clearRating();



// });
