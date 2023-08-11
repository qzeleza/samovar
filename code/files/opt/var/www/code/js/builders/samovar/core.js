let ReviewsServer, UserRouter, samovarApp, RouterServer;
const RusNames = {
    samovar: "Самовар",
    kvas: "Квас",
}

function buildMainTemplatePage(root){

    const templateLoad = new PageBuilder();
    const app_name = 'samovar';

    // Загрузка необходимых страниц и аттрибутов элементов в них для всех страниц шаблона
    templateLoad.add({id:'#right_call_button', file: root + 'pages/core/parts/right_call_button.html'});
    templateLoad.add({ id: '#sidebar_panel', file: root + "pages/core/parts/sidebar.html",
        attributes: {
            '#logo_images_link': {
                href: root + 'index.html'
            },
            '#logo_full_image': {
                src: root + 'assets/images/logo/logo_image_gold.svg'
            },
            '#logo_small_image': {
                src: root + 'assets/images/logo/logo_image_gold.svg'
            },
            '#logo_text_image': {
                src: root + 'assets/images/logo/logo_text_gold.svg'
            },
            '#lib_link': {
                href: root + 'index.html'
            },
            '#sidebar_kvas_services': {
                href: root + 'pages/kvas/services/services.html'
            },
            '#sidebar_kvas_wlist': {
                href: root + 'pages/kvas/wlist/wlist.html'
            },
            '#sidebar_kvas_reports': {
                href: root + 'pages/kvas/reports/reports.html'
            },
            '#sidebar_menu .nav-link': {
                class: ['-active']
            },
            '#sidebar_menu .nav-group-sub': {
                class:  ['-collapsed', '+collapse']
            },
        }

    });

    // Загружаем код правой панели
    templateLoad.add({id:'#right_panel',file:  root + 'pages/core/parts/right_panel.html',
        attributes: {
            '#logo_samovar_color': {
                src: root + 'assets/images/logo/logo_samovar_color.svg'
            },
        }
    });

    // Загрузка необходимых страниц и аттрибутов элементов в них для всех страниц шаблона
    // templateLoad.add({id:'#samovar_delete_simple_modal', file: root + 'pages/all/modals/simple_del.html'});
    // templateLoad.add({id:'#samovar_delete_full_modal', file: root + 'pages/all/modals/full_del.html'});
    templateLoad.add({id:'#samovar_history_modal', file: root + 'pages/library/modules/samovar/history.html'});

    // Загрузка необходимых скриптов для всех страниц шаблона
    templateLoad.add(root + 'code/js/libraries/core/init.js');
    templateLoad.add(root + 'code/js/libraries/core/router.js');
    templateLoad.add(root + 'code/js/libraries/core/extensions.js');

    // Устанавливаем экземпляры серверов для работы
    templateLoad.add(() => {
        RouterServer        = new NetworkRequestManager(ROUTER_URL, 11133, '/kvas/v1');
        UserRouter          = new DeviceManager(RouterServer);
        ReviewsServer       = new NetworkRequestManager("api.zeleza.ru", 11211, '/api/v1');
        samovarApp          = new AppsManager(app_name, RouterServer);
    });

    // Связываем кнопку вызова истории версий для Самовара
    // Получаем данные об истории версий (если есть) для запрошенного приложения
    templateLoad.add(() => {
        samovarApp.getAppVersionHistory();
    } );


    // Проверяем самовар на наличие обновлений
    templateLoad.add(() => {
        UserRouter.getAppUpdateInfo(app_name, (response) => {
            if (response.update) {
                $('#' + app_name + '_new_version').html(response.version);
                $('#' + app_name + '_update_box').removeClass('d-none');
                const info = "Вышло обновление для <b>Самовара</b>.<br>Новая версия<b> " + response.version + ".</b>";
                showMessage(info, MessageType.INFO);
            }
        })
    });

    // Загрузка функции, которая подгружает классы
    // рейтинга и обратной связи всех страниц шаблона
    templateLoad.add(() => {
        UserRouter.getDeviceInfo((deviceInfo) => {
            new Rating(app_name, deviceInfo,true);
        });
    });


    return templateLoad;
}
