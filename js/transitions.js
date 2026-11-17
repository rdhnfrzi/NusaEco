/* NUSA ECO — transisi halaman global.
   Animasi MASUK murni CSS (css/transitions.css), jadi halaman tidak pernah kosong bila JS gagal.
   Skrip ini hanya mengurus animasi KELUAR: fade-out singkat, lalu navigasi biasa.
   Tanpa JS, semua link tetap bernavigasi normal. */
(function () {
  'use strict';
  if (window.NusaTransition) return; /* cegah pemasangan listener ganda */

  var root = document.documentElement;
  var EXIT_MS = 230;      /* harus sama dengan --ne-exit di transitions.css */
  var RESTORE_MS = 3000;  /* jaring pengaman: jika navigasi batal, halaman dipulihkan */
  var leaving = false, timer = 0;
  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

  function reduced() { return !!(mq && mq.matches); }

  function restore() {
    leaving = false;
    clearTimeout(timer);
    root.classList.remove('ne-leaving');
  }

  function go(url) {
    if (leaving) return;           /* hindari navigasi ganda */
    leaving = true;
    if (reduced()) { window.location.assign(url); return; }
    root.classList.add('ne-leaving');
    timer = setTimeout(function () {
      window.location.assign(url);
      timer = setTimeout(restore, RESTORE_MS);
    }, EXIT_MS);
  }

  /* Hanya link internal ke halaman lain yang ikut transisi. */
  function eligible(a) {
    var t = a.getAttribute('target');
    if (t && t !== '_self') return false;
    if (a.hasAttribute('download') || a.hasAttribute('data-no-transition')) return false;
    if ((a.getAttribute('rel') || '').indexOf('external') > -1) return false;
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#') return false;
    if (/^(mailto:|tel:|javascript:|sms:|blob:|data:)/i.test(href)) return false;
    if (a.protocol !== location.protocol || a.host !== location.host) return false;
    /* dokumen yang sama (anchor / hash route di Beranda) ditangani router yang sudah ada */
    if (a.pathname === location.pathname && a.search === location.search) return false;
    return true;
  }

  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a || !eligible(a)) return;
    e.preventDefault();
    go(a.href);
  });

  /* Tombol Back/Forward: halaman dari bfcache masih membawa class ne-leaving, harus dibersihkan. */
  window.addEventListener('pageshow', restore);

  window.NusaTransition = { go: go };
})();
