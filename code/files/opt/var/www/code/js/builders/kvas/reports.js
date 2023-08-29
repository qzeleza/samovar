//
// Устанавливаем в загрузку страницы
// ------------------------------
// Загрузка данные, используемые только для index.html

const root = '../../../';

// Файл основной страницы HTML
$(document).ready(function() {

    try {
        // Добавление дополнительных модулей
        const reportPageLoader = buildMainTemplatePage(root);

        reportPageLoader.add({id:'#page_header', file: root + 'html/apps/kvas/reports/modules/header.html'});
        reportPageLoader.add({id:'#page_breadcrumb', file: root + 'html/apps/kvas/reports/modules/breadcrumb.html'});

        reportPageLoader.add(root + 'code/js/pages/all/select2.js');
        reportPageLoader.add(() => {
            new Scrolling('#report_list');
        });

        reportPageLoader.load()
            .then(() => {

                $('#sidebar_menu .nav-group-sub').addClass('collapse show')
                $('#sidebar_kvas_menu').addClass('collapsed').addClass('nav-item-open');
                $('#sidebar_kvas_reports').addClass('active');

                // Установка триггера для других js файлов
                $(document).trigger("appReady");
            })
            .catch((error) => {
                // Обработка ошибок при загрузке модулей и скриптов
                console.error(error);
            });
    } catch(error){
        console.error(error);
    }

});
