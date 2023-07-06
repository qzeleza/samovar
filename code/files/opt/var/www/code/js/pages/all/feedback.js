class FeedBack {

    constructor(elementId, appName, appCurrentVersion) {

        this.elementId = elementId;
        this.appName = appName;
        this.appVersion = appCurrentVersion;
        this.storageKey = elementId + '_rating';
        this.server = new ServerRequester('http://api.zeleza.ru', 51153);
        this.element = $(`#${this.elementId}`);
        this.element.on('click', this.sendFeedBack.bind(this));
    }
    sendFeedBack() {

        const self = this;
        const rating = localStorage.getItem(this.storageKey);

        // const error_mess = 'Поле обязательно для заполнения';
        // Документация по Noty
        // https://ned.im/noty/v2/options.html
        //
        new Noty({
            text: "" +
                '<div class="ps-3 pb-1 form-validate">' +
                    "<div class='d-flex flex-row align-items-baseline pt-2 '>" +
                        '<div class="fs-3 mb-3 text-primary me-2">Отзыв на ' + self.appName  +'</div>' +
                        "<div class='badge bg-success bg-opacity-75 lift-up-3'>" + self.appVersion  + "</div>" +
                    "</div>" +
                    '<div class="mb-2">Пишите по существу и самое главное</div>' +
                    '<textarea id="user_review" class="form-control  h-200" placeholder="Суть Вашего предложения или замечений."></textarea>' +
                    '<div style="display: flex;" class="pt-1 input-group" >' +
                        '</span><input id="user_name" type="text" class="form-control" required placeholder="Как к Вам обращаться?" >' +
                        '</span><input id="user_email" type="email" class="form-control" required placeholder="Ваш Email" >' +
                    '</div>' +
                '</div>',
            timeout: false,
            modal: true,
            layout: 'topCenter',
            closeWith: ['button'],
            type: 'confirm',
            buttons: [
                {
                    addClass: 'btn btn-outline-primary me-3',
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
                            'rating': rating,
                        });

                        // закрываем окно и сообщаем об отправке
                        $noty.close();
                        // notyConfirm({text: 'Данные успешно отправлены', type: 'success'});
                    }
                },
                {
                    addClass: 'btn btn-link',
                    text: 'Отменить', onClick: function($noty) {
                        // если нажали кнопку отмены
                        $noty.close();
                        // notyConfirm({text: 'You clicked "Cancel" button', type: 'error'});
                    }
                }
            ]
        }).show();
    }
}
