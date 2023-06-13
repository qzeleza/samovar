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
    ((localStorage.getItem('theme') == 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches) || localStorage.getItem('theme') == 'dark') && document.documentElement.setAttribute('data-color-theme', 'dark');
    localStorage.getItem('direction') == 'rtl' && document.getElementById("stylesheet").setAttribute('href', 'assets/css/rtl/all.min.css');
    localStorage.getItem('direction') == 'rtl' && document.documentElement.setAttribute('dir', 'rtl');
})();


// Setup module
// ------------------------------

const themeSwitcher = function() {


    //
    // Setup module components
    //

    // Theme
    const layoutTheme = function() {
        var primaryTheme = 'light';
        var secondaryTheme = 'dark';
        var storageKey = 'theme';
        var colorscheme = document.getElementsByName('main-theme');
        var mql = window.matchMedia('(prefers-color-scheme: ' + primaryTheme + ')');

        // Changes the active radiobutton
        function indicateTheme(mode) {
            for(var i = colorscheme.length; i--; ) {
                if(colorscheme[i].value == mode) {
                    colorscheme[i].checked = true;
                    colorscheme[i].closest('.list-group-item').classList.add('bg-primary', 'bg-opacity-10', 'border-primary');
                }
                else {
                    colorscheme[i].closest('.list-group-item').classList.remove('bg-primary', 'bg-opacity-10', 'border-primary');
                }
            }
        };

        // Turns alt stylesheet on/off
        function applyTheme(mode) {
            var st = document.documentElement;
            if (mode == primaryTheme) {
                st.removeAttribute('data-color-theme');
            }
            else if (mode == secondaryTheme) {
                st.setAttribute('data-color-theme', 'dark');
            }
            else {
                if (!mql.matches) {
                    st.setAttribute('data-color-theme', 'dark');
                }
                else {
                    st.removeAttribute('data-color-theme');
                }
            }
        };

        // Handles radiobutton clicks
        function setTheme(e) {
            var mode = e.target.value;
            document.documentElement.classList.add('no-transitions');
            if ((mode == primaryTheme)) {
                localStorage.removeItem(storageKey);
            }
            else {
                localStorage.setItem(storageKey, mode);
            }
            // When the auto button was clicked the auto-switcher needs to kick in
            autoTheme(mql);
        };

        // Handles the media query evaluation, so it expects a media query as parameter
        function autoTheme(e) {
            var current = localStorage.getItem(storageKey);
            var mode = primaryTheme;
            var indicate = primaryTheme;
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
        };

        // Create an event listener for media query matches and run it immediately
        autoTheme(mql);
        mql.addListener(autoTheme);

        // Set up listeners for radio button clicks */
        for(var i = colorscheme.length; i--; ) {
            colorscheme[i].onchange = setTheme;
        }
    };

    // Direction
    const layoutDirection = function() {
        var dirSwitch = document.querySelector('[name="layout-direction"]');

        if (dirSwitch) {
            var dirSwitchSelected = localStorage.getItem("direction") !== null && localStorage.getItem("direction") === "rtl";
            dirSwitch.checked = dirSwitchSelected;

            function resetDir() {
                if (dirSwitch.checked) {
                    document.getElementById("stylesheet").setAttribute('href', 'assets/css/rtl/all.min.css');
                    document.documentElement.setAttribute("dir", "rtl");
                    localStorage.setItem("direction", "rtl");
                } else {
                    document.getElementById("stylesheet").setAttribute('href', 'assets/css/ltr/all.min.css');
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


// Initialize module
// ------------------------------

document.addEventListener('DOMContentLoaded', function() {
    themeSwitcher.init();
});
