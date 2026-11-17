/* NUSA ECO — penyimpanan setoran (satu-satunya pintu ke LocalStorage).
   Key tunggal: nusaeco-submissions-v1 (sama dengan versi sebelumnya, jadi data lama tetap terbaca).
   Skema entri baru: { id, nama, kelas, jenis, kg, poin, waktu }.
   Entri lama (tanpa id/poin) TIDAK ditulis ulang; field yang kurang dihitung saat dibaca. */
(function () {
  'use strict';
  var KEY = 'nusaeco-submissions-v1';
  var DUP_MS = 2000; /* setoran identik dalam jendela ini dianggap klik ganda */

  /* Tarif poin per kg — satu sumber untuk Bank Sampah dan Eco Impact. */
  var RATES = { Organik: 50, Anorganik: 50, Residu: 50, Plastik: 100, Kertas: 60, Logam: 150, Kaca: 40, Ecobrick: 120 };
  /* Tiga jenis baru (50 poin/kg) tampil lebih dulu. Jenis lama tetap ada agar setoran lama dan
     prefill dari Scan Sampah (material Plastik/Kertas/Logam/Kaca/Ecobrick) tetap terbaca benar. */

  function ls() { try { return window.localStorage; } catch (e) { return null; } }

  /* Baca array mentah. error: null | 'unavailable' | 'corrupt' */
  function readRaw() {
    var s = ls(), raw;
    if (!s) return { items: [], error: 'unavailable' };
    try { raw = s.getItem(KEY); } catch (e) { return { items: [], error: 'unavailable' }; }
    if (raw == null || raw === '') return { items: [], error: null };
    try {
      var a = JSON.parse(raw);
      if (!Array.isArray(a)) throw new Error('bukan array');
      return { items: a, error: null };
    } catch (e) {
      return { items: [], error: 'corrupt', raw: raw };
    }
  }

  function round2(n) { return Math.round(n * 100) / 100; }

  /* Ubah satu entri mentah (lama/baru) menjadi bentuk seragam; null jika tidak valid. */
  function normalize(r, i) {
    if (!r || typeof r !== 'object') return null;
    var kg = Number(r.kg);
    if (!isFinite(kg) || kg <= 0) return null;
    var jenis = String(r.jenis == null ? '' : r.jenis);
    var poin = Number(r.poin);
    if (!isFinite(poin)) poin = RATES[jenis] ? Math.round(kg * RATES[jenis]) : 0;
    return {
      id: r.id ? String(r.id) : 'lama-' + i,
      nama: String(r.nama == null ? '' : r.nama),
      kelas: String(r.kelas == null ? '' : r.kelas),
      jenis: jenis,
      kg: kg,
      poin: poin,
      waktu: r.waktu || r.tanggal || null,
      lama: !r.id
    };
  }

  function all() {
    var out = [];
    readRaw().items.forEach(function (r, i) { var n = normalize(r, i); if (n) out.push(n); });
    return out;
  }

  function newId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

  /* Tambah satu setoran ke riwayat. Tidak pernah menghapus entri lama. */
  function add(entry) {
    var kg = Number(entry.kg);
    var nama = String(entry.nama || '').trim();
    var kelas = String(entry.kelas || '').trim();
    var jenis = String(entry.jenis || '');
    if (!nama || !kelas) return { ok: false, error: 'invalid', message: 'Nama dan kelas wajib diisi.' };
    if (!RATES[jenis]) return { ok: false, error: 'invalid', message: 'Pilih jenis sampah terlebih dahulu.' };
    if (!isFinite(kg) || kg <= 0) return { ok: false, error: 'invalid', message: 'Berat harus lebih dari 0 kg.' };
    kg = round2(kg);

    var cur = readRaw();
    if (cur.error === 'unavailable') return { ok: false, error: 'unavailable', message: 'Penyimpanan browser tidak tersedia (mode privat atau diblokir).' };
    var s = ls();
    if (cur.error === 'corrupt') { /* amankan data rusak, jangan hilang diam-diam */
      try { s.setItem(KEY + '.corrupt', cur.raw); } catch (e) {}
    }

    var items = cur.items, now = Date.now(), last = items[items.length - 1];
    if (last && last.nama === nama && last.kelas === kelas && last.jenis === jenis && Number(last.kg) === kg &&
        last.waktu && now - new Date(last.waktu).getTime() < DUP_MS) {
      return { ok: false, error: 'duplicate', message: 'Setoran yang sama baru saja disimpan.' };
    }

    var rec = { id: newId(), nama: nama, kelas: kelas, jenis: jenis, kg: kg, poin: Math.round(kg * RATES[jenis]), waktu: new Date(now).toISOString() };
    items.push(rec);
    try { s.setItem(KEY, JSON.stringify(items)); }
    catch (e) { return { ok: false, error: 'write', message: 'Data gagal disimpan (penyimpanan penuh atau diblokir).' }; }
    return { ok: true, item: normalize(rec, items.length - 1) };
  }

  /* Id sebuah record mentah; entri lama (tanpa id) memakai 'lama-<indeks>' seperti di normalize(). */
  function rawId(r, i) { return r && typeof r === 'object' && r.id ? String(r.id) : 'lama-' + i; }

  /* Hapus SATU record dari LocalStorage (benar-benar dihapus dari array, bukan disembunyikan).
     Record lain, termasuk yang tidak valid, dibiarkan apa adanya. */
  function remove(id) {
    var cur = readRaw();
    if (cur.error === 'unavailable') return { ok: false, error: 'unavailable', message: 'Penyimpanan browser tidak tersedia.' };
    if (cur.error === 'corrupt') return { ok: false, error: 'corrupt', message: 'Data tersimpan tidak dapat dibaca.' };
    id = String(id);
    var kept = cur.items.filter(function (r, i) { return rawId(r, i) !== id; });
    if (kept.length === cur.items.length) return { ok: false, error: 'notfound', message: 'Riwayat tidak ditemukan (mungkin sudah dihapus).' };
    try { ls().setItem(KEY, JSON.stringify(kept)); }
    catch (e) { return { ok: false, error: 'write', message: 'Data gagal dihapus (penyimpanan diblokir).' }; }
    return { ok: true, removed: 1, left: kept.length };
  }

  /* Hapus seluruh riwayat setoran (key utama dibuang). Salinan .corrupt, bila ada, tidak disentuh. */
  function clear() {
    var s = ls(), n = readRaw().items.length;
    if (!s) return { ok: false, error: 'unavailable', message: 'Penyimpanan browser tidak tersedia.' };
    try { s.removeItem(KEY); }
    catch (e) { return { ok: false, error: 'write', message: 'Data gagal dihapus (penyimpanan diblokir).' }; }
    return { ok: true, removed: n };
  }

  /* Ringkasan murni dari data yang benar-benar tersimpan. */
  function totals(list) {
    list = list || all();
    var t = { count: 0, kg: 0, poin: 0, students: 0, perJenis: {} }, seen = {};
    list.forEach(function (x) {
      t.count++; t.kg += x.kg; t.poin += x.poin;
      seen[(x.nama + '|' + x.kelas).toLowerCase()] = 1;
      var j = t.perJenis[x.jenis] || (t.perJenis[x.jenis] = { kg: 0, poin: 0, count: 0 });
      j.kg += x.kg; j.poin += x.poin; j.count++;
    });
    t.kg = round2(t.kg);
    t.students = Object.keys(seen).length;
    Object.keys(t.perJenis).forEach(function (k) { t.perJenis[k].kg = round2(t.perJenis[k].kg); });
    return t;
  }

  /* Panggil cb saat data bisa berubah: storage antar-tab, kembali dari bfcache, tab aktif lagi. */
  function subscribe(cb) {
    window.addEventListener('storage', function (e) { if (e.key === KEY || e.key === null) cb(); });
    window.addEventListener('pageshow', function (e) { if (e.persisted) cb(); });
    document.addEventListener('visibilitychange', function () { if (!document.hidden) cb(); });
  }

  var nfKg = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 });
  var nfInt = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 });
  function fmtDate(iso) {
    var d = new Date(iso);
    if (!iso || isNaN(d.getTime())) return '—';
    return d.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
  }

  window.NusaStore = {
    KEY: KEY, RATES: RATES, all: all, add: add, remove: remove, clear: clear, totals: totals, subscribe: subscribe,
    status: function () { return readRaw().error; },
    fmtKg: function (n) { return nfKg.format(n); },
    fmtInt: function (n) { return nfInt.format(n); },
    fmtDate: fmtDate
  };
})();
