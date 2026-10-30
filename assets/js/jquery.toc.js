(function () {
    'use strict';

    var module = document.getElementById('post-directory-module');
    var details = document.getElementById('post-directory-details');
    var linksContainer = document.getElementById('post-directory-links');
    var content = document.querySelector('.post-article .post-content');
    var layout = document.querySelector('.post-layout');
    if (!module || !details || !linksContainer || !content || !layout) {
        console.error('Article directory markup is incomplete.');
        return;
    }

    var headings = Array.from(content.querySelectorAll('h2, h3')).filter(function (heading) {
        if (!heading.id && heading.previousElementSibling) {
            var name = heading.previousElementSibling.getAttribute('name');
            if (name) heading.id = name.replace(/\./g, '-');
        }
        return Boolean(heading.id);
    });
    if (headings.length < 2) return;

    var list = document.createElement('ol');
    var links = headings.map(function (heading) {
        var item = document.createElement('li');
        var link = document.createElement('a');
        item.className = 'toc-level-' + heading.tagName.slice(1);
        link.href = '#' + encodeURIComponent(heading.id);
        link.textContent = heading.textContent;
        item.appendChild(link);
        list.appendChild(item);
        return link;
    });
    linksContainer.appendChild(list);
    module.hidden = false;
    layout.classList.add('has-toc');

    var mobile = window.matchMedia('(max-width: 768px)');
    function updateLayout() {
        details.open = !mobile.matches;
    }
    updateLayout();
    mobile.addEventListener('change', updateLayout);

    var scheduled = false;
    function highlight() {
        var current = 0;
        headings.forEach(function (heading, index) {
            if (heading.getBoundingClientRect().top <= 80) current = index;
        });
        links.forEach(function (link, index) {
            if (index === current) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
        });
        scheduled = false;
    }
    function scheduleHighlight() {
        if (!scheduled) {
            scheduled = true;
            window.requestAnimationFrame(highlight);
        }
    }
    window.addEventListener('scroll', scheduleHighlight, { passive: true });
    window.addEventListener('resize', scheduleHighlight);
    window.addEventListener('load', scheduleHighlight);
    if (document.fonts) document.fonts.ready.then(scheduleHighlight);
    if (window.ResizeObserver) new ResizeObserver(scheduleHighlight).observe(content);
    highlight();
})();
