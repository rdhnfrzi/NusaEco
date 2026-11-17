/* NUSA ECO — navbar behaviour for pages without hash routing */
(function(){
var bg=document.getElementById('bg'),lk=document.getElementById('lk'),ind=document.getElementById('ind');
if(!bg||!lk)return;
function pos(){var on=lk.querySelector('a.l.on');if(!on||!on.offsetWidth){ind.classList.remove('on');return}
 ind.style.width=on.offsetWidth+'px';ind.style.height=on.offsetHeight+'px';ind.style.transform='translate('+on.offsetLeft+'px,'+on.offsetTop+'px)';ind.classList.add('on')}
function menu(o){lk.classList.toggle('open',o);bg.setAttribute('aria-expanded',o);bg.setAttribute('aria-label',o?'Tutup menu':'Buka menu')}
bg.onclick=function(){menu(!lk.classList.contains('open'))};
addEventListener('keydown',function(e){if(e.key==='Escape'){menu(false);bg.focus()}});
lk.addEventListener('click',function(e){if(e.target.closest('a'))menu(false)});
document.addEventListener('click',function(e){if(lk.classList.contains('open')&&!e.target.closest('#lk,#bg'))menu(false)});
matchMedia('(min-width:1101px)').addEventListener&&matchMedia('(min-width:1101px)').addEventListener('change',function(m){if(m.matches)menu(false)});
var t;addEventListener('resize',function(){clearTimeout(t);t=setTimeout(pos,120)},{passive:true});
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(pos);
pos();
})();
