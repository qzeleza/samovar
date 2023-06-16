$(document).ready(function() {
    let debugScroll = $('.scroll-me');
    // Плавная прокрутка
    $('a[href^="#"]').on('click', function(event) {
        let target = $(this.getAttribute('href'));
        if (target.length) {
            event.preventDefault();
            debugScroll.stop().animate({
                scrollTop: target.position().top + debugScroll.scrollTop() - 80
            }, 1000);
        }
    });

    // Scrollspy
    debugScroll.on('scroll', function() {
        $('.debug').each(function() {
            let position = $($(this).attr('href')).position().top;
            let scroll = debugScroll.scrollTop();
            if (scroll >= position) {
                $('.debug').removeClass('active');
                $(this).addClass('active');
            }
        });
    });
    $('a[href^="#device_info"]').trigger('click');

});
//
//
// // Smooth scrolling
// const Scrolling = function () {
//
//     let debugScroll = $('.scroll-me');
//     let $headers = $('a[href^="#"]');
//     const smoothScrolling = function(event) {
//         let target = $($headers.getAttribute('href'));
//         if (target.length) {
//             event.preventDefault();
//             debugScroll.stop().animate({
//                 scrollTop: target.position().top
//             }, 1000);
//         }
//     }
//
//     const scrollDebug = function(event) {
//         $('.debug').each(function() {
//             let position = $($(this).attr('href')).position().top;
//             let scroll = debugScroll.scrollTop();
//             if (scroll >= position) {
//                 $('.debug').removeClass('active');
//                 $(this).addClass('active');
//             }
//         });
//     }
//     $headers.on('click',smoothScrolling);
//     debugScroll.on('scroll', scrollDebug);
//
//
//     //
//     // Return objects assigned to module
//     //
//
//     return {
//         init: function() {
//             scrollDebug();
//         },
//     }
//
// }();
//
//
// // Initialize module
// // ------------------------------
//
// // When content is loaded
// document.addEventListener('DOMContentLoaded', function() {
// });
//
// // When page is fully loaded
// window.addEventListener('load', function() {
//     Scrolling.init();
// });
