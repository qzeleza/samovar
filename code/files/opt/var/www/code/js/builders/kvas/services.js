//
// Устанавливаем в загрузку страницы
// ------------------------------
// Загрузка данные, используемые только для index.html


// const root = '';

// Файл основной страницы HTML
$(document).ready(function() {

    const root = '../../../';

    try {

        const servicePageLoader = buildMainTemplatePage(root);

        servicePageLoader.add({id:'#page_header', file: root + 'html/apps/kvas/services/modules/header.html'});
        servicePageLoader.add({id:'#page_breadcrumb', file: root + 'html/apps/kvas/services/modules/breadcrumb.html'});
        servicePageLoader.add({id:'#app_kvas_card', file: root + 'html/apps/kvas/services/modules/card.html'});
        servicePageLoader.add({id:'#modal_form_ssr_data', file: root + 'html/apps/kvas/services/modules/ssr_setup.html'});

        servicePageLoader.add(root + 'code/js/pages/all/select2.js');
        servicePageLoader.add(root + "code/js/pages/services/accordion.js");

        // Загрузка всех данных из стека вызовов
        servicePageLoader.load().then(() => {

            // открываем в боковом меню пункт Сервисы
            $('#sidebar_menu .nav-group-sub').addClass('collapse show')
            $('#sidebar_kvas_menu').addClass('collapsed').addClass('nav-item-open');
            $('#sidebar_kvas_services').addClass('active');

            // Установка триггера для других js файлов
            $(document).trigger("appReady");

            // console.log('Все данные загружены');

        }).catch((error) => {
            console.error(error);
        });


    } catch(error){
        console.error(error);
    }

});
