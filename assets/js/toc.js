// Builds the table of contents beside a post from its h2 and h3 headings,
// and marks the section currently being read.
(function () {
  'use strict';

  var toc = document.querySelector('.post-toc');
  var content = document.querySelector('.post-content');
  if (!toc || !content) {
    return;
  }

  var headings = Array.prototype.filter.call(
    content.querySelectorAll('h2, h3'),
    function (heading) { return heading.id; }
  );
  if (headings.length < 2) {
    return;
  }

  var scroller = toc.querySelector('nav');
  var list = toc.querySelector('ol');
  var links = [];
  var section = null;

  headings.forEach(function (heading) {
    var item = document.createElement('li');
    var link = document.createElement('a');
    link.href = '#' + encodeURIComponent(heading.id);
    link.textContent = heading.textContent;
    item.appendChild(link);
    links.push(link);

    if (heading.tagName === 'H3' && section) {
      var sublist = section.querySelector('ol');
      if (!sublist) {
        sublist = document.createElement('ol');
        section.appendChild(sublist);
      }
      sublist.appendChild(item);
    } else {
      list.appendChild(item);
      section = heading.tagName === 'H2' ? item : null;
    }
  });

  toc.hidden = false;

  // A heading becomes current once it scrolls above this line
  var READING_LINE = 120;
  var current = null;
  var scheduled = false;

  function update() {
    scheduled = false;

    var index = -1;
    for (var i = 0; i < headings.length; i++) {
      if (headings[i].getBoundingClientRect().top > READING_LINE) {
        break;
      }
      index = i;
    }
    // The last sections may be too short to ever reach the reading line
    var page = document.documentElement;
    if (window.innerHeight + window.scrollY >= page.scrollHeight - 2 && window.scrollY > 0) {
      index = headings.length - 1;
    }

    var next = index < 0 ? null : links[index];
    if (next === current) {
      return;
    }
    if (current) {
      current.removeAttribute('aria-current');
    }
    if (next) {
      next.setAttribute('aria-current', 'location');
      // Keep the current entry visible when the list itself scrolls
      if (scroller.scrollHeight > scroller.clientHeight) {
        scroller.scrollTop = next.offsetTop - scroller.clientHeight / 2;
      }
    }
    current = next;
  }

  function schedule() {
    if (!scheduled) {
      scheduled = true;
      window.requestAnimationFrame(update);
    }
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  update();
})();
