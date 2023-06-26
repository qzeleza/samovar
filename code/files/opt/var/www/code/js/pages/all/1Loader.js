/**
 * Класс PageLoader предназначен для загрузки модулей и скриптов на страницу.
 * Он имеет методы для добавления модулей, скриптов и функций обратного вызова в стеки,
 * а также методы для загрузки данных из стеков и выполнения функций обратного вызова.
 */
class PageLoader {
    constructor() {
        this.scripts = []; // Стек скриптов
        this.modules = []; // Стек модулей
        this.callbacks = []; // Стек функций обратного вызова
    }

    /**
     * Метод для добавления скрипта в стек скриптов.
     * @param {string} script - Имя файла скрипта.
     */
    addScript(script) {
        if (script) {
            this.scripts.push(script);
        }
    }

    /**
     * Метод для добавления модуля в стек модулей.
     * @param {string} id - Идентификатор элемента, в который будет загружен модуль.
     * @param {string} file - Имя файла модуля.
     * @param {Object} attributes - Объект с атрибутами элементов.
     */
    addModule(id, file, attributes= null) {
        if (id && file) {
            this.modules.push({id: id, file: file, attributes: attributes});
        }
    }

    /**
     * Метод для добавления функции обратного вызова
     * в стек функций обратного вызова.
     * @param {function} callback - Функция обратного вызова.
     */
    addCallback(callback) {
        if (callback && typeof callback === 'function') {
            this.callbacks.push(callback);
        }
    }

    /**
     * Метод для загрузки html модулей из стека модулей на основную страницу.
     *
     * Примеры:
     *      // загружаем на страницу в элемент с id=sidebar_panel содержимое файла ./sidebar.html
     *      pageLoader.addModule('sidebar_panel', "./sidebar.html",{
     *
     *         // меняем атрибут href у элемента с id=logo_images
     *         '#logo_images':{href:'index.html'},
     *
     *         // меняем атрибут src у элемента с id=logo_full_image
     *         '#logo_full_image':{src: './/logo_image_gold.svg'},
     *
     *         // добавляем класс active у элемента с id=logo_small_image
     *         '#logo_small_image':{class: ['+active']},
     *
     *         // удаляем класс collapsed у элемента с id=logo_small_image
     *         '#logo_small_image':{class: ['-collapsed']},
     *
     *         // заменяем все классы у элемента с id=logo_text_image на единственный класс nav-item
     *         '#logo_text_image':{class: ['nav-item']},
     *       });
     *  В коде добавлена обработка массивов значений атрибутов. Теперь значения атрибутов могут
     *  быть массивами строк. Каждая строка в массиве обрабатывается отдельно. Если строка
     *  начинается с символа '-', то используется метод removeClass для удаления указанного
     *  класса у элемента. Если строка начинается с символа '+', то используется метод addClass
     *  для добавления указанного класса к элементу. В противном случае используется метод attr
     *  для замены всех классов элемента указанным значением.
     *
     *  Теперь при вызове метода loadPageModules вы можете передавать массивы значений атрибутов
     *  для удаления, добавления и замены классов элементов с указанными селекторами. Например:
     *
     *      pageLoader.addModule('page_header', './header.html', {
     *          '#sidebar_menu .nav-group-sub': {class: ['-collapsed', '+collapse']}
     *      });
     *
     * @returns {Promise} Промис, который разрешается после
     * загрузки всех модулей или отклоняется в случае ошибки.
     */
    loadPageModules() {
        return new Promise((resolve, reject) => {
            let loaded = 0;
            for (const module of this.modules) {
                $(`${module.id}`).load(module.file, (response, status, xhr) => {
                    if (status === 'error') {  // Проверка статуса загрузки модуля
                        reject(`Ошибка при загрузке модуля ${module.file}: ${xhr.statusText}`);
                    } else {
                        if (module.attributes) { // Проверка наличия атрибутов модуля
                            // Обход атрибутов модуля
                            for (const [selector, attributes] of Object.entries(module.attributes)) {
                                // Обход значений атрибутов модуля
                                for (const [attributeName, attributeValues] of Object.entries(attributes)) {
                                    if (attributeName === 'class') {  // Если это класс, то...
                                        // обход по всему массиву значений аттрибутов класса (если заданы несколько классов)
                                        for (const attributeValue of attributeValues) {
                                            if (attributeValue.startsWith('-')) {// и значение начинается с минуса...
                                                // то удаляем класс у элемента
                                                $(selector).removeClass(attributeValue.slice(1));
                                            } else if (attributeValue.startsWith('+')) {// если значение начинается с плюса
                                                // то добавляем класс у элемента
                                                $(selector).addClass(attributeValue.slice(1));
                                            } else {
                                                // если же, нет ни + или - , то меняем все классы элемента указанным значением
                                                $(selector).attr(attributeName, attributeValue);
                                            }
                                        }
                                    } else {
                                        // Если это не класс, просто устанавливаем значения атрибута элемента
                                        $(selector).attr(attributeName, attributeValues);
                                    }
                                }
                            }
                        }
                        loaded++;
                        if (loaded === this.modules.length) {// Проверка загрузки всех модулей
                            resolve();
                        }
                    }
                });
            }
        });
    }


    /**
     * Метод для загрузки скриптов из стека скриптов и выполнения
     * функций обратного вызова из стека функций обратного вызова.
     *
     * @returns {Promise} Промис, который разрешается после загрузки
     * всех скриптов и выполнения всех функций обратного вызова или
     * отклоняется в случае ошибки.
     */
    loadJScripts() {
        return new Promise((resolve, reject) => {

            // Функция по загрузке из стека скриптов и функций
            function loadScript(index) {
                // Проверка индекса скрипта в стеке скриптов
                if (index < this.scripts.length) {
                    $.getScript(this.scripts[index])
                        .done(() => {
                            // Рекурсивный вызов функции для загрузки следующего скрипта из стека скриптов
                            loadScript.call(this, index + 1);
                        })
                        .fail(() => {
                            reject(`Ошибка при загрузке скрипта ${this.scripts[index]}`);
                        });
                } else {
                    try {
                        // по циклу запускаем все имеющиеся функции в стеке
                        for (const callback of this.callbacks) {
                            callback();
                        }
                        resolve();
                    } catch (error) {
                        reject(`Ошибка при выполнении функций из стека: ${error}`);
                    }
                }
            }

            // запускаем обработку стека
            loadScript.call(this, 0);
        });
    }
}

//
//     В этом коде класс PageLoader имеет методы addScript, addModule, addCallback,
//     loadPageModules и loadJScripts для добавления модулей, скриптов и функций
//     обратного вызова в стеки и загрузки данных из стеков. Методы loadPageModules
//     и loadJScripts обрабатывают ошибки при загрузке модулей и скриптов и при
//     выполнении функций обратного вызова. В методе loadJScripts удалена переменная rootPath.
//
//     В примере использования создается экземпляр класса PageLoader и к нему
//     применяются методы addModule, addScript и addCallback для добавления модулей,
//     скриптов и функций обратного вызова в стеки. Затем в функции $(document).ready
//     вызываются методы loadPageModules и loadJScripts для загрузки данных из стеков.
//     Ошибки при загрузке обрабатываются с помощью метода catch промиса.
//
//     Обращение id элементов происходит точно, так же как и в обычном дереве, т.е.
//     обязательно перед названием элемента ставить знак "#"
//

function setRatingAndFeedbackSamovarEvents() {
    let appName = 'Самовар';
    let appVersion = '0.0.3';
    new FeedBack('send_feedback', appName, appVersion);
    new Rating('samovar_rating', appName, appVersion );
}
function buildMainTemplatePage(root){
    const pageLoader = new PageLoader();
    pageLoader.addModule('#right_call_button',root + 'pages/all/modules/right_call_button.html');
    pageLoader.addModule('#sidebar_panel',root + "pages/all/modules/sidebar.html",{
        '#logo_images':{href: root + 'index.html'},
        '#logo_full_image':{src: root + 'assets/images/logo/logo_image_gold.svg'},
        '#logo_small_image':{src: root + 'assets/images/logo/logo_image_gold.svg'},
        '#logo_text_image':{src: root + 'assets/images/logo/logo_text_gold.svg'},

        '#lib_link':{href: root + 'index.html'},
        '#sidebar_kvas_services':{href: root + 'pages/kvas/services/services.html'},
        '#sidebar_kvas_wlist':{href: root + 'pages/kvas/wlist/wlist.html'},
        '#sidebar_kvas_reports':{href: root + 'pages/kvas/reports/reports.html'},
        '#sidebar_menu .nav-link':{class: ['-active']},
        // Удаляем все активные/выделенные элементы меню и сворачиваем все их
        '#sidebar_menu .nav-group-sub':{class:  ['-collapsed', '+collapse']},
    });
    pageLoader.addModule('#right_panel',root + 'pages/all/modules/right_panel.html',{
        '#logo_samovar_color':{src: root + 'assets/images/logo/logo-samovar-color.svg'},
    });
    pageLoader.addModule('#delete_simple',root + 'pages/all/modals/simple_del.html');
    pageLoader.addModule('#delete_full',root + 'pages/all/modals/full_del.html');

    pageLoader.addScript(root + 'code/js/pages/all/apps.js');
    pageLoader.addScript(root + 'code/js/pages/all/configurator.js');
    // pageLoader.addScript(root + 'code/js/pages/all/select2.js');
    pageLoader.addScript(root + 'code/js/pages/all/form_validation_library.js');
    pageLoader.addScript(root + 'code/js/pages/all/ratings.js');
    pageLoader.addScript(root + 'code/js/pages/all/feedback.js');

    pageLoader.addCallback(setRatingAndFeedbackSamovarEvents);

    return pageLoader;
}
