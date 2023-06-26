//
// Замедленная, плавная прокрутка
// для этого необходимо чтобы элемент с содержимым (текстом)
// был класса 'scroll-content', у которого потомок только один div
// в котором и содержится заголовок и сам текст
// переход к главам и активация соответствующего пункта в оглавлении
// работает по принципу переход по индексу начиная сверху вниз
//
const Scrolling = function () {

    let scrollContent;
    let scrollPointers ;
    let contentElements ;

    const smoothScrolling = function(event) {
        event.preventDefault();
        let index = $(this).closest('li').index();
        let target = contentElements.eq(index);
        scrollContent.animate({
            scrollTop: target.offset().top - scrollContent.offset().top + scrollContent.scrollTop()
        }, 1000);
        scrollPointers.find('a').removeClass('active')
        $(this).addClass('active');

    }
    //
    //  Функция для переключения фокуса ввода при наведении мыши
    //  на соответствующий параграф внутри элемента прокрутки
    //
    const scrollContentFunc = function() {

        contentElements.each(function(index) {
            let content = $(this);

            content.on('mouseenter', () => {
                let $pointers, pointer, subPointers;
                $pointers = scrollPointers.find('a');

                $pointers.removeClass('active');
                pointer = $pointers.eq(index);
                subPointers = pointer.find('li').length;
                if (subPointers === 0 ){
                    pointer.addClass('active');
                }



            });
            content.on('mouseleave', () => {
                let $pointers, pointer, ind;
                $pointers = scrollPointers.find('a');
                ind =$(this).index();
                pointer = $pointers.eq(ind);
                pointer.removeClass('active');
            });

        });
    }



    //
    // Return objects assigned to module
    //

    return {
        init: function() {
            scrollContent = $('.scroll-content');
            scrollPointers = $('.nav.nav-scrollspy li');
            contentElements = $('.scroll-content > div');

            $('.nav.nav-scrollspy .nav-link').on('click', smoothScrolling);
            scrollContent.on('scroll',scrollContentFunc);
        },
    }

}();


// Загружаем данные только после загрузки loader.js
// который отвечает за загрузку данных из других файлов в один
// $(document).on("appReady", function() {

Scrolling.init();

// });
