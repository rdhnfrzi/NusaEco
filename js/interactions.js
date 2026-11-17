/* NUSA ECO — education cards, button ripple, confetti */
(function(){
var NE=window.NE,$=NE.$,$$=NE.$$;
var ico='<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20V10M12 10c0-4 3-6 8-6 0 5-2 8-8 6zM12 14c0-3-2-5-7-5 0 4 2 6 7 5z"/></svg>';
NE.confetti=function(){
  if(NE.reduced)return;
  var w=document.createElement('div'),col=['#80B98A','#236B45','#DCEBDD','#EAEDE5'];
  w.className='conf';w.setAttribute('aria-hidden','true');
  for(var k=0;k<28;k++){var l=document.createElement('i');l.style.cssText='left:'+Math.random()*100+'vw;--dx:'+(Math.random()*160-80)+'px;--r:'+(Math.random()*720-360)+'deg;animation-duration:'+(2+Math.random()*1.6)+'s;animation-delay:'+Math.random()*.5+'s;background:'+col[k%4];w.appendChild(l)}
  document.body.appendChild(w);setTimeout(function(){w.remove()},4400);
};
/* Interaksi bersama: hover (mouse/pen) untuk desktop, tap (sentuh) untuk mobile.
   Dipakai kartu "Empat jenis sampah" dan daftar nama tim agar perilakunya sama.
   opts.set(el,on) mengubah tampilan; opts.isOn(el) membaca status. Hanya dipasang sekali per kontainer. */
NE.hoverTap=function(root,sel,opts){
  if(!root||root.__hoverTap)return;root.__hoverTap=true;
  var last='mouse';
  root.addEventListener('pointerdown',function(e){last=e.pointerType||'mouse'},{passive:true});
  root.addEventListener('pointerover',function(e){
    if(e.pointerType==='touch')return;
    var el=e.target.closest&&e.target.closest(sel);
    if(!el||el.contains(e.relatedTarget))return;
    opts.set(el,true);
  });
  root.addEventListener('pointerout',function(e){
    if(e.pointerType==='touch')return;
    var el=e.target.closest&&e.target.closest(sel);
    if(!el||el.contains(e.relatedTarget))return;
    opts.set(el,false);
  });
  root.addEventListener('click',function(e){
    var el=e.target.closest&&e.target.closest(sel);if(!el)return;
    var keyboard=e.detail===0;
    if(!keyboard&&(last==='mouse'||last==='pen'))return; /* desktop: hover yang mengatur, klik tidak perlu */
    var on=opts.isOn(el);
    if(!on)$$(sel,root).forEach(function(o){if(o!==el&&opts.isOn(o))opts.set(o,false)}); /* tap kartu lain menutup yang sebelumnya */
    opts.set(el,!on);
  });
};
NE.ui={init:function(){
  var box=$('#ec');
  box.innerHTML=NE.CATS.map(function(c){return '<button type="button" class="ec" aria-expanded="false"><div class="dot" style="background:'+c.c+'">'+ico+'</div><h3>'+c.n+'</h3><p>'+c.d+'</p><span class="hint"></span><div class="more"><div><b>Contoh</b>'+c.e+'<b>Pengelolaan</b>'+c.m+'</div></div></button>'}).join('');
  function canHover(){return matchMedia('(hover:hover) and (pointer:fine)').matches}
  function hint(on){return on?(canHover()?'Detail ditampilkan':'Ketuk lagi untuk menutup'):(canHover()?'Arahkan kursor untuk detail':'Ketuk untuk detail')}
  function setCard(b,on){b.setAttribute('aria-expanded',on?'true':'false');$('.hint',b).textContent=hint(on)}
  $$('.ec',box).forEach(function(b){setCard(b,false)});
  NE.hoverTap(box,'.ec',{set:setCard,isOn:function(b){return b.getAttribute('aria-expanded')==='true'}});
  /* daftar nama tim (CTA "Be Part of the Green") */
  NE.hoverTap($('.team-list'),'.tm',{set:function(el,on){el.classList.toggle('is-on',on)},isOn:function(el){return el.classList.contains('is-on')}});
  document.addEventListener('pointerdown',function(e){
    var b=e.target.closest&&e.target.closest('.btn,.bin');
    if(!b||b.disabled||NE.reduced)return;
    var r=b.getBoundingClientRect(),s=Math.max(r.width,r.height)*2,el=document.createElement('i');
    el.className='ripple';
    el.style.cssText='width:'+s+'px;height:'+s+'px;left:'+(e.clientX-r.left-s/2)+'px;top:'+(e.clientY-r.top-s/2)+'px';
    b.appendChild(el);setTimeout(function(){el.remove()},650);
  },{passive:true});
}};
})();
