const animateLogo = function() {
$(document).ready(function() {
    // Get the content element
    const $content = $('.content');

    // Get the navbar-brand element
    const $navbarBrand = $('.navbar-brand');
    // $navbarBrand.css('left', 0)

    // Get the height of the window
    const windowHeight = $(window).height();

    // Get the height of the content element
    const contentHeight = $content.height();

    const div = contentHeight/windowHeight;

    // Calculate the top position for centering the content element
    const topPosition = ((windowHeight - contentHeight) / 2) * div;

    // Animate the content element to move it to the center with a bounce effect
    $content.animate({top: topPosition}, {
        duration: 1000,
        easing: 'easeOutBounce'
    });

    // Get the width of the parent container
    const containerWidth = $navbarBrand.parent().width();

    // Get the width of the navbar-brand element
    const navbarBrandWidth = $navbarBrand.width();
    // Get the width of the d-flex element
    const dFlexWidth = $('.d-flex').width();

    // Calculate the left position for centering the navbar-brand element
    const leftPosition = (containerWidth - navbarBrandWidth + dFlexWidth) / 2 ;


        // Animate the navbar-brand element to move it to the center
        $navbarBrand.animate({left: leftPosition}, 1000);
    });

}

// When content is loaded
// document.addEventListener('DOMContentLoaded', function() {
//
// });

// When page is fully loaded
// window.addEventListener('load', function() {
animateLogo();
// });

