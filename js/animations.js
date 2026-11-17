/* NUSA ECO — scroll reveal, counters, parallax, visibility-aware motion */
(function(){
var NE=window.NE=window.NE||{};
NE.$=function(s,r){return (r||document).querySelector(s)};
NE.$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
NE.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
NE.count=function(el,to,ms){
  if(NE.reduced){el.textContent=to.toLocaleString('id-ID',{minimumFractionDigits:Number.isInteger(to)?0:1,maximumFractionDigits:Number.isInteger(to)?0:1});return}
  var t0=performance.now();
  (function f(t){var p=Math.min(1,(t-t0)/ms);var v=to*(1-Math.pow(1-p,3));el.textContent=v.toLocaleString('id-ID',{minimumFractionDigits:Number.isInteger(to)?0:1,maximumFractionDigits:Number.isInteger(to)?0:1});if(p<1)requestAnimationFrame(f)})(t0);
};
var GROUPS=[['.sg>.sc','v-s'],['.prob>.pr','v-l'],['.steps>.st','v-u'],['.cc>.chc','v-s'],['.ecards>.ec',''],['.cta','v-s']];
var io,vis=new Set(),tick=false;
function reveal(t){
  NE.$$('[data-c]',t).forEach(function(s){NE.count(s,+s.dataset.c,1400)});
  NE.$$('[data-w]',t).forEach(function(b){b.style.width=b.dataset.w+'%'});
  NE.$$('[data-p]',t).forEach(function(c){c.style.strokeDashoffset=176*(1-c.dataset.p/100)});
}
NE.observe=function(){NE.$$('.view.on .rv').forEach(function(e){io.observe(e)})};
NE.anim={init:function(){
  GROUPS.forEach(function(g){NE.$$(g[0]).forEach(function(e,i){e.classList.add('rv');if(g[1])e.classList.add(g[1]);e.style.setProperty('--d',(i*90)+'ms')})});
  io=new IntersectionObserver(function(es){es.forEach(function(e){
    if(!e.isIntersecting)return;
    var t=e.target;io.unobserve(t);t.classList.add('in');reveal(t);
    var d=parseFloat(t.style.getPropertyValue('--d'))||0;
    /* drop reveal classes afterwards so hover transitions work normally */
    setTimeout(function(){t.classList.remove('rv','in','v-s','v-l','v-u')},950+d);
  })},{threshold:.12,rootMargin:'0px 0px -6% 0px'});
  var aio=new IntersectionObserver(function(es){es.forEach(function(e){
    e.target.classList.toggle('off',!e.isIntersecting);
    e.isIntersecting?vis.add(e.target):vis.delete(e.target);
  })});
  NE.$$('.art').forEach(function(a){aio.observe(a)});
  addEventListener('scroll',function(){
    if(tick||NE.reduced||!vis.size)return;tick=true;
    requestAnimationFrame(function(){tick=false;var y=Math.min(scrollY,800)*.06;vis.forEach(function(a){a.style.setProperty('--py',y+'px')})});
  },{passive:true});
}};
})();
