//
// Устанавливаем в загрузку страницы
// ------------------------------

// Во время загрузки страницы,
// загружаем основные части html,
// которые используем во всех страницах Самовара:
function loadGeneralModules(homePath) {

    return new Promise((resolve) => {
        // кнопку вызова правой панели
        $("#right_call_button").load(homePath + "pages/all/elements/right_call_button.html", resolve);

        // правую панель настроек Самовара
        $("#sidebar_panel").load(homePath + "pages/all/elements/sidebar.html", function() {
            $('#logo_images').attr('href', homePath + "index.html");
            $('#logo_full_image').attr('src', homePath + "assets/images/logo/logo_image_gold.svg");
            $('#logo_small_image').attr('src', homePath + "assets/images/logo/logo_image_gold.svg");
            $('#logo_text_image').attr('src', homePath + "assets/images/logo/logo_text_gold.svg");
        });
        $("#right_panel").load(homePath + "pages/all/elements/right_panel.html", function() {
            // модальное окно на простое удаление Самовара
            $("#delete_simple").load(homePath + "pages/all/modals/simple_del.html", resolve);
            // модальное окно на полное удаление Самовара
            $("#delete_full").load(homePath + "pages/all/modals/full_del.html", resolve);
        });

    });
}
