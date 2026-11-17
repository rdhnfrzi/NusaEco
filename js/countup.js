/* NUSA ECO — Dashboard: satu sistem hitung-naik (count-up) yang dipakai ulang untuk semua angka.
   Cara pakai: beri atribut pada elemen mana pun.
     data-countup-key="totalKg"            nilai dari NUSA_DATA (data acuan; boleh path, mis. categories.0.kg)
     data-countup-store="kg|poin|count|students"   nilai dari setoran tersimpan (NusaStore.totals)
     data-countup="170"                    nilai literal
     data-suffix=" kg" / data-prefix="+"   satuan, tetap menempel pada angka
     data-decimals="1"                     opsional; jika kosong ditentukan dari nilai itu sendiri
   Tidak ada angka baru yang dikarang: nilai selalu dibaca dari sumber data yang sudah ada.
   Tata letak tidak bergeser: lebar disediakan dari nilai akhir (ghost tak terlihat) + angka tabular. */
(function () {
  'use strict';
  var DUR = 1400;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canAnim = !reduce && !!window.requestAnimationFrame;
  var canObserve = 'IntersectionObserver' in window;

  function pick(obj, path) {
    return String(path).split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, obj);
  }
  function valueOf(el) {
    var v;
    if (el.hasAttribute('data-countup-key')) v = pick(window.NUSA_DATA, el.getAttribute('data-countup-key'));
    else if (el.hasAttribute('data-countup-store')) {
      var S = window.NusaStore;
      v = S ? S.totals()[el.getAttribute('data-countup-store')] : 0;
    } else v = el.getAttribute('data-countup');
    v = Number(v);
    return isFinite(v) ? v : null;
  }
  function decimalsOf(el, n) {
    var d = el.getAttribute('data-decimals');
    if (d !== null && d !== '') return Math.max(0, Math.min(3, parseInt(d, 10) || 0));
    if (Number.isInteger(n)) return 0;
    return Math.min(2, (String(n).split('.')[1] || '').length);
  }
  function format(el, n, dec) {
    return (el.getAttribute('data-prefix') || '') +
      n.toLocaleString('id-ID', { minimumFractionDigits: dec, maximumFractionDigits: dec }) +
      (el.getAttribute('data-suffix') || '');
  }

  /* Bangun struktur sekali: teks akhir untuk pembaca layar, ghost (lebar), dan angka hidup. */
  function build(el) {
    if (el._cu) return el._cu;
    var s = { sr: document.createElement('span'), box: document.createElement('span'),
              ghost: document.createElement('span'), live: document.createElement('span'),
              shown: 0, target: null, raf: 0, started: false };
    s.sr.className = 'sr-only';
    s.box.setAttribute('aria-hidden', 'true');
    s.box.style.display = 'inline-grid';
    s.box.style.fontVariantNumeric = 'tabular-nums';
    s.ghost.style.cssText = 'grid-area:1/1;visibility:hidden';
    s.live.style.cssText = 'grid-area:1/1';
    s.box.appendChild(s.ghost); s.box.appendChild(s.live);
    el.textContent = '';
    el.appendChild(s.sr); el.appendChild(s.box);
    el._cu = s;
    return s;
  }

  function paint(el, s, n) { s.shown = n; s.live.textContent = format(el, n, s.dec); }

  /* Animasikan dari angka yang sedang tampil ke nilai target (tidak pernah mundur ke 0 saat nilai diperbarui). */
  function animate(el, s, from, to) {
    cancelAnimationFrame(s.raf);
    s.target = to;
    var fin = format(el, to, s.dec);
    s.sr.textContent = fin; s.ghost.textContent = fin;
    if (!canAnim || from === to) { paint(el, s, to); return; }
    var t0 = null;
    function step(t) {
      if (t0 === null) t0 = t;
      var p = Math.min(1, (t - t0) / DUR);
      var e = 1 - Math.pow(1 - p, 3);                 /* easeOutCubic: cepat di awal, melambat halus */
      paint(el, s, p === 1 ? to : from + (to - from) * e);
      if (p < 1) s.raf = requestAnimationFrame(step);
    }
    s.raf = requestAnimationFrame(step);
  }

  var io = canObserve ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);                        /* animasi awal berjalan SEKALI per elemen */
      var el = en.target, s = el._cu;
      if (!s || s.started) return;
      s.started = true;
      var to = valueOf(el);
      if (to !== null) animate(el, s, 0, to);
    });
  }, { threshold: 0.4 }) : null;

  function init(el) {
    var n = valueOf(el);
    if (n === null) return;                            /* sumber tidak tersedia: biarkan teks HTML apa adanya */
    var s = build(el);
    s.dec = decimalsOf(el, n);
    s.target = n;
    var fin = format(el, n, s.dec);
    s.sr.textContent = fin; s.ghost.textContent = fin;
    paint(el, s, n);                                   /* nilai akhir yang benar lebih dulu (tanpa JS animasi pun benar) */
    if (canAnim && canObserve) { paint(el, s, 0); io.observe(el); }
    else s.started = true;
  }

  /* Nilai sumber berubah (mis. setoran baru): sesuaikan ke nilai terbaru dari angka yang sedang tampil. */
  function refresh(root) {
    [].forEach.call((root || document).querySelectorAll('[data-countup],[data-countup-key],[data-countup-store]'), function (el) {
      var s = el._cu, n = valueOf(el);
      if (!s) return init(el);
      if (n === null || n === s.target) return;
      s.dec = Math.max(s.dec, decimalsOf(el, n));
      if (!s.started) { s.started = true; if (io) io.unobserve(el); }
      animate(el, s, s.shown, n);
    });
  }

  function scan(root) {
    [].forEach.call((root || document).querySelectorAll('[data-countup],[data-countup-key],[data-countup-store]'), init);
  }

  window.NusaCountUp = { scan: scan, refresh: refresh };
  scan();
  if (window.NusaStore) window.NusaStore.subscribe(function () { refresh(); });
})();
