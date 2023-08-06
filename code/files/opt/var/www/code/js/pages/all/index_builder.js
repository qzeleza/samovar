

let Extensions, UserRouter, DeviceInfo;

function buildMainTemplatePage(root){

    const templateLoad = new PageBuilder();

    // Загрузка необходимых страниц и аттрибутов элементов в них для всех страниц шаблона
    templateLoad.add({id:'#right_call_button', file: root + 'pages/all/modules/right_call_button.html'});
    templateLoad.add({ id: '#sidebar_panel', file: root + "pages/all/modules/sidebar.html",
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
    templateLoad.add({id:'#right_panel',file:  root + 'pages/all/modules/right_panel.html',
        attributes: {
            '#logo_samovar_color': {
                src: root + 'assets/images/logo/logo_samovar_color.svg'
            },
        }
    });

    // Загрузка необходимых страниц и аттрибутов элементов в них для всех страниц шаблона
    templateLoad.add({id:'#delete_simple', file: root + 'pages/all/modals/simple_del.html'});
    templateLoad.add({id:'#delete_full', file: root + 'pages/all/modals/full_del.html'});

    templateLoad.add({id:'#samovar_history', file: root + 'pages/library/modules/samovar/history.html'});

    // Загрузка необходимых скриптов для всех страниц шаблона
    templateLoad.add(root + 'code/js/pages/all/apps.js');
    templateLoad.add(root + 'code/js/pages/all/configurator.js');
    templateLoad.add(root + 'code/js/pages/classes/router.js');
    templateLoad.add(root + 'code/js/pages/classes/reviews.js');

    // Загрузка функции, которая подгружает классы
    // рейтинга и обратной связи всех страниц шаблона
    templateLoad.add(() => {

        const appName = 'samovar';

        UserRouter   = new DeviceManager();
        Extensions   = new ExtensionsManager();

        UserRouter.getAppUpdateInfo(appName, (response) => {
            if (response.update) {
                $('#' + appName + '_new_version').html(response.version);
                $('#' + appName + '_update_box').removeClass('d-none');
                const info = "Вышло обновление для <b>Самовара</b>.<br>Новая версия<b> " + response.version + ".</b>";
                showMessage(info, MessageType.INFO);
            }
        })

        new Scrolling('#' + appName + '_history_list');

        UserRouter.getDeviceInfo((deviceInfo) => {
            new Rating(appName, deviceInfo,true);
        });


    });

    return templateLoad;
}
