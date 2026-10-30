(function () {
    'use strict';

    var key = 'phreer-color-mode';
    var root = document.documentElement;
    var system = window.matchMedia('(prefers-color-scheme: dark)');
    var storageFailed = false;
    var control;
    var status;

    function storageError(error) {
        if (!(error instanceof DOMException)) throw error;
        console.warn('Cannot access color preference storage; changes apply to this page only.', error);
        storageFailed = true;
        if (status) status.textContent = status.dataset.storageError;
    }

    function readPreference() {
        var saved;
        try {
            saved = localStorage.getItem(key);
        } catch (error) {
            storageError(error);
        }
        if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
        if (saved) console.warn('Invalid color preference; following system appearance.');
        return 'system';
    }

    var preference = readPreference();

    function applyPreference() {
        root.dataset.colorMode = preference;
        root.dataset.colorScheme = preference === 'system'
            ? (system.matches ? 'dark' : 'light') : preference;
        if (control) control.value = preference;
    }

    applyPreference();
    system.addEventListener('change', function () {
        if (preference === 'system') applyPreference();
    });
    window.addEventListener('storage', function (event) {
        if (event.key === key || event.key === null) {
            preference = readPreference();
            applyPreference();
        }
    });

    function bindControl() {
        control = document.getElementById('color-mode');
        status = document.getElementById('theme-status');
        if (!control || !status) {
            console.error('Color mode controls are missing.');
            return;
        }
        control.hidden = false;
        control.value = preference;
        if (storageFailed) status.textContent = status.dataset.storageError;
        control.addEventListener('change', function () {
            preference = control.value;
            if (preference !== 'system' && preference !== 'light' && preference !== 'dark') {
                console.error('Invalid color mode selection.');
                preference = readPreference();
                applyPreference();
                return;
            }
            applyPreference();
            try {
                if (preference === 'system') localStorage.removeItem(key);
                else localStorage.setItem(key, preference);
                storageFailed = false;
                status.textContent = '';
            } catch (error) {
                storageError(error);
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bindControl);
    } else {
        bindControl();
    }
})();
