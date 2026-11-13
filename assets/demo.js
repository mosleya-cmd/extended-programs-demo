/* Extend(Ed) programs-page demo: program finder filters and the phone bar.
   Without JavaScript every program still shows, grouped by type. */
(function () {
  var d = document;
  d.documentElement.classList.add('xd-js');

  // ---- Program finder (hub) ----
  var form = d.querySelector('.xd-filter-form');
  if (form) {
    var cards = [].slice.call(d.querySelectorAll('.xd-group .xd-card'));
    var groups = [].slice.call(d.querySelectorAll('.xd-group'));
    var count = d.getElementById('xd-count');
    var empty = d.querySelector('.xd-empty');
    var details = d.querySelector('.xd-filters');
    var names = ['type', 'topic', 'cost', 'availability'];
    var picked = function (name) {
      return [].slice.call(form.querySelectorAll('input[name="' + name + '"]:checked')).map(function (i) { return i.value; });
    };
    var apply = function (updateUrl) {
      var f = {};
      names.forEach(function (n) { f[n] = picked(n); });
      var shown = 0;
      cards.forEach(function (c) {
        var ok = names.every(function (n) { return !f[n].length || f[n].indexOf(c.getAttribute('data-' + n)) > -1; });
        c.hidden = !ok;
        if (ok) shown++;
      });
      groups.forEach(function (g) { g.hidden = !g.querySelector('.xd-card:not([hidden])'); });
      count.textContent = 'Showing ' + shown + (shown === 1 ? ' program' : ' programs');
      if (empty) empty.hidden = shown !== 0;
      if (updateUrl && window.history && window.URLSearchParams) {
        var p = new URLSearchParams();
        names.forEach(function (n) { if (f[n].length) p.set(n, f[n].join(',')); });
        var q = p.toString();
        history.replaceState(null, '', q ? '?' + q + '#find' : location.pathname + '#find');
      }
    };
    form.addEventListener('change', function () { apply(true); });
    [].slice.call(d.querySelectorAll('.xd-clear')).forEach(function (b) {
      b.addEventListener('click', function () {
        var inEmpty = empty && empty.contains(b);
        form.reset(); apply(true);
        // The empty-state button disappears once filters clear; send focus back to the finder.
        if (inEmpty) { var h = d.getElementById('xd-find-h'); if (h) h.focus(); }
      });
    });
    if (window.URLSearchParams) {
      var params = new URLSearchParams(location.search);
      names.forEach(function (n) {
        var v = params.get(n);
        if (!v) return;
        v.split(',').forEach(function (x) {
          var i = form.querySelector('input[name="' + n + '"][value="' + x.replace(/[^a-z0-9-]/gi, '') + '"]');
          if (i) i.checked = true;
        });
      });
    }
    // Filters start collapsed on phones, open on larger screens.
    if (details && window.matchMedia && window.matchMedia('(max-width: 767px)').matches && !location.search) details.open = false;
    apply(false);
  }

  // ---- Phone bar (program pages) ----
  var panel = d.querySelector('.xd-panel');
  var bar = d.querySelector('.xd-phonebar');
  if (panel && bar && 'IntersectionObserver' in window && window.matchMedia) {
    var phone = window.matchMedia('(max-width: 767px)');
    var past = false;
    var update = function () {
      var show = phone.matches && past;
      bar.hidden = !show;
      d.body.classList.toggle('xd-has-bar', show);
    };
    new IntersectionObserver(function (entries) {
      var e = entries[0];
      past = !e.isIntersecting && e.boundingClientRect.top < 0;
      update();
    }).observe(panel);
    if (phone.addEventListener) phone.addEventListener('change', update);
    // Keep the focused item above the bar when tabbing on a phone.
    d.addEventListener('focusin', function (e) {
      if (bar.hidden || bar.contains(e.target)) return;
      var overlap = e.target.getBoundingClientRect().bottom - bar.getBoundingClientRect().top;
      if (overlap > 0) window.scrollBy(0, overlap + 16);
    });
  }
})();
