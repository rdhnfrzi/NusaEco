/* NUSA ECO — Bank Sampah: simpan setoran ke LocalStorage lewat NusaStore (js/storage.js). */
(function () {
  'use strict';
  var S = window.NusaStore;
  var form = document.getElementById('wasteForm');
  var box = document.getElementById('alertBox');
  if (!form || !box || !S) return;

  var sel = document.getElementById('jenis');
  var btn = form.querySelector('button[type="submit"]');
  var busy = false, hideTimer = 0;

  /* Label jenis sampah dibuat dari tarif bersama, jadi Bank Sampah dan Eco Impact selalu sepaham. */
  var keep = sel.value;
  sel.textContent = '';
  Object.keys(S.RATES).forEach(function (k) {
    var o = document.createElement('option');
    o.value = k;
    o.textContent = k + ' (' + S.RATES[k] + ' poin/kg)';
    sel.appendChild(o);
  });
  if (S.RATES[keep]) sel.value = keep;

  /* Pratinjau poin otomatis: berat × tarif jenis (tidak disimpan; penyimpanan tetap lewat NusaStore.add). */
  var kgIn = document.getElementById('kg'), prev = document.getElementById('poinPreview');
  function updatePreview() {
    if (!prev) return;
    var kg = Number(kgIn.value), rate = S.RATES[sel.value];
    prev.textContent = (isFinite(kg) && kg > 0 && rate)
      ? 'Perkiraan: ' + S.fmtKg(kg) + ' kg × ' + rate + ' = ' + S.fmtInt(Math.round(Math.round(kg * 100) / 100 * rate)) + ' poin'
      : '';
  }
  kgIn.addEventListener('input', updatePreview);
  sel.addEventListener('change', updatePreview);
  form.addEventListener('reset', function () { setTimeout(updatePreview, 0); });
  updatePreview();

  function hide() { box.className = 'alert'; box.textContent = ''; }

  function show(kind, title, detail, withLink) {
    clearTimeout(hideTimer);
    box.className = 'alert show ' + kind;
    box.textContent = '';
    var b = document.createElement('strong');
    b.textContent = title;
    box.appendChild(b);
    if (detail) box.appendChild(document.createTextNode(' ' + detail));
    if (withLink) {
      box.appendChild(document.createTextNode(' '));
      var a = document.createElement('a');
      a.className = 'ne-pill';
      a.href = 'ecopoint-impact.html';
      a.textContent = 'Lihat di Eco Impact';
      box.appendChild(a);
    }
    if (kind === 'ok') hideTimer = setTimeout(hide, 9000);
  }

  if (S.status() === 'unavailable') {
    show('err', 'Penyimpanan tidak tersedia.', 'Browser memblokir LocalStorage (mungkin mode privat), sehingga setoran tidak bisa disimpan.');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (busy) return;                 /* satu klik = satu setoran */
    busy = true;
    if (btn) btn.disabled = true;

    var r = S.add({
      nama: document.getElementById('nama').value,
      kelas: document.getElementById('kelas').value.trim().toUpperCase(),
      jenis: sel.value,
      kg: document.getElementById('kg').value
    });

    if (r.ok) {
      var it = r.item;
      form.reset();
      show('ok', 'Data berhasil disimpan!',
        it.nama + ' (' + it.kelas + ') mendapat ' + S.fmtInt(it.poin) + ' poin dari ' + S.fmtKg(it.kg) + ' kg ' + it.jenis.toLowerCase() + '.', true);
    } else if (r.error === 'duplicate') {
      show('info', 'Sudah tersimpan.', r.message);
    } else {
      show('err', 'Belum tersimpan.', r.message);
    }

    setTimeout(function () { busy = false; if (btn) btn.disabled = false; }, 800);
  });
})();
