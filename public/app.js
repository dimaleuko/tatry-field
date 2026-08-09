const LEVELS={1:'Кофе в термосе',2:'Выгулять Salomon',3:'Уже не brunch',4:'Руки на скалу',5:'Позвони маме'};
const TOPO_URL='https://tile.opentopomap.org/{z}/{x}/{y}.png';
const TOPO_ATTR='Map data © OpenStreetMap contributors · Map style © OpenTopoMap (CC-BY-SA)';
const LANDMARKS=[
  {name:'ZAKOPANE',lat:49.2992,lon:19.9496,kind:'city'},
  {name:'KUŹNICE',lat:49.2705,lon:19.9816,kind:'trailhead'},
  {name:'MORSKIE OKO',lat:49.2015,lon:20.0700,kind:'lake'},
  {name:'GIEWONT',lat:49.2510,lon:19.9342,kind:'peak'},
  {name:'KASPROWY WIERCH',lat:49.2329,lon:19.9819,kind:'peak'},
  {name:'KIRY',lat:49.2758,lon:19.8688,kind:'trailhead'},
  {name:'SIWA POLANA',lat:49.2935,lon:19.7958,kind:'trailhead'},
  {name:'PALENICA',lat:49.2549,lon:20.1024,kind:'trailhead'}
];

let routes=[],stayZones=[],filters=new Set(),map,markers={},activeOutline=null,activeLine=null,contextLayer=L.layerGroup();
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function landmarkIcon(l){return L.divIcon({className:'landmark-icon-wrap',html:`<div class="landmark-label ${l.kind}"><i></i><span>${esc(l.name)}</span></div>`,iconSize:[145,28],iconAnchor:[8,14]})}
function initMap(){
  map=L.map('map',{zoomControl:false,preferCanvas:true}).setView([49.245,19.98],11);
  L.control.zoom({position:'topright'}).addTo(map);
  L.control.scale({imperial:false,position:'bottomright'}).addTo(map);
  L.tileLayer(TOPO_URL,{maxZoom:17,attribution:TOPO_ATTR}).addTo(map);
  contextLayer.addTo(map);
  LANDMARKS.forEach(l=>L.marker([l.lat,l.lon],{icon:landmarkIcon(l),interactive:false,zIndexOffset:l.kind==='city'?450:100}).addTo(contextLayer));
}
function markerIcon(){return L.divIcon({className:'',html:'<div class="trailhead-dot"></div>',iconSize:[18,18],iconAnchor:[9,9]})}
function visible(r){
  for(const f of filters){
    if(f==='under4'&&r.hours>4)return false;
    if(f==='noChains'&&r.chains)return false;
    if(f==='beginner'&&!r.beginner)return false;
    if(f==='beautiful'&&r.beauty<9)return false;
    if(f==='quiet'&&r.crowd==='high')return false;
    if(f==='hike'&&r.routeKind!=='hike')return false;
    if(f==='height'&&r.routeKind!=='height')return false;
    if(f==='easyReturn'&&(r.returnToZakopane?.score||0)<4)return false;
  }
  return true;
}
function fmtCrowd(v){return v==='low'?'низко':v==='med'?'средне':'много'}
function returnClass(score){return score>=5?'excellent':score>=4?'good':'caution'}
function kindLabel(r){return r.routeKind==='height'?'ЦЕЛЬ: ВЫСОТА':'ПРОСТО ХАЙК'}
function routeCard(r,i){
  const objective=r.objective||{name:r.goal||r.end,altitude:r.maxAlt};
  const ret=r.returnToZakopane||{};
  return `<a class="route-card" href="/route/${r.id}" data-id="${r.id}">
    <div class="route-head"><div><div class="route-number">${String(i+1).padStart(2,'0')} / ${String(routes.length).padStart(2,'0')}</div><h2 class="route-title">${esc(r.name)}</h2><div class="route-short">${esc(r.short)}</div></div><div class="trail-ready-pill">TRAIL MODE →</div></div>
    <div class="route-flags"><span class="route-kind ${r.routeKind}">${kindLabel(r)}</span><span class="objective-chip">${esc(objective.name)} · ${objective.altitude} м</span><span class="return-chip ${returnClass(ret.score)}">↩ Zakopane ${ret.score||'—'}/5</span></div>
    <div class="metrics"><div class="metric"><small>Время</small><b>${r.hours} ч</b></div><div class="metric"><small>Дистанция</small><b>${r.km} км</b></div><div class="metric"><small>Набор</small><b>+${r.ascent} м</b></div><div class="metric"><small>Уровень</small><b>${r.diff}/5</b></div><div class="metric"><small>Цепи</small><b>${r.chains?'да':'нет'}</b></div><div class="metric"><small>Толпы</small><b>${fmtCrowd(r.crowd)}</b></div></div>
    <div class="tags"><span class="tag">${LEVELS[r.diff]}</span>${r.tags.map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div>
  </a>`;
}
function render(){
  const list=routes.filter(visible);
  $('#count').textContent=`${list.length} / ${routes.length}`;
  $('#routeList').innerHTML=list.length?list.map(routeCard).join(''):'<div class="empty">Ничего не подходит. Сбрось один фильтр — горы не обязаны проходить кастинг.</div>';
  syncMarkers(list);
  $$('.route-card').forEach(el=>{el.addEventListener('mouseenter',()=>preview(el.dataset.id));el.addEventListener('focus',()=>preview(el.dataset.id))});
}
function syncMarkers(list){
  const ids=new Set(list.map(r=>r.id));
  routes.forEach(r=>{
    if(ids.has(r.id)){
      if(!markers[r.id])markers[r.id]=L.marker([r.startLat,r.startLon],{icon:markerIcon(),zIndexOffset:300}).addTo(map).bindTooltip(`<b>${esc(r.start)}</b><br>${esc(r.name)}`,{direction:'top',offset:[0,-6]});
      markers[r.id].addTo(map);
    } else if(markers[r.id]) map.removeLayer(markers[r.id]);
  });
  if(list.length){const bounds=L.latLngBounds(list.map(r=>[r.startLat,r.startLon]));bounds.extend([49.2992,19.9496]);if(bounds.isValid())map.fitBounds(bounds.pad(.15),{animate:false,maxZoom:11})}
}
async function preview(id){
  const r=routes.find(x=>x.id===id);if(!r)return;
  if(activeOutline){map.removeLayer(activeOutline);activeOutline=null}if(activeLine){map.removeLayer(activeLine);activeLine=null}
  try{const g=await fetch(`/api/geometry/${id}`).then(x=>x.json());activeOutline=L.geoJSON(g.geometry,{style:{color:'#fff8e8',weight:9,opacity:.95,lineCap:'round',lineJoin:'round'}}).addTo(map);activeLine=L.geoJSON(g.geometry,{style:{color:'#ff4f2e',weight:5,opacity:1,lineCap:'round',lineJoin:'round'}}).addTo(map);const b=activeLine.getBounds();b.extend([49.2992,19.9496]);map.fitBounds(b.pad(.13),{maxZoom:12})}catch{}
}

function stayCard(z){
  const routeNames=(z.routes||[]).map(id=>routes.find(r=>r.id===id)?.name).filter(Boolean).slice(0,4);
  return `<article class="stay-card ${z.id==='centrum-dworzec'?'featured':''}">
    <div class="stay-tag">${esc(z.tag||'BASE')}</div><h3>${esc(z.name)}</h3><p class="stay-short">${esc(z.short)}</p>
    <div class="stay-copy"><b>Лучше всего:</b> ${esc(z.bestFor)}</div>
    <div class="stay-copy muted"><b>Компромисс:</b> ${esc(z.tradeoff)}</div>
    ${routeNames.length?`<div class="stay-route-list">${routeNames.map(n=>`<span>${esc(n)}</span>`).join('')}</div>`:''}
    <a class="btn ${z.id==='centrum-dworzec'?'acid':''}" target="_blank" rel="noopener" href="${z.bookingUrl}">Искать жильё ↗</a>
  </article>`;
}
function renderStayZones(){if($('#stayZones'))$('#stayZones').innerHTML=stayZones.map(stayCard).join('')}
async function loadOfficial(){try{const d=await fetch('/api/official').then(r=>r.json());$('#officialState').textContent=d.tpn?.ok?'TPN online':'link only';$('#officialText').textContent=d.tpn?.ok?'TPN отвечает. Проверяй официальный текст ближе к дате и ещё раз утром перед стартом.':'Не удалось прочитать TPN автоматически — используй официальный линк.'}catch{$('#officialState').textContent='link only'}}
async function boot(){
  initMap();
  const [rd,sd]=await Promise.all([fetch('/api/routes').then(r=>r.json()),fetch('/api/stay-zones').then(r=>r.json())]);
  routes=rd.routes;stayZones=sd.zones||[];renderStayZones();render();
  routes.forEach(r=>{if(!markers[r.id])markers[r.id]=L.marker([r.startLat,r.startLon],{icon:markerIcon(),zIndexOffset:300}).addTo(map).bindTooltip(`<b>${esc(r.start)}</b><br>${esc(r.name)}`,{direction:'top',offset:[0,-6]})});
  await Promise.allSettled([loadOfficial()]);
}
$$('[data-filter]').forEach(b=>b.onclick=()=>{const f=b.dataset.filter;if(f==='reset'){filters.clear();$$('.chip').forEach(x=>x.classList.remove('active'))}else{if(f==='hike'&&filters.has('height')){filters.delete('height');$('[data-filter="height"]')?.classList.remove('active')}if(f==='height'&&filters.has('hike')){filters.delete('hike');$('[data-filter="hike"]')?.classList.remove('active')}filters.has(f)?filters.delete(f):filters.add(f);b.classList.toggle('active')}render()});
boot();
