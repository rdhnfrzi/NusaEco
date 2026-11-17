/* NUSA ECO — hash routing, animated indicator, mobile menu */
(function(){
var NE=window.NE,$=NE.$,$$=NE.$$;
var R={beranda:['beranda',null],statistik:['beranda','statistik'],tentang:['beranda','tentang'],edukasi:['edukasi',null],simulasi:['edukasi','simulasi']};
var cur=null;
function ind(){
  var on=$('.links a.l.on'),el=$('#ind');
  if(!on||!on.offsetWidth){el.classList.remove('on');return}
  el.style.width=on.offsetWidth+'px';el.style.height=on.offsetHeight+'px';
  el.style.transform='translate('+on.offsetLeft+'px,'+on.offsetTop+'px)';el.classList.add('on');
}
function menu(open){$('#lk').classList.toggle('open',open);$('#bg').setAttribute('aria-expanded',open);$('#bg').setAttribute('aria-label',open?'Tutup menu':'Buka menu')}
function route(){
  var h=(location.hash||'#beranda').slice(1),r=R[h]||R.beranda,changed=r[0]!==cur;cur=r[0];
  $$('.view').forEach(function(v){v.classList.toggle('on',v.id==='v-'+r[0])});
  $$('.links a.l').forEach(function(a){a.classList.toggle('on',a.dataset.r===(h==='tentang'?'tentang':r[0]))});
  menu(false);ind();
  var el=r[1]&&document.getElementById(r[1]);
  setTimeout(function(){
    var b=changed?'instant':'smooth';
    el?el.scrollIntoView({behavior:b}):scrollTo({top:0,behavior:b});
    NE.observe();
  },30);
}
NE.nav={init:function(){
  addEventListener('hashchange',route);
  $('#bg').onclick=function(){menu(!$('#lk').classList.contains('open'))};
  addEventListener('keydown',function(e){if(e.key==='Escape'){menu(false);$('#bg').focus()}});
  $('#lk').addEventListener('click',function(e){if(e.target.closest('a'))menu(false)});
  document.addEventListener('click',function(e){if($('#lk').classList.contains('open')&&!e.target.closest('#lk,#bg'))menu(false)});
  matchMedia('(min-width:1101px)').addEventListener('change',function(m){if(m.matches)menu(false)});
  var t;addEventListener('resize',function(){clearTimeout(t);t=setTimeout(ind,120)},{passive:true});
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(ind);
  route();
}};
})();
