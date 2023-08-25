let ReviewsServer, CAMOBAP, RouterServer, ROUTER_INFO;

// При запуске в серию необходимо установить TEST_STAGE = false
const PROD_ROUTER_URL = window.location.href;
const TEST_ROUTER_URL = "kvas.zeleza.ru";
const TEST_STAGE    = true
const ROUTER_URL        = TEST_STAGE ? TEST_ROUTER_URL : PROD_ROUTER_URL


function buildMainTemplatePage(root, rightPanel){

    const templateLoad = new PageBuilder();
    const appName = 'samovar';

    // Загрузка необходимых страниц и аттрибутов элементов в них для всех страниц шаблона
    templateLoad.add({id:'#right_call_button', file: root + 'pages/core/parts/right_toolbar.html'});
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
    templateLoad.add(() => {
        // установка кнопки вида
        initSideBarResizeState();
    });

    // Загрузка необходимых страниц и аттрибутов элементов в них для всех страниц шаблона
    // templateLoad.add({id:'#samovar_delete_simple_modal', file: root + 'pages/all/modals/simple_del.html'});
    // templateLoad.add({id:'#samovar_delete_full_modal', file: root + 'pages/all/modals/full_del.html'});
    // templateLoad.add({id:'#samovar_history_modal', file: root + 'pages/library/modules/CAMOBAP/history.html'});

    // Загрузка необходимых скриптов для всех страниц шаблона
    templateLoad.add(root + 'code/js/libraries/core/init.js');
    templateLoad.add(root + 'code/js/libraries/core/apps.manager.js');
    templateLoad.add(root + 'assets/js/vendor/ui/dragula.min.js');

    // Устанавливаем экземпляры серверов для работы
    templateLoad.add(() => {
        RouterServer        = new NetworkRequestManager(ROUTER_URL, 11133, '/kvas/v1');
        ReviewsServer       = new NetworkRequestManager("api.zeleza.ru", 11211, '/api/v1');
        CAMOBAP             = new AppsManager(appName, RouterServer, rightPanel, true);
    });


    templateLoad.add(() => {
        // Проверяем самовар на наличие обновлений
        CAMOBAP.checkAppUpdate(false);
        // Получаем данные об истории версий (если есть) для запрошенного приложения
        CAMOBAP.createAppVersionHistory(true);

    });

    // Загрузка функции, которая подгружает классы
    // рейтинга и обратной связи всех страниц шаблона
    templateLoad.add(() => {
        const data= {};
        data[appName] = {}
        CAMOBAP.createRatingsForApps(data);

        // createRatingsForApps(data, ReviewsServer, rightPanel);
    });

    templateLoad.add(() => {
        const appRusName = 'Самовар';
        CAMOBAP.createAppVideoPreview();
        CAMOBAP.initDeleteDialog('full', appRusName);
        CAMOBAP.initDeleteDialog('simple', appRusName);
    });



    return templateLoad;
}
