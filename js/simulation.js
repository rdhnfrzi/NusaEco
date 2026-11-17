/* NUSA ECO — waste sorting simulation */
(function(){
var NE=window.NE,$=NE.$,$$=NE.$$;
NE.CATS=[
{k:"organik",n:"Sampah Organik",c:"#236B45",d:"Sisa makhluk hidup yang mudah terurai.",e:"Sisa makanan, daun kering, kulit buah.",m:"Jadikan kompos atau pakan maggot. Jangan campur dengan plastik."},
{k:"anorganik",n:"Sampah Anorganik",c:"#3b8a5f",d:"Bahan sulit terurai yang sering bisa dipakai ulang.",e:"Botol plastik, kaleng, kemasan tertentu.",m:"Kosongkan, bilas, lalu setorkan ke bank sampah."},
{k:"kertas",n:"Sampah Kertas",c:"#80B98A",d:"Bahan berserat yang bisa dibuat kertas baru.",e:"Koran, kardus, kertas bekas.",m:"Jaga tetap kering, lipat rapi, lalu setorkan."},
{k:"residu",n:"Sampah Residu",c:"#777F78",d:"Sampah yang tidak bisa didaur ulang lewat pengelolaan biasa.",e:"Tisu bekas, kemasan sachet berlapis, puntung.",m:"Kurangi sejak awal. Buang ke tempat residu untuk ditangani petugas."}];
var ITEMS=[["Botol plastik","anorganik","Botol plastik termasuk anorganik: tidak terurai alami, tetapi bisa didaur ulang."],["Kulit pisang","organik","Kulit pisang mudah terurai dan cocok untuk kompos."],["Koran bekas","kertas","Koran adalah kertas yang bisa didaur ulang jika kering."],["Kaleng minuman","anorganik","Kaleng logam bernilai tinggi untuk didaur ulang."],["Sisa nasi","organik","Sisa makanan adalah sampah organik."],["Kardus","kertas","Kardus adalah kertas yang laku disetorkan ke bank sampah."],["Sachet berlapis","residu","Kemasan sachet berlapis sulit didaur ulang, jadi masuk residu."],["Tisu bekas","residu","Tisu bekas tidak bisa didaur ulang, jadi masuk residu."],["Daun kering","organik","Daun kering terurai dan baik untuk kompos."],["Kertas HVS bekas","kertas","Kertas HVS bekas bisa didaur ulang menjadi kertas baru."]];
var Q,i,sc,done,res,sim,first=true;
function shuf(a){a=a.slice();for(var j=a.length-1;j>0;j--){var k=Math.floor(Math.random()*(j+1)),t=a[j];a[j]=a[k];a[k]=t}return a}
function start(){Q=shuf(ITEMS);i=0;sc=0;res={};NE.CATS.forEach(function(c){res[c.k]={r:0,w:0}});draw()}
function end(){
  var msg=sc>=9?"Luar biasa! Kamu siap jadi Pahlawan Pilah.":sc>=6?"Bagus! Sedikit lagi kamu jadi ahli memilah.":"Terima kasih sudah mencoba. Pelajari kartu di atas lalu coba lagi.";
  var al=NE.CATS.map(function(c){return c.n+' benar '+res[c.k].r+' salah '+res[c.k].w}).join(', ');
  sim.innerHTML='<div class="end" style="grid-column:1/-1"><div class="big"><span id="fs">0</span>/'+Q.length+'</div><p>'+msg+'</p><div class="rc"><canvas id="rch" role="img" aria-label="Hasil per kategori: '+al+'"></canvas></div><button class="btn w" id="again">Main lagi</button></div>';
  NE.count($('#fs'),sc,900);NE.charts.result($('#rch'),res);
  if(sc>=6)NE.confetti();
  $('#again').onclick=function(){$('.end',sim).classList.add('leave');setTimeout(start,NE.reduced?0:280)};
}
function draw(){
  if(i>=Q.length)return end();
  done=false;var it=Q[i];
  sim.innerHTML='<div><div class="item"><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#236B45" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg><div class="hd">'+it[0]+'</div><p style="color:#4d5750">Masuk tempat sampah yang mana?</p></div></div><div><div class="meta"><span>Barang '+(i+1)+'/'+Q.length+'</span><span class="prog"><i style="width:'+(Math.max(0,i-1)/Q.length*100)+'%"></i></span><span>Skor '+sc+'</span></div><div class="bins">'+NE.CATS.map(function(c){return '<button class="bin" data-k="'+c.k+'"><span style="background:'+c.c+'"></span>'+c.n.replace("Sampah ","")+'</button>'}).join("")+'</div><div class="fb" id="fb">Pilih salah satu tempat sampah.</div></div>';
  var pi=$('.prog i',sim);
  requestAnimationFrame(function(){requestAnimationFrame(function(){pi.style.width=(i/Q.length*100)+'%'})});
  $$('.bin',sim).forEach(function(b){b.onclick=function(){
    if(done)return;done=true;
    var ok=b.dataset.k===it[1];
    if(ok){sc++;res[it[1]].r++}else res[it[1]].w++;
    b.classList.add(ok?'ok':'no');
    $$('.bin',sim).forEach(function(x){x.disabled=true;if(x.dataset.k===it[1])x.classList.add('ok')});
    var fb=$('#fb');fb.className='fb show '+(ok?'ok':'no');
    fb.innerHTML='<b>'+(ok?'Benar!':'Belum tepat.')+'</b> '+it[2]+'<br><button class="btn w" id="nx" style="margin-top:12px">'+(i===Q.length-1?'Lihat skor':'Berikutnya')+'</button>';
    var n=$('#nx');n.focus({preventScroll:true});n.onclick=function(){i++;draw()};
  }});
  if(!first)$('.bin',sim).focus({preventScroll:true});
}
NE.sim={init:function(){sim=$('#sim');start();first=false}};
})();
