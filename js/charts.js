/* NUSA ECO — visualisasi berbasis data acuan studi kasus */
(function(){
var NE=window.NE,$=NE.$;
function txt(){return getComputedStyle(document.body).color}
function dur(){return NE.reduced?0:1000}
function legend(col){return {position:'bottom',labels:{color:col,usePointStyle:true,boxWidth:10,padding:16,font:{family:'Inter',size:13}}}}
function fallback(c){var p=document.createElement('p');p.textContent=c.getAttribute('aria-label')+' (grafik tidak dapat dimuat).';c.parentNode.replaceChild(p,c)}
function composition(c){
 var d=window.NUSA_DATA;
 new Chart(c,{type:'doughnut',data:{labels:d.categories.map(x=>x.label),datasets:[{data:d.categories.map(x=>x.kg),backgroundColor:['#236B45','#80B98A','#D9A441','#78909C'],borderWidth:0}]},
 options:{responsive:true,maintainAspectRatio:false,animation:{duration:dur()},plugins:{legend:legend(txt()),tooltip:{callbacks:{label:function(x){return ' '+x.label+': '+x.parsed+' kg/bulan'}}}}}});
}
function management(c){
 var d=window.NUSA_DATA;
 new Chart(c,{type:'doughnut',data:{labels:['Dikelola / didaur ulang','Residu ke TPA'],datasets:[{data:[d.managedPct,d.residuePct],backgroundColor:['#236B45','#D9A441'],borderWidth:0}]},
 options:{responsive:true,maintainAspectRatio:false,cutout:'62%',animation:{duration:dur()},plugins:{legend:legend(txt()),tooltip:{callbacks:{label:function(x){return ' '+x.label+': '+x.parsed.toLocaleString('id-ID')+'% (estimasi tengah rentang acuan)'}}}}}});
}
NE.charts={
 init:function(){
  if(!window.NUSA_DATA)return;
  var spec={ch1:composition,ch2:management};
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;io.unobserve(e.target);window.Chart?spec[e.target.id](e.target):fallback(e.target)})},{threshold:.2});
  Object.keys(spec).forEach(function(k){var c=$('#'+k);if(c)io.observe(c)});
 },
 result:function(c,res){
  if(!window.Chart)return fallback(c);
  var ks=Object.keys(res),name={};NE.CATS.forEach(function(x){name[x.k]=x.n.replace('Sampah ','')});
  new Chart(c,{type:'bar',data:{labels:ks.map(function(k){return name[k]}),datasets:[{label:'Benar',data:ks.map(function(k){return res[k].r}),backgroundColor:'#59c98e',borderRadius:8},{label:'Salah',data:ks.map(function(k){return res[k].w}),backgroundColor:'#e8837a',borderRadius:8}]},
  options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,scales:{x:{stacked:true},y:{stacked:true}},plugins:{legend:legend('#fff')}}});
 }
};
})();
