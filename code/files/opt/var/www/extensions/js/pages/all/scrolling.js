//
// Замедленная, плавная прокрутка
// для этого необходимо чтобы элемента с содержимым (текстом)
// был класса 'scroll-content', а оглавление каждый
// из его указателей имел класс 'scroll-pointer'
// так же, каждый из id должен начинаться с префикса 'scll_'
//
const Scrolling = function () {

    let elementScroll = $('.scroll-content');
    const pointer = $('.scroll-pointer');
    // let $scrollItems = $('a[href^="#"]');

    const smoothScrolling = function(event) {
        let target = $(this.getAttribute('href'));
        if (target.length) {
            event.preventDefault();
            const marginBottom = parseInt(target.css('margin-bottom'), 10);
            const paddingBottom = parseInt(target.css('padding-bottom'), 10);
            const offset = marginBottom + paddingBottom;
            elementScroll.stop().animate({
                scrollTop: target.position().top + elementScroll.scrollTop() - offset
            }, 1000);
        }
    }
    //
    //  Функция для переключения фокуса ввода при наведении мыши
    //  на соответствующий параграф внутри элемента прокрутки
    //
    const scrollContent = function(event) {
        const pointer_href = pointer.map(function() {
            return $($(this).attr('href'));
        });
        pointer.each(function(index) {
            let href = pointer_href[index];
            href.on('mouseenter', () => {
                pointer.removeClass('active');
                $(this).addClass('active');
            });
            href.on('mouseleave', () => {
                $(this).removeClass('active');
            });
        });
    }



    //
    // Return objects assigned to module
    //

    return {
        init: function() {
            $('a[href^="#scll_"]').on('click',smoothScrolling);
            elementScroll.on('mousemove', scrollContent);
            $('a[href^="#scll_device_info"]').trigger('click');
        },
    }

}();


// Initialize module
// ------------------------------

// When content is loaded
document.addEventListener('DOMContentLoaded', function() {
});

// When page is fully loaded
window.addEventListener('load', function() {
    Scrolling.init();
});
