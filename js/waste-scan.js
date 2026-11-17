/* NUSA ECO — Scan Sampah: mock classification (database JSON lokal, tanpa AI/API) */
(() => {
const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
/* Cocokkan teks dengan nama/keyword. Kecocokan persis menang; kecocokan sebagian hanya dipakai jika tepat satu objek yang cocok (ambigu = tidak ditemukan). */
function match(text, db) {
  const q = norm(text);
  if (q.length < 3) return null;
  const part = [];
  for (const it of db) {
    let s = 0;
    for (const k0 of [it.name, ...it.keywords]) {
      const k = norm(k0);
      if (k === q) return it;
      if (k.includes(q) || q.includes(k)) s = Math.max(s, Math.min(k.length, q.length) / Math.max(k.length, q.length));
    }
    if (s >= .3) part.push(it);
  }
  return part.length === 1 ? part[0] : null;
}
if (typeof module !== 'undefined') module.exports = { norm, match };
if (typeof document === 'undefined') return;

const $ = s => document.querySelector(s), RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const HK = 'nusaeco-scan-history-v1';
const CAT = {
  organik: { l: 'Sampah Organik', d: 'Sisa makhluk hidup yang mudah terurai.', r: 'Pisahkan dan manfaatkan sebagai bahan kompos.' },
  anorganik: { l: 'Sampah Anorganik', d: 'Bahan sulit terurai yang sering bisa didaur ulang.', r: 'Kosongkan, bersihkan, dan setorkan ke bank sampah.' },
  kertas: { l: 'Sampah Kertas', d: 'Bahan berserat yang dapat didaur ulang.', r: 'Pastikan kering, lipat, lalu setorkan ke bank sampah.' },
  residu: { l: 'Sampah Residu', d: 'Sampah yang sulit didaur ulang melalui pengelolaan biasa.', r: 'Kurangi penggunaannya dan buang ke tempat sampah residu.' }
};
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let DB = [], sel = null, url = null, stream = null, busy = false, cur = null;
let photo = null; /* Blob gambar yang sudah lolos validasi (benar-benar bisa di-decode sebagai gambar) */
const MSG_NEED = 'Silakan unggah atau ambil foto sampah terlebih dahulu.';
const hasPhoto = () => !!(photo && photo.size > 0 && /^image\//.test(photo.type) && url);
/* Satu-satunya pengatur tombol Mulai Scan: aktif hanya jika database dimuat DAN foto valid ada. */
function syncGo() {
  if (busy) return;
  $('#go').disabled = !(DB.length && hasPhoto());
  $('#photoHint').hidden = hasPhoto();
  $('#rmph').hidden = !hasPhoto();
}

function status(m, err) { const e = $('#st'); e.textContent = m; e.classList.toggle('err', !!err); }
function show(s) {
  $('#stIn').hidden = !(s === 'in' || s === 'scan');
  $('#stNF').hidden = s !== 'nf'; $('#stRes').hidden = s !== 'res';
  $('#line').hidden = s !== 'scan';
  document.querySelectorAll('#stIn button,#stIn input').forEach(e => e.disabled = s === 'scan');
  if (s !== 'scan') syncGo();
  if (s === 'in' || s === 'nf') status('');
}
function setDB(j) {
  if (!j || !Array.isArray(j.items) || !j.items.length) throw new Error('Format JSON tidak valid (butuh array "items").');
  DB = j.items; $('#dberr').hidden = true;
  $('#cat').innerHTML = DB.map(i => `<button type="button" class="chip cat-${i.category}" data-id="${i.id}" aria-pressed="false">${esc(i.name)}</button>`).join('');
  syncGo();
}
function fail(e) {
  $('#dberr').hidden = false; $('#go').disabled = true;
  $('#dbmsg').textContent = (location.protocol === 'file:' ? 'Browser memblokir fetch() untuk halaman file://. Jalankan server lokal (python3 -m http.server 8000, lalu buka http://localhost:8000/scan-sampah.html) atau pilih file JSON secara manual. ' : '') + 'Detail: ' + e.message;
}
async function load() {
  try { const r = await fetch('data/waste-database.json', { cache: 'no-cache' }); if (!r.ok) throw new Error('HTTP ' + r.status); setDB(await r.json()); }
  catch (e) { fail(e); }
}
function setPhoto(blob, okMsg) {
  if (url) URL.revokeObjectURL(url);
  photo = null; syncGo();
  const i = $('#pimg'), mine = url = URL.createObjectURL(blob);
  i.onload = () => {
    if (mine !== url) return;
    photo = blob; i.hidden = false; $('#ph').hidden = true;
    i.classList.remove('pop'); void i.offsetWidth; i.classList.add('pop');
    status(okMsg); syncGo();
  };
  i.onerror = () => { if (mine !== url) return; clearPhoto(); status('File tidak dapat dibaca sebagai gambar. Pilih foto lain.', true); };
  i.src = url;
}
function clearPhoto() {
  const i = $('#pimg');
  if (url) URL.revokeObjectURL(url);
  url = null; photo = null; i.onload = i.onerror = null; i.removeAttribute('src');
  i.hidden = true; $('#ph').hidden = false; $('#file').value = ''; syncGo();
}
function stopCam() { if (stream) stream.getTracks().forEach(t => t.stop()); stream = null; $('#vid').hidden = true; $('#snap').hidden = true; $('#cam').textContent = 'Gunakan Kamera'; if (!url) $('#ph').hidden = false; }

function hist(add) {
  let h = []; try { h = JSON.parse(localStorage.getItem(HK)) || []; } catch (e) { h = []; }
  if (add) { h.unshift(add); h = h.slice(0, 8); try { localStorage.setItem(HK, JSON.stringify(h)); } catch (e) {} }
  $('#hist').hidden = !h.length;
  $('#hl').innerHTML = h.map(x => `<li class="cat-${esc(x.cat)}"><span><b>${esc(x.name)}</b> · ${esc((CAT[x.cat] || {}).l || '')} · ${new Date(x.t).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</span></li>`).join('');
}
function result(it) {
  cur = it; const c = it.category;
  const conf = it.manual ? '<small>Dipilih manual oleh pengguna</small>' : `<small>Confidence simulasi: <b>${it.confidence}%</b></small><div class="cbar"><i data-w="${it.confidence}"></i></div>`;
  $('#stRes').innerHTML = `<article class="card res stg cat-${c}"><div class="rp" style="--i:0">${url ? `<img src="${url}" alt="Foto sampah yang dipindai">` : '<div class="ph">Tanpa foto</div>'}</div>
<div class="rb"><span class="badge" style="--i:1">${esc(it.categoryLabel)}</span><h2 style="--i:2">${esc(it.name)}</h2><div style="--i:3">${conf}</div>
<p style="--i:4">${esc(it.description)}</p><div class="rec" style="--i:5"><b>Rekomendasi pengelolaan</b><p>${esc(it.recommendation)}</p></div>
<p class="note" style="--i:6">Simulasi klasifikasi berbasis database demo lokal. Gambar tidak dianalisis oleh AI.</p>
<div class="row" style="--i:7"><button type="button" class="btn o" id="again">Scan Ulang</button><button type="button" class="btn" id="save">Simpan ke Bank Sampah</button></div></div></article>`;
  show('res'); hist({ name: it.name, cat: c, t: Date.now() });
  requestAnimationFrame(() => requestAnimationFrame(() => document.querySelectorAll('.cbar i').forEach(b => b.style.width = b.dataset.w + '%')));
  $('#again').onclick = reset;
  $('#save').onclick = () => { const u = 'banksampah.html?' + new URLSearchParams({ from: 'scan', item: it.name, cat: it.category, material: it.material || '' }); window.NusaTransition ? window.NusaTransition.go(u) : (location.href = u); };
}
function notFound(v) {
  $('#man').innerHTML = Object.keys(CAT).map(k => `<button type="button" class="chip cat-${k}" data-k="${k}">${CAT[k].l}</button>`).join('');
  show('nf'); $('#nfmsg').textContent = 'Objek belum dikenali dalam database demo. Silakan pilih jenis sampah secara manual.';
  $('#man').dataset.v = v;
}
function reset() { sel = null; $('#q').value = ''; clearPhoto(); stopCam(); document.querySelectorAll('#cat .chip').forEach(b => b.setAttribute('aria-pressed', 'false')); show('in'); window.scrollTo({ top: 0, behavior: RM ? 'auto' : 'smooth' }); $('#q').focus({ preventScroll: true }); }
function run() {
  if (busy) return;
  if (!hasPhoto()) { status(MSG_NEED, true); syncGo(); return; }   /* validasi JS: foto wajib, terlepas dari status tombol */
  if (!DB.length) { status('Database demo belum dimuat.', true); return; }
  const v = $('#q').value.trim();
  if (!v) { status('Ketik atau pilih nama objek terlebih dahulu.', true); $('#q').focus(); return; }
  const hit = sel || match(v, DB); busy = true; stopCam(); show('scan');
  const steps = ['Memuat foto…', 'Mencocokkan kata kunci…', 'Menyusun hasil…']; let k = 0; status(steps[0]);
  const t = setInterval(() => status(steps[++k % 3]), RM ? 100 : 600);
  setTimeout(() => { clearInterval(t); busy = false; hit ? result(hit) : notFound(v); }, RM ? 400 : 1900);
}

$('#cat').addEventListener('click', e => {
  const b = e.target.closest('.chip'); if (!b) return;
  sel = DB.find(i => i.id === +b.dataset.id); $('#q').value = sel.name;
  document.querySelectorAll('#cat .chip').forEach(x => x.setAttribute('aria-pressed', x === b));
});
$('#q').addEventListener('input', () => { sel = null; document.querySelectorAll('#cat .chip').forEach(x => x.setAttribute('aria-pressed', 'false')); });
$('#q').addEventListener('keydown', e => { if (e.key === 'Enter') run(); });
$('#go').onclick = run;
$('#man').addEventListener('click', e => {
  const b = e.target.closest('.chip'); if (!b) return; const k = b.dataset.k, c = CAT[k];
  result({ name: $('#man').dataset.v || 'Objek pilihan Anda', category: k, categoryLabel: c.l, description: c.d, recommendation: c.r, material: null, manual: true });
});
$('#back').onclick = () => show('in');
$('#up').onclick = () => $('#file').click();
$('#rmph').onclick = () => { clearPhoto(); status('Foto dihapus. Unggah atau ambil foto baru untuk mulai scan.'); };
$('#file').onchange = e => {
  const f = e.target.files[0]; if (!f) return;
  if (!/^image\//.test(f.type)) return status('File harus berupa gambar.', true);
  if (f.size > 10 * 1024 * 1024) return status('Ukuran foto maksimal 10 MB.', true);
  stopCam(); setPhoto(f, 'Foto siap. Pilih objek lalu tekan Mulai Scan.');
};
if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) $('#cam').hidden = true;
$('#cam').onclick = async () => {
  if (stream) return stopCam();
  clearPhoto();   /* foto lama dilepas agar status foto selalu sama dengan yang tampil */
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    const v = $('#vid'); v.srcObject = stream; v.hidden = false; await v.play();
    $('#ph').hidden = true; $('#pimg').hidden = true; $('#snap').hidden = false; $('#cam').textContent = 'Tutup Kamera';
  } catch (e) { stopCam(); status('Kamera tidak dapat diakses. Anda tetap bisa mengunggah foto atau memilih objek.', true); }
};
$('#snap').onclick = () => {
  const v = $('#vid'), c = document.createElement('canvas');
  if (!v.videoWidth) return status('Kamera belum siap. Coba ambil foto lagi.', true); c.width = v.videoWidth; c.height = v.videoHeight;
  c.getContext('2d').drawImage(v, 0, 0); c.toBlob(b => { if (b && b.size) { stopCam(); setPhoto(b, 'Foto diambil. Pilih objek lalu tekan Mulai Scan.'); } else status('Foto gagal diambil. Coba lagi.', true) }, 'image/jpeg', .9);
};
$('#retry').onclick = load;
$('#dbpick').onclick = () => $('#dbfile').click();
$('#dbfile').onchange = e => {
  const f = e.target.files[0]; if (!f) return; const r = new FileReader();
  r.onload = () => { try { setDB(JSON.parse(r.result)); } catch (x) { fail(x); } };
  r.onerror = () => fail(new Error('File tidak dapat dibaca.')); r.readAsText(f);
};
$('#hclr').onclick = () => { try { localStorage.removeItem(HK); } catch (e) {} hist(); };
addEventListener('pagehide', stopCam);
hist(); load();
})();
