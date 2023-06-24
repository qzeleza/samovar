class FeedBack {

    constructor(elementId, appName, appCurrentVersion) {

        this.elementId = elementId;
        this.appName = appName;
        this.appVersion = appCurrentVersion;
        this.element = $(`#${this.elementId}`);

        this.element.on('click', this.sendFeedBack.bind(this));
    }
    sendFeedBack() {

        // const error_mess = 'Поле обязательно для заполнения';
        let notyConfirm = new Noty({
            text: "" +
                '<div class="ps-3 pb-1 form-validate">' +
                    "<div class='d-flex flex-row align-items-baseline pt-2 '>" +
                        '<div class="fs-3 mb-3 text-primary me-2">Отзыв на ' + this.appName  +'</div>' +
                        "<div class='badge bg-success bg-opacity-75 lift-up-3'>" + this.appVersion  + "</div>" +
                    "</div>" +
                    '<div class="mb-2">Пишите по существу и самое главное</div>' +
                    '<textarea class="form-control  h-200" placeholder="Суть Вашего предложения или замечений."></textarea>' +
                    '<div style="display: flex;" class="pt-1 input-group" >' +
                        '</span><input type="text" class="form-control" required placeholder="Как к Вам обращаться?" >' +
                        '</span><input type="email" class="form-control" required placeholder="Ваш Email" >' +
                    '</div>' +
                '</div>',
            timeout: false,
            modal: true,
            layout: 'topCenter',
            closeWith: ['button'],
            type: 'confirm',
            buttons: [
                Noty.button('Отменить', 'btn btn-link', function () {
                    notyConfirm.close();
                }),

                Noty.button('Отправить <i class="ph-paper-plane-tilt ms-2"></i>', 'btn btn-outline-primary me-3', function () {
                        alert('Отправлено!');
                        // здесь размещаем код по отправке
                        // обратной связи по расширению
                        notyConfirm.close();
                    },
                    {id: 'kvas_send_feedback', 'data-status': 'ok'}
                )
            ]
        }).show();
    }
}
