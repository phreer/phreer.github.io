(function () {
    'use strict';

    var nav = document.getElementById('site-navigation');
    var toggle = document.getElementById('pull');
    var menu = document.getElementById('site-menu');
    if (!nav || !toggle || !menu) {
        console.error('Site navigation markup is incomplete.');
        return;
    }

    var mobile = window.matchMedia('(max-width: 768px)');
    var open = false;

    function updateMenu() {
        menu.hidden = mobile.matches && !open;
        toggle.setAttribute('aria-expanded', String(!menu.hidden));
    }

    nav.classList.add('menu-ready');
    updateMenu();
    toggle.addEventListener('click', function () {
        open = !open;
        updateMenu();
    });
    mobile.addEventListener('change', function () {
        open = false;
        updateMenu();
    });
    nav.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && mobile.matches && open) {
            open = false;
            updateMenu();
            toggle.focus();
        }
    });
    menu.addEventListener('click', function (event) {
        if (event.target.closest('a') && mobile.matches) {
            open = false;
            updateMenu();
        }
    });
})();
