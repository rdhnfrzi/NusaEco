/* NUSA ECO — Eco Impact: semua angka dihitung dari setoran yang benar-benar tersimpan (NusaStore).
   Tidak ada angka dampak lingkungan yang dikarang; yang ditampilkan hanya berat, poin, jumlah setoran,
   dan jumlah siswa yang dapat dihitung dari data. Target 100 kg adalah target pengumpulan yang sudah ada di halaman. */
(function () {
  'use strict';
  var S = window.NusaStore;
  var $ = function (id) { return document.getElementById(id); };
  var TARGET_KG = 100;
  var HISTORY_MAX = 10;
  var TRASH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6"/></svg>';
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!S) return;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  /* ---------- render dari data tersimpan ---------- */
  function render() {
    var list = S.all();
    var t = S.totals(list);
    var status = S.status();
    var empty = t.count === 0;

    $('totalPoint').textContent = S.fmtInt(t.poin);
    $('totalWaste').textContent = S.fmtKg(t.kg);

    var pct = Math.min(100, (t.kg / TARGET_KG) * 100);
    $('impactBar').style.width = pct + '%';
    var pb = $('impactProgress');
    pb.setAttribute('aria-valuenow', String(Math.round(pct)));
    pb.setAttribute('aria-valuetext', S.fmtKg(t.kg) + ' dari ' + TARGET_KG + ' kg target');

    if (empty) closeConfirm();
    $('emptyState').hidden = !empty;
    $('impactMessage').hidden = empty;
    $('ecoDetail').hidden = empty;

    if (empty) {
      var msg = $('emptyMsg');
      if (status === 'unavailable') {
        $('emptyTitle').textContent = 'Penyimpanan browser tidak tersedia';
        msg.textContent = 'Browser memblokir LocalStorage (mungkin mode privat), jadi data setoran tidak bisa dibaca atau disimpan.';
      } else if (status === 'corrupt') {
        $('emptyTitle').textContent = 'Data setoran tidak dapat dibaca';
        msg.textContent = 'Data lokal rusak sehingga belum bisa ditampilkan. Salinan datanya diamankan; setoran baru tetap bisa dicatat.';
      } else {
        $('emptyTitle').textContent = 'Belum ada data setoran';
        msg.textContent = 'Catat setoran pertamamu di Bank Sampah. Setelah disimpan, total berat, poin, dan rincian akan muncul di sini.';
      }
      $('pointSummary').textContent = 'Belum ada setoran tersimpan.';
      return;
    }

    $('pointSummary').textContent = 'Total dari ' + S.fmtInt(t.count) + ' setoran tersimpan di browser ini.';
    $('impactMessage').textContent = t.kg >= TARGET_KG
      ? 'Target pengumpulan berhasil dicapai! 🌱'
      : pct.toFixed(1).replace('.', ',') + '% menuju target ' + TARGET_KG + ' KG.';

    $('statCount').textContent = S.fmtInt(t.count);
    $('statStudents').textContent = S.fmtInt(t.students);
    $('statKg').textContent = S.fmtKg(t.kg) + ' kg';

    /* rincian per jenis sampah */
    var names = Object.keys(S.RATES);
    Object.keys(t.perJenis).forEach(function (k) { if (names.indexOf(k) < 0) names.push(k); });
    var present = names.filter(function (k) { return t.perJenis[k]; });
    var max = Math.max.apply(null, present.map(function (k) { return t.perJenis[k].kg; })) || 1;
    var pj = $('perJenis');
    pj.textContent = '';
    present.forEach(function (k) {
      var v = t.perJenis[k];
      var li = el('li', 'pj');
      var top = el('div', 'pj-top');
      top.appendChild(el('strong', null, k || 'Tanpa jenis'));
      top.appendChild(el('span', null, S.fmtKg(v.kg) + ' kg · ' + S.fmtInt(v.poin) + ' poin · ' + S.fmtInt(v.count) + ' setoran'));
      var bar = el('div', 'pj-bar');
      var fill = el('i');
      fill.style.width = Math.max(4, (v.kg / max) * 100) + '%';
      bar.appendChild(fill);
      li.appendChild(top);
      li.appendChild(bar);
      pj.appendChild(li);
    });

    /* riwayat terbaru (yang terbaru di atas) */
    var h = $('hist');
    h.textContent = '';
    list.slice().reverse().slice(0, HISTORY_MAX).forEach(function (x) {
      var li = el('li', 'hi');
      li.setAttribute('data-id', x.id);
      var body = el('div', 'hi-body');
      var a = el('div', 'hi-top');
      a.appendChild(el('strong', null, x.nama));
      a.appendChild(el('span', 'hi-cls', x.kelas));
      var b = el('div', 'hi-sub');
      b.appendChild(el('span', null, x.jenis + ' · ' + S.fmtKg(x.kg) + ' kg'));
      b.appendChild(el('span', 'hi-pt', '+' + S.fmtInt(x.poin) + ' poin'));
      var d = el('time', 'hi-time', S.fmtDate(x.waktu));
      if (x.waktu) d.setAttribute('datetime', x.waktu);
      body.appendChild(a); body.appendChild(b); body.appendChild(d);
      var del = el('button', 'hi-del');
      del.type = 'button';
      del.setAttribute('data-id', x.id);
      del.setAttribute('aria-label', 'Hapus riwayat ' + x.nama + ', ' + S.fmtKg(x.kg) + ' kg ' + x.jenis);
      del.innerHTML = TRASH;
      li.appendChild(body); li.appendChild(del);
      h.appendChild(li);
    });
    $('histMore').textContent = t.count > HISTORY_MAX
      ? 'Menampilkan ' + HISTORY_MAX + ' setoran terbaru dari ' + S.fmtInt(t.count) + '.'
      : '';

    var oldN = list.filter(function (x) { return x.lama; }).length;
    $('legacyNote').hidden = oldN === 0;
    if (oldN) {
      $('legacyNote').textContent = S.fmtInt(oldN) + ' setoran lama dicatat sebelum poin disimpan; poinnya dihitung dari tarif jenis sampah saat ini.';
    }
  }

  /* ---------- simulasi poin (tidak disimpan, tidak mengubah total) ---------- */
  var type = $('wasteType'), weight = $('wasteWeight'), msg = $('pointMessage');
  type.textContent = '';
  Object.keys(S.RATES).forEach(function (k) {
    var o = document.createElement('option');
    o.value = k;
    o.textContent = k + ' (' + S.RATES[k] + ' poin/kg)';
    type.appendChild(o);
  });
  $('calculatePoint').addEventListener('click', function () {
    var kg = Number(weight.value);
    if (!kg || kg <= 0) {
      msg.textContent = 'Masukkan berat sampah yang valid terlebih dahulu.';
      return;
    }
    var rate = S.RATES[type.value];
    msg.textContent = 'Simulasi: ' + S.fmtKg(kg) + ' kg ' + type.value.toLowerCase() + ' ≈ ' + S.fmtInt(Math.round(kg * rate)) +
      ' poin. Angka ini tidak disimpan; catat setoran di Bank Sampah agar masuk ke total.';
  });

  /* ---------- hapus riwayat (hapus record sungguhan di LocalStorage lewat NusaStore) ---------- */
  var toast = $('histToast'), toastTimer = 0;
  function say(text) {
    clearTimeout(toastTimer);
    toast.textContent = text;
    toast.classList.add('show');
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2600);
  }
  function closeConfirm() { $('histConfirm').hidden = true; }

  $('hist').addEventListener('click', function (e) {
    var btn = e.target.closest('.hi-del');
    if (!btn) return;
    var r = S.remove(btn.getAttribute('data-id'));   /* hanya record dengan id itu */
    if (!r.ok) { say(r.message); render(); return; }
    btn.disabled = true;
    var li = btn.closest('.hi');
    say('Riwayat dihapus.');
    if (li && !RM) { li.classList.add('leaving'); setTimeout(render, 230); }
    else render();
  });

  $('histClear').addEventListener('click', function () {
    var n = S.all().length;
    $('histConfirmMsg').textContent = 'Hapus semua ' + S.fmtInt(n) + ' riwayat setoran? Total poin dan berat akan kembali ke 0, dan data tidak bisa dikembalikan.';
    $('histConfirm').hidden = false;
    $('histNo').focus({ preventScroll: true });
  });
  $('histNo').addEventListener('click', function () { closeConfirm(); $('histClear').focus({ preventScroll: true }); });
  $('histYes').addEventListener('click', function () {
    var r = S.clear();
    closeConfirm();
    if (r.ok) say('Semua riwayat dihapus.'); else say(r.message);
    render();
  });
  $('histConfirm').addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeConfirm(); $('histClear').focus({ preventScroll: true }); } });

  render();
  S.subscribe(render);   /* storage antar-tab, kembali via tombol Back (bfcache), dan tab aktif lagi */
})();
