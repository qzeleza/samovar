$(document).on("appReady", function() {

    let stars = $('.ph-star');
    let rating = 6;

    stars.slice(0, rating).addClass('text-warning')

    // Функция, которая показывает уведомление
    // о приеме оценки и показывает форму для отправки отзыва
    const sendFeedBack = function() {
        let notyConfirm = new Noty({
            text: '<h4 class="mb-3">Спасибо за Вашу оценку ('+ rating + '/' + stars.length + ')</h4>' +
                  '<label class="form-label">Будем признательны за обратную связь</label> ' +
                  '<textarea class="form-control" placeholder="Что понравилось, а что нет?" style="height: 200px;"></textarea>',
            timeout: false,
            modal: true,
            layout: 'topCenter',
            closeWith: 'button',
            type: 'confirm',
            buttons: [
                Noty.button('Отменить', 'btn btn-link', function () {
                    notyConfirm.close();
                }),

                Noty.button('Отправить <i class="ph-paper-plane-tilt ms-2"></i>', 'btn btn-outline-secondary ms-2', function () {
                        alert('Отправлено!');
                        notyConfirm.close();
                    },
                    {id: 'button1', 'data-status': 'ok'}
                )
            ]
        }).show();
    };

    function setRating(e) {
        let index = stars.index(this);
        stars.slice(0, index + 1).addClass('text-warning')
        stars.slice(index + 1, stars.length).removeClass('text-warning')
        rating = index + 1;
    }

    stars.on('mouseover', setRating);
    stars.on('click', sendFeedBack);
});
