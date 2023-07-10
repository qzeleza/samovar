/*
* Класс PageBuilder предназначен для загрузки модулей и скриптов на страницу.
* Он имеет методы для добавления модулей, скриптов и функций обратного вызова в стеки,
* а также методы для загрузки данных из стеков и выполнения функций обратного вызова.
*/
class PageBuilder {
    /**
     * Создает новый экземпляр класса PageLoader.
     */
    constructor() {
        this.callStack = []; // Стек вызовов
    }

    /**
     * Добавляет данные в стек вызовов.
     * @param {Object} data - Данные, которые нужно добавить в стек вызовов.
     * @param {string} [data.id] - Идентификатор элемента, к которому нужно применить данные.
     * @param {string} [data.file] - Путь к файлу, который нужно загрузить.
     * @param {Object} [data.attributes] - Атрибуты, которые нужно применить к элементу.
     */
    add(data) {
        if (!data) {
            throw new Error('Некорректные данные');
        }

        // Определение типа данных
        let type;
        if (typeof data === 'string') {
            const extension = data.split('.').pop();
            if (extension === 'js') {
                type = 'script';
            } else if (extension === 'html') {
                type = 'module';
            }
        } else if (typeof data === 'function') {
            type = 'callback';
        } else if (typeof data === 'object' && data.file) {
            type = 'module';
        } else if (typeof data === 'object' && !data.file) {
            type = 'attributes';
        }

        if (!type) {
            throw new Error('Некорректные данные');
        }

        this.callStack.push({type: type, id: data.id, data: data});
    }

    /**
     * Загружает все данные из стека вызовов.
     * @returns {Promise} Promise, который разрешается, когда все данные загружены.
     */
    load() {
        if (this.callStack.length === 0) {
            throw new Error('Стек вызовов пуст');
        }
        this._removeDuplicateScripts(); // Удаление повторяющихся скриптов из стека вызовов

        return new Promise((resolve, reject) => {
            let index = 0;
            const loadNext = () => {
                if (index < this.callStack.length) {
                    const item = this.callStack[index];
                    index++;
                    switch (item.type) {
                        case 'script':
                            // Загрузка скрипта
                            $.getScript(item.data)
                                .done(() => {
                                    loadNext();
                                })
                                .fail((jqxhr, settings, exception) => {
                                    reject(new Error(`Ошибка при загрузке скрипта ${item.data}: ${exception}`));
                                });
                            break;
                        case 'module':
                            const elemChecked = $(`${item.id}`);
                            // Загрузка модуля
                            if (!elemChecked.length) {
                                reject(`Ошибка при загрузке модуля ${item.data.file}: элемент с идентификатором ${item.id} не найден`);
                            } else {
                                elemChecked.load(item.data.file, (response, status, xhr) => {
                                    if (status === 'error') {
                                        reject(`Ошибка при загрузке модуля ${item.data.file}: ${xhr.statusText}`);
                                    } else if (!response || response.trim().length === 0) {
                                        reject(`Ошибка при загрузке модуля ${item.data.file}: пустой ответ`);
                                    } else {
                                        // Применение атрибутов к загруженному модулю
                                        this._applyAttributes(item.id, item.data.attributes, reject);
                                        loadNext();
                                    }
                                });
                            }
                            break;
                        case 'callback':
                            // Вызов функции обратного вызова
                            item.data();
                            loadNext();
                            break;
                        case 'attributes':
                            // Применение атрибутов к элементу
                            this._applyAttributes(item.id, item.data.attributes, reject);
                            loadNext();
                            break;
                    }
                } else {
                    resolve();
                }
            };
            loadNext();
        });
    }

    /**
     * Удаляет повторяющиеся скрипты из стека вызовов.
     * @private
     */
    _removeDuplicateScripts() {
        const scripts = new Set();
        for (let i = this.callStack.length - 1; i >= 0; i--) {
            const item = this.callStack[i];
            if (item.type === 'script') {
                if (scripts.has(item.data)) {
                    this.callStack.splice(i, 1);
                } else {
                    scripts.add(item.data);
                }
            }
        }
    }

    /**
     * Применяет атрибуты к указанному элементу.
     * @private
     * @param {string} id - Идентификатор элемента, к которому нужно применить атрибуты.
     * @param {Object} attributes - Атрибуты, которые нужно применить к элементу.
     * @param {function} reject - Функция, которая вызывается, если произошла ошибка.
     */
    _applyAttributes(id, attributes, reject) {
        try {
            // Применение атрибутов к элементу
            if (attributes) {
                for (const [selector, attributeValues] of Object.entries(attributes)) {
                    for (const [attributeName, values] of Object.entries(attributeValues)) {
                        if (attributeName === 'class') {
                            for (const value of values) {
                                if (value.startsWith('-')) {
                                    $(selector).removeClass(value.slice(1));
                                } else if (value.startsWith('+')) {
                                    $(selector).addClass(value.slice(1));
                                } else {
                                    $(selector).attr(attributeName, value);
                                }
                            }
                        } else {
                            if ($(selector).attr(attributeName) === undefined) {
                                throw new Error(`Атрибут ${attributeName} отсутствует в элементе ${selector}`);
                            }
                            $(selector).attr(attributeName, values);
                        }
                    }
                }
            }
        } catch (error) {
            reject(error);
        }
    }
}

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
    // templateLoad.add(root + 'code/js/pages/all/form_validation_library.js');
    templateLoad.add(root + 'code/js/pages/all/ratings.js');

    // Загрузка функции, которая подгружает классы
    // рейтинга и обратной связи всех страниц шаблона
    templateLoad.add(() => {
        new Scrolling('#samovar_history_list');
        const smr = new Rating('samovar', 'latest', true);
        // $('#samovar_review').on('click', function (){
        //     $('.btn-close[data-bs-dismiss="offcanvas"]').trigger('click');
        //     smr.sendReviewToServer();
        // })
    });

    return templateLoad;
}
