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

let routes=[],stayZones=[],filters=new Set(),map,markers={},activeOutline=null,activeLine=null,contextLayer=null,previewSeq=0;
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const savedStore=window.TatrySavedRoutes;
let compareReturnFocus=null;
let compareNoticeTimer=null;

function landmarkIcon(l){return L.divIcon({className:'landmark-icon-wrap',html:`<div class="landmark-label ${l.kind}"><i></i><span>${esc(l.name)}</span></div>`,iconSize:[145,28],iconAnchor:[8,14]})}
function initMap(){
  if(!window.L) throw new Error('Map library failed to load');
  contextLayer=L.layerGroup();
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
function routePhotoPair(photos=[]){
  const pair=photos.slice(0,2);
  if(!pair.length)return '';
  return `<div class="route-photo-pair" aria-label="Фотографии маршрута">${pair.map((photo,i)=>`<div class="route-card-photo ${i===0?'primary':'secondary'}"><img loading="lazy" decoding="async" referrerpolicy="no-referrer" src="${esc(photo.src)}" alt="${esc(photo.alt)}"><span>${esc(photo.title)}</span></div>`).join('')}</div>`;
}
function routeCard(r,i,savedSet=new Set()){
  const objective=r.objective||{name:r.goal||r.end,altitude:r.maxAlt};
  const ret=r.returnToZakopane||{};
  const isSaved=savedSet.has(r.id);
  return `<article class="route-card${isSaved?' saved':''}" data-id="${r.id}">
    <a class="route-card-link" href="/route/${r.id}">
      <div class="route-head"><div><div class="route-number">${String(i+1).padStart(2,'0')} / ${String(routes.length).padStart(2,'0')}</div><h2 class="route-title">${esc(r.name)}</h2><div class="route-short">${esc(r.short)}</div></div><div class="trail-ready-pill">TRAIL MODE →</div></div>
      ${routePhotoPair(r.photos)}
      <div class="route-flags"><span class="route-kind ${r.routeKind}">${kindLabel(r)}</span><span class="objective-chip">${esc(objective.name)} · ${objective.altitude} м</span><span class="return-chip ${returnClass(ret.score)}">↩ Zakopane ${ret.score||'—'}/5</span></div>
      <div class="metrics"><div class="metric"><small>Время</small><b>${r.hours} ч</b></div><div class="metric"><small>Дистанция</small><b>${r.km} км</b></div><div class="metric"><small>Набор</small><b>+${r.ascent} м</b></div><div class="metric"><small>Уровень</small><b>${r.diff}/5</b></div><div class="metric"><small>Цепи</small><b>${r.chains?'да':'нет'}</b></div><div class="metric"><small>Толпы</small><b>${fmtCrowd(r.crowd)}</b></div></div>
      <div class="tags"><span class="tag">${LEVELS[r.diff]}</span>${r.tags.map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div>
    </a>
    <button type="button" class="route-save-btn${isSaved?' saved':''}" data-save-route="${r.id}" aria-pressed="${isSaved}" aria-label="${isSaved?'Убрать из сохранённых':'Сохранить для сравнения'}: ${esc(r.name)}">${isSaved?'СОХРАНЕНО ✓':'СОХРАНИТЬ +'}</button>
  </article>`;
}
function render(){
  const list=routes.filter(visible);
  const selected=new Set(savedStore?.get()||[]);
  $('#count').textContent=`${list.length} / ${routes.length}`;
  $('#routeList').innerHTML=list.length?list.map((route,index)=>routeCard(route,index,selected)).join(''):'<div class="empty">Ничего не подходит. Сбрось один фильтр — горы не обязаны проходить кастинг.</div>';
  syncMarkers(list);
  $$('.route-card').forEach(el=>{
    el.addEventListener('mouseenter',()=>preview(el.dataset.id));
    el.addEventListener('mouseleave',()=>clearPreview());
    const link=el.querySelector('.route-card-link');
    link?.addEventListener('focus',()=>preview(el.dataset.id));
    link?.addEventListener('blur',()=>clearPreview());
  });
  $$('[data-save-route]').forEach(button=>button.addEventListener('click',()=>{
    const result=savedStore.toggle(button.dataset.saveRoute);
    syncSavedUi();
    if(!result.ok)showCompareNotice('Максимум — три маршрута. Убери один, чтобы добавить другой.');
  }));
  syncSavedUi();
}

function savedRoutes(){
  const ids=savedStore?.get()||[];
  return ids.map(id=>routes.find(route=>route.id===id)).filter(Boolean);
}
function showCompareNotice(message){
  const hint=$('#compareTrayHint');
  if(!hint)return;
  clearTimeout(compareNoticeTimer);
  hint.textContent=message;
  compareNoticeTimer=setTimeout(syncSavedUi,2600);
}
function syncSavedUi(){
  if(!savedStore)return;
  const ids=savedStore.get();
  if(routes.length){
    const valid=ids.filter(id=>routes.some(route=>route.id===id));
    if(valid.length!==ids.length){savedStore.set(valid);return}
  }
  const savedSet=new Set(ids);
  $$('[data-save-route]').forEach(button=>{
    const isSaved=savedSet.has(button.dataset.saveRoute);
    const route=routes.find(item=>item.id===button.dataset.saveRoute);
    button.classList.toggle('saved',isSaved);
    button.setAttribute('aria-pressed',String(isSaved));
    button.setAttribute('aria-label',`${isSaved?'Убрать из сохранённых':'Сохранить для сравнения'}: ${route?.name||'маршрут'}`);
    button.textContent=isSaved?'СОХРАНЕНО ✓':'СОХРАНИТЬ +';
    button.closest('.route-card')?.classList.toggle('saved',isSaved);
  });
  const tray=$('#compareTray');
  if(!tray)return;
  tray.hidden=!ids.length;
  document.body.classList.toggle('has-compare-tray',Boolean(ids.length));
  $('#compareTrayCount').textContent=`${ids.length} / ${savedStore.max}`;
  $('#compareTrayHint').textContent=ids.length<2?'Сохрани ещё один маршрут':ids.length<savedStore.max?'Можно добавить ещё один':'Три маршрута — максимум';
  $('#compareTrayRoutes').innerHTML=savedRoutes().map(route=>`<button type="button" class="compare-route-chip" data-remove-saved="${route.id}" aria-label="Убрать ${esc(route.name)} из сохранённых">${esc(route.name)} <span>×</span></button>`).join('');
  $('#openCompare').disabled=ids.length<2;
  $('#openCompare').textContent=ids.length>=2?`Сравнить ${ids.length}`:'Сравнить';
  if($('#compareOverlay')?.classList.contains('open'))renderCompareContent();
}
function compareRows(){
  return [
    ['Формат',route=>kindLabel(route)],
    ['Время',route=>`${route.hours} ч`],
    ['Дистанция',route=>`${route.km} км`],
    ['Набор',route=>`+${route.ascent} м`],
    ['Макс. высота',route=>`${route.maxAlt} м`],
    ['Сложность',route=>`${route.diff}/5 · ${LEVELS[route.diff]}`],
    ['Цепи',route=>route.chains?'Да':'Нет'],
    ['Толпы',route=>fmtCrowd(route.crowd)],
    ['Старт',route=>route.start],
    ['Главная цель',route=>`${route.objective?.name||route.goal||route.end} · ${route.objective?.altitude||route.maxAlt} м`],
    ['Обратно в Zakopane',route=>`${route.returnToZakopane?.score||'—'}/5 · ${route.returnToZakopane?.label||''}${route.returnToZakopane?.typicalTime?` · ${route.returnToZakopane.typicalTime}`:''}`],
    ['Почему идти',route=>route.experience?.whyGo?.text||route.why],
    ['Главный компромисс',route=>route.experience?.tradeOffs?.[0]||route.risks?.[0]||'—'],
    ['Где жить',route=>route.stay||'—']
  ];
}
function renderCompareContent(){
  const selected=savedRoutes();
  const content=$('#compareContent');
  if(!content)return;
  if(selected.length<2){content.innerHTML='<div class="compare-empty">Для сравнения нужны хотя бы два маршрута.</div>';return}
  const heads=selected.map((route,index)=>`<div class="compare-route-head"><span>${String(index+1).padStart(2,'0')}</span><h3>${esc(route.name)}</h3><button type="button" data-compare-remove="${route.id}">Убрать</button><a href="/route/${route.id}">Открыть маршрут →</a></div>`).join('');
  const rows=compareRows().map(([label,value])=>`<div class="compare-row"><div class="compare-label">${esc(label)}</div>${selected.map(route=>`<div class="compare-value">${esc(value(route))}</div>`).join('')}</div>`).join('');
  content.innerHTML=`<div class="compare-table" style="--compare-count:${selected.length}"><div class="compare-row compare-route-row"><div class="compare-label">Маршруты</div>${heads}</div>${rows}</div>`;
}
function openCompare(){
  if(savedRoutes().length<2){showCompareNotice('Сохрани хотя бы два маршрута для сравнения.');return}
  compareReturnFocus=document.activeElement;
  renderCompareContent();
  const overlay=$('#compareOverlay');
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden','false');
  document.body.classList.add('compare-open');
  $('#closeCompare')?.focus();
}
function closeCompare(){
  const overlay=$('#compareOverlay');
  overlay?.classList.remove('open');
  overlay?.setAttribute('aria-hidden','true');
  document.body.classList.remove('compare-open');
  compareReturnFocus?.focus?.();
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
function removePreviewLayers(){
  if(activeOutline){map.removeLayer(activeOutline);activeOutline=null}
  if(activeLine){map.removeLayer(activeLine);activeLine=null}
}
function fitOverview(){
  const list=routes.filter(visible);
  if(!list.length)return;
  const bounds=L.latLngBounds(list.map(r=>[r.startLat,r.startLon]));
  bounds.extend([49.2992,19.9496]);
  if(bounds.isValid())map.fitBounds(bounds.pad(.15),{animate:false,maxZoom:11});
}
function clearPreview(){
  previewSeq++;
  removePreviewLayers();
  fitOverview();
}
async function preview(id){
  const r=routes.find(x=>x.id===id);if(!r)return;
  const seq=++previewSeq;
  removePreviewLayers();
  try{
    const g=await fetch(`/api/geometry/${id}`).then(x=>x.json());
    if(seq!==previewSeq)return;
    removePreviewLayers();
    activeOutline=L.geoJSON(g.geometry,{style:{color:'#fff8e8',weight:9,opacity:.95,lineCap:'round',lineJoin:'round'}}).addTo(map);
    activeLine=L.geoJSON(g.geometry,{style:{color:'#ff4f2e',weight:5,opacity:1,lineCap:'round',lineJoin:'round'}}).addTo(map);
    const b=activeLine.getBounds();b.extend([49.2992,19.9496]);map.fitBounds(b.pad(.13),{maxZoom:12});
  }catch{}
}

function stayCard(z){
  const routeNames=(z.routes||[]).map(id=>routes.find(r=>r.id===id)?.name).filter(Boolean).slice(0,4);
  return `<article class="stay-card">
    <div class="stay-tag">${esc(z.tag||'BASE')}</div><h3>${esc(z.name)}</h3><p class="stay-short">${esc(z.short)}</p>
    <div class="stay-copy"><b>Лучше всего:</b> ${esc(z.bestFor)}</div>
    <div class="stay-copy muted"><b>Компромисс:</b> ${esc(z.tradeoff)}</div>
    ${routeNames.length?`<div class="stay-route-list">${routeNames.map(n=>`<span>${esc(n)}</span>`).join('')}</div>`:''}
    <a class="btn" target="_blank" rel="noopener" href="${z.bookingUrl}">Искать жильё ↗</a>
  </article>`;
}
function renderStayZones(){if($('#stayZones'))$('#stayZones').innerHTML=stayZones.map(stayCard).join('')}
async function loadOfficial(){try{const d=await fetch('/api/official').then(r=>r.json());$('#officialState').textContent=d.tpn?.ok?'TPN online':'link only';$('#officialText').textContent=d.tpn?.ok?'TPN отвечает. Проверяй официальный текст ближе к дате и ещё раз утром перед стартом.':'Не удалось прочитать TPN автоматически — используй официальный линк.'}catch{$('#officialState').textContent='link only'}}
async function boot(){
  initMap();
  const [rd,sd]=await Promise.all([fetch('/api/routes').then(r=>r.json()),fetch('/api/stay-zones').then(r=>r.json())]);
  routes=rd.routes;stayZones=sd.zones||[];renderStayZones();render();
  routes.forEach(r=>{if(!markers[r.id])markers[r.id]=L.marker([r.startLat,r.startLon],{icon:markerIcon(),zIndexOffset:300}).addTo(map).bindTooltip(`<b>${esc(r.start)}</b><br>${esc(r.name)}`,{direction:'top',offset:[0,-6]})});
  if(new URLSearchParams(location.search).get('compare')==='1'&&savedRoutes().length>=2)setTimeout(openCompare,0);
  await Promise.allSettled([loadOfficial()]);
}
$$('[data-filter]').forEach(b=>b.onclick=()=>{const f=b.dataset.filter;if(f==='reset'){filters.clear();$$('.chip').forEach(x=>x.classList.remove('active'))}else{if(f==='hike'&&filters.has('height')){filters.delete('height');$('[data-filter="height"]')?.classList.remove('active')}if(f==='height'&&filters.has('hike')){filters.delete('hike');$('[data-filter="hike"]')?.classList.remove('active')}filters.has(f)?filters.delete(f):filters.add(f);b.classList.toggle('active')}render()});
$('#compareTrayRoutes')?.addEventListener('click',event=>{
  const button=event.target.closest('[data-remove-saved]');
  if(button)savedStore.remove(button.dataset.removeSaved);
});
$('#compareContent')?.addEventListener('click',event=>{
  const button=event.target.closest('[data-compare-remove]');
  if(!button)return;
  savedStore.remove(button.dataset.compareRemove);
  if(savedRoutes().length<2)closeCompare();
});
$('#clearSavedRoutes')?.addEventListener('click',()=>{savedStore.clear();closeCompare()});
$('#openCompare')?.addEventListener('click',openCompare);
$('#closeCompare')?.addEventListener('click',closeCompare);
$('#compareOverlay')?.addEventListener('click',event=>{if(event.target.id==='compareOverlay')closeCompare()});
document.addEventListener('keydown',event=>{
  const panel=$('#compareOverlay');
  if(!panel?.classList.contains('open'))return;
  if(event.key==='Escape'){closeCompare();return}
  if(event.key!=='Tab')return;
  const focusable=[...panel.querySelectorAll('button:not(:disabled),a[href]')].filter(el=>el.offsetParent!==null);
  if(!focusable.length)return;
  const first=focusable[0],last=focusable.at(-1);
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
});
window.addEventListener('tatry:saved-routes',syncSavedUi);
boot().catch(err=>{console.error(err);const el=document.querySelector('#routeList');if(el)el.innerHTML='<div class="empty"><b>Не удалось запустить карту.</b><br>Обнови страницу. Если ошибка повторяется — map library не загрузилась.</div>';});
