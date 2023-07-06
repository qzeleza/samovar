/* ------------------------------------------------------------------------------
 *
 *  # Template configurator
 *
 *  Demo JS code for sliding panel with demo config
 *
 * ---------------------------------------------------------------------------- */


// Check localStorage on page load and set mathing theme/direction
// ------------------------------

(function () {
    ((localStorage.getItem('theme') === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches) || localStorage.getItem('theme') === 'dark') && document.documentElement.setAttribute('data-color-theme', 'dark');
    localStorage.getItem('direction') === 'rtl' && document.getElementById("stylesheet").setAttribute('href', '../../../assets/css/rtl/all.min.css');
    localStorage.getItem('direction') === 'rtl' && document.documentElement.setAttribute('dir', 'rtl');
})();


// Setup module
// ------------------------------

const themeSwitcher = function() {


    //
    // Setup module components
    //

    // Theme
    const layoutTheme = function() {
        let primaryTheme = 'light';
        let secondaryTheme = 'dark';
        let storageKey = 'theme';
        let colorscheme = document.getElementsByName('main-theme');
        let mql = window.matchMedia('(prefers-color-scheme: ' + primaryTheme + ')');

        // Changes the active radiobutton
        function indicateTheme(mode) {
            for(let i = colorscheme.length; i--; ) {

                if(colorscheme[i].value === mode) {
                    colorscheme[i].checked = true;
                    colorscheme[i].closest('.list-group-item').classList.add('bg-primary', 'bg-opacity-10', 'border-primary');
                }
                else {
                    colorscheme[i].closest('.list-group-item').classList.remove('bg-primary', 'bg-opacity-10', 'border-primary');
                }
            }
        }

        // Turns alt stylesheet on/off
        function applyTheme(mode) {
            // получаем элемент html
            let st = document.documentElement;
            // если mode равен primaryTheme
            if (mode === primaryTheme) {
                st.removeAttribute('data-color-theme'); // удаляем атрибут data-color-theme
                $('#right_call_button button').removeClass('btn-flat-white').addClass('btn-flat-dark');
            }
            else if (mode === secondaryTheme) { // если mode равен secondaryTheme
                st.setAttribute('data-color-theme', 'dark'); // устанавливаем атрибут data-color-theme со значением 'dark'
                $('#right_call_button button').removeClass('btn-flat-dark').addClass('btn-flat-white');
            }
            else { // в противном случае
                if (!mql.matches) { // если mql не совпадает
                    st.setAttribute('data-color-theme', 'dark'); // устанавливаем атрибут data-color-theme со значением 'dark'
                    $('#right_call_button button').removeClass('btn-flat-dark').addClass('btn-flat-white');
                }
                else { // иначе
                    st.removeAttribute('data-color-theme'); // удаляем атрибут data-color-theme
                    $('#right_call_button button').removeClass('btn-flat-white').addClass('btn-flat-dark');
                }
            }
        }


        // Handles radiobutton clicks
        function setTheme(e) {
            let mode = e.target.value;
            document.documentElement.classList.add('no-transitions');
            if ((mode === primaryTheme)) {
                localStorage.removeItem(storageKey);
            }
            else {
                localStorage.setItem(storageKey, mode);
            }
            // When the auto button was clicked the auto-switcher needs to kick in
            autoTheme(mql);
        }

        // Handles the media query evaluation, so it expects a media query as parameter
        function autoTheme(e) {
            let current = localStorage.getItem(storageKey);
            let mode = primaryTheme;
            let indicate = primaryTheme;
            // User set preference has priority
            if ( current != null) {
                indicate = mode = current;
            }
            else if (e != null && e.matches) {
                mode = primaryTheme;
            }
            applyTheme(mode);
            indicateTheme(indicate);
            setTimeout(function() {
                document.documentElement.classList.remove('no-transitions');
            }, 100);
        }

        // Create an event listener for media query matches and run it immediately
        autoTheme(mql);
        mql.addListener(autoTheme);

        // Set up listeners for radio button clicks */
        for(let i = colorscheme.length; i--; ) {
            colorscheme[i].onchange = setTheme;
        }
    };

    // Direction
    const layoutDirection = function() {
        let dirSwitch = document.querySelector('[name="layout-direction"]');

        if (dirSwitch) {
            dirSwitch.checked = localStorage.getItem("direction") !== null && localStorage.getItem("direction") === "rtl";

            function resetDir() {
                if (dirSwitch.checked) {
                    document.getElementById("stylesheet").setAttribute('href', '../../../assets/css/rtl/all.min.css');
                    document.documentElement.setAttribute("dir", "rtl");
                    localStorage.setItem("direction", "rtl");
                } else {
                    document.getElementById("stylesheet").setAttribute('href', '../../../assets/css/ltr/all.min.css');
                    document.documentElement.setAttribute("dir", "ltr");
                    localStorage.removeItem("direction");
                }
            }

            dirSwitch.addEventListener("change", function () {
                resetDir();
            });
        }
    };


    //
    // Return objects assigned to module
    //

    return {
        init: function() {
            layoutTheme();
            layoutDirection();
        }
    }
}();

themeSwitcher.init();

// Initialize module
// ------------------------------

// Загружаем данные только после загрузки loader.js
// который отвечает за загрузку данных из других файлов в один
// $(document).on("appReady", function() {
    // ваш код здесь
// $(document).ready(function() {


// });
