//
// Замедленная, плавная прокрутка
// для этого необходимо чтобы элемент с содержимым (текстом)
// был класса 'scroll-content', у которого потомок только один div
// в котором и содержится заголовок и сам текст
// переход к главам и активация соответствующего пункта в оглавлении
// работает по принципу переход по индексу начиная сверху вниз
//
class Scrolling {
    constructor(id) {
        this.scrollContent = $(id + ' .scroll-content');
        this.scrollPointers = $(id + ' .nav.nav-scrollspy li');
        this.contentElements = $(id + ' .scroll-content > div');

        $(id + ' .nav.nav-scrollspy .nav-link').on('click', (event) => {this.smoothScrolling(event)});
        $(id + ' .scroll-content').on('scroll', () => {this.scrollContentFunc()});
    }

    smoothScrolling(event) {
        event.preventDefault();
        let index = $(event.target).closest('li').index();
        let target = this.contentElements.eq(index);
        this.scrollContent.animate({
            scrollTop: target.offset().top - this.scrollContent.offset().top + this.scrollContent.scrollTop()
        }, 1000);
        this.scrollPointers.find('a').removeClass('active')
        $(event.target).addClass('active');
    }

    scrollContentFunc() {
        this.contentElements.each((index, element) => {
            let content = $(element);

            content.on('mouseenter', () => {
                let $pointers, pointer, subPointers;
                $pointers = this.scrollPointers.find('a');

                $pointers.removeClass('active');
                pointer = $pointers.eq(index);
                subPointers = pointer.find('li').length;
                if (subPointers === 0 ){
                    pointer.addClass('active');
                }
            });
            content.on('mouseleave', () => {
                let $pointers, pointer, ind;
                $pointers = this.scrollPointers.find('a');
                ind =$(element).index();
                pointer = $pointers.eq(ind);
                pointer.removeClass('active');
            });
        });
    }
}
// export default Scrolling;