/* ------------------------------------------------------------------------------
 *
 *  # Select extension for Datatables
 *
 *  Demo JS code for datatable_extension_select.html page
 *
 * ---------------------------------------------------------------------------- */


// Setup module
// ------------------------------


// const checkHeader= "";
// const nickHeader= "Название";
// const domainHeader= "Домен";
// const subdomainHeader= "Поддомены";
// const ipListHeader= "Список IP";

let tableData = [
        [
            "",
            "Кинозал",
            "<i class=\"ph-check\"></i><span class='text-light'>*</span>",
            "<a href=\"#\">kinozal.tv</a>",
            "<a href=\"#\">122.333.112.344</a>",
            "122.333.112.344<br>122.333.112.344<br>122.333.112.344<br>122.333.112.344<br>122.333.112.344<br>122.333.112.344",
        ],
        [
            "",
            "Гугл",
            "",
            "<a href=\"#\">google.tv</a>",
            "<a href=\"#\">122.333.112.344</a>",
            "122.333.112.344",
        ],
        [
            "",
            "Клаб",
            "<i class=\"ph-check\"></i><span class='text-light'>*</span>",
            "<a href=\"#\">club.tv</a>",
            "<a href=\"#\">122.333.112.344</a>",
            "122.333.112.344 122.333.112.344 122.333.112.344 122.333.112.344 122.333.112.344 122.333.112.344 122.333.112.344 122.333.112.344 122.333.112.344 122.333.112.344",
        ],
        [
            "",
            "Список",
            "",
            "<a href=\"#\">list.tv</a>",
            "<a href=\"#\">122.333.112.344</a>",
            "122.333.112.344 122.333.112.344 122.333.112.344 122.333.112.344 122.333.112.344",
        ],
        [
            "",
            "Люкс",
            "<i class=\"ph-check\"></i><span class='text-light'>*</span>",
            "<a href=\"#\">lux.tv</a>",
            "122.333.112.344",
            "отсутствуют",
        ],
        [
            "",
            "Бред ТВ",
            "<i class=\"ph-check\"></i><span class='text-light'>*</span>",
            "<a href=\"#\">bred.tv</a>",
            "<a href=\"#\">122.333.112.344</a>",
            "122.333.112.344 122.333.112.344 122.333.112.344 122.333.112.344 122.333.112.344",
        ],
        [
            "",
            "Миск",
            "<i class=\"ph-check\"></i><span class='text-light'>*</span>",
            "<a href=\"#\">misc.tv</a>",
            "отсутствуют",
            "отсутствуют",
        ],
        [
            "",
            "Твитер",
            "<i class=\"ph-check\"></i><span class='text-light'>*</span>",
            "<a href=\"#\">122.333.112.344</a>",
            "отсутствуют",
            "отсутствуют",
        ],
        [
            "",
            "Кругляк",
            "",
            "<a href=\"#\">112.122.44.111-112.122.44.225</a>",
            "<a href=\"#\">122.333.112.344</a>",
            "122.333.112.344 122.333.112.344 122.333.112.344 122.333.112.344 122.333.112.344 122.333.112.344 122.333.112.344 122.333.112.344 122.333.112.344 122.333.112.344 122.333.112.344 122.333.112.344 122.333.112.344 122.333.112.344 122.333.112.344 122.333.112.344 122.333.112.344 122.333.112.344 122.333.112.344 122.333.112.344 122.333.112.344 122.333.112.344 122.333.112.344 122.333.112.344 122.333.112.344 122.333.112.344 122.333.112.344 122.333.112.344 122.333.112.344",
        ],
]

const DatatableSelect = function() {


    //
    // Setup module components
    //

    const idSelectAllRowsInput = "select_all_rows_input";
    const tableSelectClassName = "datatable-select-checkbox";
    const saveMeButtonId = "save_me_1";

    let disableToSave = true;

    // Basic Datatable examples
    const TableSelectInit = function() {

        if (!$().DataTable) {
            console.warn('Внимание - datatables.min.js не загружен!');
            return;
        }

        const filterMeButtonId = "filter_me_1"
        const selectMeButtonId = "select_me_1"
        const filterRecordsTag = "<i class=\"ph-funnel ms-2 me-2\"></i>";
        const selectRecordsTag = "<i class=\"ph-star-four ms-2 me-2\"></i>";
        const allRecordsText = "<i class=\"ph-list\"></i>";
        const domainSelectText = "<i class=\"ph-browser\"></i>";
        const ipSelectText = '<i class=\"ph-terminal-window\"></i>&nbsp; IP';
        const ipRangeSelectText = '<i class=\"ph-terminal-window\"></i>&nbsp;IP-IP';
        const subDomainIsSelectText = '<i class=\"ph-folder-open\"></i>';
        const subDomainNotInSelectText = '<i class=\"ph-folder-simple-dotted\"></i>';

        // Setting datatable defaults
        $.extend( $.fn.dataTable.defaults, {
            // responsive: true,
            data: tableData,

            dom: '<"datatable-header bg-success bg-opacity-20 justify-content-start"f<"ms-sm-start"l><"ms-sm-3"B><"ms-auto save-button ">><"datatable-scroll-wrap"t><"datatable-footer bg-success bg-opacity-20"ip>',
            language: {
                // url: "../../assets/localisation/ru.json",
                search: '<span class="me-3">Найти:</span> <div class="form-control-feedback form-control-feedback-end flex-fill tooltip-info" data-bs-popup="tooltip" data-bs-original-title="В случае отсутствия искомого домена, создается запрос на добавление доменного имени.">_INPUT_<div class="form-control-feedback-icon"><i class="ph-magnifying-glass opacity-50"></i></div></div>',
                searchPlaceholder: 'Поиск...',
                info: "Показано: _TOTAL_",
                infoFiltered: "из _MAX_.",
                zeroRecords: "Записи отсутствуют.",
                emptyTable: "В таблице отсутствуют данные",
                infoEmpty: "Записей: 0",
                // lengthMenu: '<span class="align-content-center me-3">Показать:</span> _MENU_',
                select: {
                    rows: {
                        _: "Выбрано: %d",
                        1: "Выбрано: 1"
                    },
                },
            },

            paging: false,
            autoWidth: true,
            scrollY: '30vh',
            // scrollX: 100,
            scrollCollapse: true,

        });




        // Checkbox selection
        $("." + tableSelectClassName).DataTable({

            responsive: {
                details: {
                    type: 'column',
                    target: 4
                }
            },
            colReorder: true,
            columnDefs: [
                {
                    // 1. Нумерация
                    orderable: true,
                    className: 'text-center',
                    targets: 0,
                },
                {
                    // 2. Название
                    orderable: false,
                    // className: 'text-start',
                    targets: 1
                },
                {
                    // 3. Поддомен
                    orderable: true,
                    className: 'text-center sub-domain-filter',
                    // width: '30px',
                    targets: 2
                },
                {
                    // 4. Домен
                    orderable: true,
                    targets: 3,
                    // width: '10px',
                    className: 'text-start domain-filter',
                },
                {
                    // 5. Первый IP в списке
                    orderable: true,
                    targets: 4,
                    className: 'dtr-control text-start',
                },
                {
                    // 6. Оставшиеся IP из списка
                    orderable: false,
                    targets: 5,
                    className: 'none',
                    render: function (data, type, row) {
                        return "<div class=''>" + data + "</div>";
                        },
                },
            ],

            select: {
                style: 'multi',
                // checkbox: true,
                // selector: 'td:first-child',
                className: 'bg-warning bg-opacity-10',
                items: 'row',
            },

            // order: [[3, 'desc']],

            buttons: [
                {
                    // Группа кнопок Выбора записей
                    extend: 'collection',
                    text: selectRecordsTag + allRecordsText,
                    attr: {
                        id: selectMeButtonId,
                        'data-bs-popup': 'tooltip',
                        'data-bs-original-title': 'Отмечаем записи в списке',
                    },
                    autoClose: true,
                    className: 'btn btn-light btn-icon dropdown-toggle pe-2 tooltip-info',
                    buttons: [
                         {
                            text: allRecordsText + " Все записи",
                            action: function ( e, dt, node, config ) {

                                this.buttons('filter_buttons', null).action();
                                this.columns().search('').draw().rows().deselect();
                                this.rows().select();
                                $('#' + selectMeButtonId).html(selectRecordsTag + allRecordsText);
                                $('#' + filterMeButtonId).html(filterRecordsTag + allRecordsText);
                                $('#' + idSelectAllRowsInput).prop('checked', true);

                            }
                        },
                        {

                            text: domainSelectText + " Домены",
                            action: function ( e, dt, node, config ) {
                                $('#' + idSelectAllRowsInput).prop('checked', false);
                                this.columns().search('').draw().rows().deselect();
                                this
                                    .column('.domain-filter' )
                                    .search( '^[a-zA-Z].*', true, false )
                                this.rows({search:'applied'}).select();
                                $('#' + selectMeButtonId).html(selectRecordsTag + domainSelectText);
                                $('#' + filterMeButtonId).html(filterRecordsTag + allRecordsText);
                            }
                        },
                        {
                            text: subDomainIsSelectText + " Поддомены",
                            action: function ( e, dt, node, config ) {
                                $('#' + idSelectAllRowsInput).prop('checked', false);
                                this.columns().search('').draw().rows().deselect();
                                this
                                    .column('.sub-domain-filter')
                                    .search('^[\\u0000-\\uFFFF]+$', true, false )
                                this.rows({search:'applied'}).select();
                                $('#' + selectMeButtonId).html(selectRecordsTag + subDomainIsSelectText);
                                $('#' + filterMeButtonId).html(filterRecordsTag + allRecordsText);
                            }
                        },

                        {
                            text: subDomainNotInSelectText + " Без поддоменов",
                            action: function ( e, dt, node, config ) {
                                $('#' + idSelectAllRowsInput).prop('checked', false);
                                this.columns().search('').draw().rows().deselect();
                                this
                                    .column('.sub-domain-filter')
                                    .search('^$', true, false )
                                this.rows({search:'applied'}).select();
                                $('#' + selectMeButtonId).html(selectRecordsTag + subDomainNotInSelectText);
                                $('#' + filterMeButtonId).html(filterRecordsTag + allRecordsText);
                            }
                        },

                        {
                            text: ipSelectText + " адреса",
                            action: function ( e, dt, node, config ) {
                                $('#' + idSelectAllRowsInput).prop('checked', false);
                                this.columns().search('').draw().rows().deselect();
                                this
                                    .column( '.domain-filter',)
                                    .search( '^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$', true, false )
                                    // .draw()
                                this.rows({search:'applied'}).select();
                                $('#' + selectMeButtonId).html(selectRecordsTag + ipSelectText);
                                $('#' + filterMeButtonId).html(filterRecordsTag + allRecordsText);
                            }
                        },
                        {
                            text: ipRangeSelectText + " интервалы",
                            action: function ( e, dt, node, config ) {
                                $('#' + idSelectAllRowsInput).prop('checked', false);
                                this.columns().search('').draw().rows().deselect();
                                this
                                    .column( '.domain-filter')
                                    .search( '^[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}-[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}$', true, false )
                                this.rows({search:'applied'}).select();
                                $('#' + selectMeButtonId).html(selectRecordsTag + ipRangeSelectText);
                                $('#' + filterMeButtonId).html(filterRecordsTag + allRecordsText);
                            }
                        },


                    ]
                },

                {
                    // Группа кнопок Фильтрации записей
                    extend: 'collection',
                    text: filterRecordsTag + allRecordsText,
                    attr: {
                        id: filterMeButtonId,
                        'data-bs-popup': 'tooltip',
                        'data-bs-original-title': 'Фильтр записей',
                    },
                    name: 'filter_buttons',
                    autoClose: true,
                    className: 'btn btn-light btn-icon dropdown-toggle pe-2 tooltip-info',
                    buttons: [
                         {
                            text: allRecordsText + " Все",
                            action: function ( e, dt, node, config ) {
                                this.button(0).action();
                                this.columns().search('').draw();
                                $('#' + filterMeButtonId).html(filterRecordsTag + allRecordsText);
                                $('#' + selectMeButtonId).html(selectRecordsTag + allRecordsText);
                                $('#' + idSelectAllRowsInput).prop('checked', false);
                            }
                        },
                        {
                            text: domainSelectText + " Домены",
                            action: function ( e, dt, node, config ) {
                                this.columns().search('').draw();
                                this
                                    .column( '.domain-filter' )
                                    .search( '^[a-zA-Z].*', true, false )
                                    .draw();
                                $('#' + filterMeButtonId).html(filterRecordsTag + domainSelectText);
                                $('#' + selectMeButtonId).html(selectRecordsTag + allRecordsText);
                                $('#' + idSelectAllRowsInput).prop('checked', false);
                            }
                        },

                        {
                            text: subDomainIsSelectText + " Поддомены",
                            action: function ( e, dt, node, config ) {
                                this.columns().search('').draw();
                                this
                                    .rows().deselect()
                                    .column('.sub-domain-filter')
                                    .search('^[\\u0000-\\uFFFF]+$', true, false )
                                    .draw()
                                $('#' + filterMeButtonId).html(filterRecordsTag + subDomainIsSelectText);
                                $('#' + selectMeButtonId).html(selectRecordsTag + allRecordsText);
                                $('#' + idSelectAllRowsInput).prop('checked', false);
                            }
                        },

                        {
                            text: subDomainNotInSelectText + " Без поддоменов",
                            action: function ( e, dt, node, config ) {
                                this.columns().search('').draw();
                                this
                                    .rows().deselect()
                                    .column('.sub-domain-filter')
                                    .search('^$', true, false )
                                    .draw()
                                $('#' + filterMeButtonId).html(filterRecordsTag + subDomainNotInSelectText);
                                $('#' + selectMeButtonId).html(selectRecordsTag + allRecordsText);
                                $('#' + idSelectAllRowsInput).prop('checked', false);
                            }
                        },

                        {
                            text: ipSelectText + " адреса",
                            action: function ( e, dt, node, config ) {
                                this.columns().search('').draw();
                                this
                                    .column( '.domain-filter',)
                                    .search( '^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$', true, false )
                                    .draw()
                                $('#' + filterMeButtonId).html(filterRecordsTag + ipSelectText);
                                $('#' + selectMeButtonId).html(selectRecordsTag + allRecordsText);
                                $('#' + idSelectAllRowsInput).prop('checked', false);
                            }
                        },
                        {
                            text: ipRangeSelectText + " интервалы",
                            action: function ( e, dt, node, config ) {
                                this.columns().search('').draw();
                                this
                                    .column( '.domain-filter')
                                    .search( '^[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}-[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}$', true, false )
                                    .draw();
                                $('#' + filterMeButtonId).html(filterRecordsTag + ipRangeSelectText);
                                $('#' + selectMeButtonId).html(selectRecordsTag + allRecordsText);
                                $('#' + idSelectAllRowsInput).prop('checked', false);
                            }
                        }
                    ]
                },

            ],

        });

    };


    const contextMenuTableSelectEvent = function() {
        //
        // Функция отрабатывает контекстное меню при нажатии
        // на таблицу с доменными именами в VPN подключении.
        // Работает в связке с писанием класса в custom.css
        //
        let tableBody = $("." + tableSelectClassName + '[id*="domain_table_vpn_"] tbody');
        let contextMenuContent = $("#contextMenuVPN");

        tableBody.on('contextmenu', (event) => {
            // удаляем реакцию на системные события
            event.preventDefault();

            // получаем номер строки в таблице, на которую нажали
            const row = $(event.target).closest('tr');
            if (row.length) {
                const rowIndex = row[0].rowIndex;
                // const recordNumber = (currentPage - 1) * recordsPerPage + rowIndex;
                console.log(`Номер записи в таблице: ${rowIndex}`);
                // let data = domainTable.row(this).data();
                // alert(data[0]);
                // const tb = DataTable.tables.table.language.lengthMenu;
                // console.log(`${tb}`);
            }

            // Устанавливаем координаты показа меню в точке нажатия
            contextMenuContent.css({
                top: event.clientY,
                left: event.clientX,
                display: 'block'
            });
        });
        $(document).on('click', () => {
            contextMenuContent.css('display', 'none');
        });
    };

     const selectAllRowsInTableSelectEvent = function() {

         let tableSelect = $("." + tableSelectClassName).DataTable();
         let selectAllRowsInput = $("#" + idSelectAllRowsInput);

         selectAllRowsInput.on('change', function (event) {
             if (this.checked) {
                 // tableSelect.rows().select();
                 tableSelect.rows({search:'applied'}).select();
             } else {
                 tableSelect.rows({search:'applied'}).deselect();
                 // tableSelect.rows().deselect();
             }
        });

     };


     const saveButtonToggleInTableSelectEvent = function() {

         let tableSelect = $("." + tableSelectClassName).DataTable();

         // Создаем кнопку "Сохранить" для записи изменений
         new $.fn.dataTable.Buttons( tableSelect, {
             name:'save_command',
             buttons: [
                {
                    // Кнопка Сохранить
                    text: '<i class="ph-floppy-disk ps-1 pe-2"></i>',
                    attr: {
                        id: saveMeButtonId,
                        'data-bs-popup': 'tooltip',
                        'data-bs-original-title': 'Сохраняем изменения',
                    },
                    className: 'btn btn-light disabled ms-auto tooltip-info',
                    action: function (e, dt, node, config) {
                        alert('Custom button activated')
                    }
                },
                // {
                //     // Кнопка Справка
                //     text: '<i class="ph-info"></i>',
                //     className: 'btn btn-light ',
                //     action: function (e, dt, node, config) {
                //         alert('Custom button activated')
                //     }
                // },
            ]
         });
         //
         //  Вставляем кнопку в то место, где располагается класс .save-button (в заголовке таблицы)
         tableSelect.buttons('save_command', null ).containers().appendTo( '.save-button' );

         // Включаем кнопку только тогда был произведен какой-либо выбор из таблицы
         tableSelect.on( 'select deselect', function ( e, dt, type, indexes ) {
             // const saveMeButton = $("#" + saveMeButtonId);
             if ( type === 'row' ) {
                 if (disableToSave ) {
                     tableSelect.buttons('save_command', null ).enable();
                     // saveMeButton.toggleClass('disabled');
                     disableToSave = false;
                 }

             }
        });
     }

     // Нумерация строк по первому столбцу
     const rowsNumerateTableSelect = function() {
         // выбираем все строки таблицы
         let rows = $("." + tableSelectClassName + ' tbody tr');

         // перебираем все строки
         rows.each(function (i) {
             // выбираем первую ячейку в строке
             let cell = $(this).find('td, th').first();

             // устанавливаем текст ячейки в номер строки
             cell.text(i + 1);
         });
     }

     // Реакция в случае, если введенное значение не было найдено в талице
     const globalSearchTableSelectEvent = function() {

         let tableSelect = $("." + tableSelectClassName).DataTable();

         // Обработка события при наборе в строке поиска, когда данные не найдены
         tableSelect.on('draw', function() {
            if (tableSelect.rows({search:'applied'}).count() === 0) {
                alert('No results found');
            }
        });

     }

    //
    // Return objects assigned to module
    //

    return {
        init: function() {
            TableSelectInit();
            contextMenuTableSelectEvent();
            selectAllRowsInTableSelectEvent();
            saveButtonToggleInTableSelectEvent();
            rowsNumerateTableSelect();
            globalSearchTableSelectEvent();
        },
    }
}();


// Initialize module
// ------------------------------

document.addEventListener('DOMContentLoaded', function() {
    DatatableSelect.init();
});

$(document).ready(function() {

    $('#vpn_item_header_1').trigger('click');
    setTimeout(function() {
        $('#vpn_item_header_1').trigger('click');
    }, 600); // 3000 milliseconds = 3 seconds

});

