const news = $('#smv_new_ver');
const collapse_news = $('#collapse-link');
const latest = $('#last_ver');

news.on('click', function(event) {
    event.preventDefault();
    collapse_news.addClass('show');
    $('#smv-scroll-box').animate({
        scrollTop: latest.offset().top
    }, 1000);

});