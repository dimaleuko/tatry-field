const LEVELS={1:'Кофе в термосе',2:'Выгулять Salomon',3:'Уже не brunch',4:'Руки на скалу',5:'Позвони маме'};
const ZAKOPANE={name:'ZAKOPANE',lat:49.2992,lon:19.9496,kind:'city'};
const LANDMARKS=[
  ZAKOPANE,
  {name:'KUŹNICE',lat:49.2705,lon:19.9816,kind:'trailhead'},
  {name:'MORSKIE OKO',lat:49.2015,lon:20.0700,kind:'lake'},
  {name:'GIEWONT',lat:49.2510,lon:19.9342,kind:'peak'},
  {name:'KASPROWY WIERCH',lat:49.2329,lon:19.9819,kind:'peak'},
  {name:'HALA GĄSIENICOWA',lat:49.2436,lon:20.0067,kind:'place'},
  {name:'KIRY',lat:49.2758,lon:19.8688,kind:'trailhead'},
  {name:'SIWA POLANA',lat:49.2935,lon:19.7958,kind:'trailhead'},
  {name:'PALENICA',lat:49.2549,lon:20.1024,kind:'trailhead'},
  {name:'ŁYSA POLANA',lat:49.2689,lon:20.1158,kind:'place'}
];
const TOPO_URL='https://tile.opentopomap.org/{z}/{x}/{y}.png';
const TOPO_ATTR='Map data © OpenStreetMap contributors · Map style © OpenTopoMap (CC-BY-SA)';
const DETAIL_URL='https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const DETAIL_ATTR='© OpenStreetMap contributors';
const id=location.pathname.split('/').filter(Boolean).pop();
let route,map,routeOutline,routeLayer,routeBounds,geometryData,routeMarkers=null,contextLayer=null,poiLayer=null;
let trailPois=[];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function poiLink(p){return `https://www.openstreetmap.org/?mlat=${p.lat}&mlon=${p.lon}#map=17/${p.lat}/${p.lon}`}
function haversineKm(a,b){const R=6371,rad=Math.PI/180,dLat=(b.lat-a.lat)*rad,dLon=(b.lon-a.lon)*rad,lat1=a.lat*rad,lat2=b.lat*rad;const h=Math.sin(dLat/2)**2+Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;return 2*R*Math.asin(Math.sqrt(h))}
function haversineM(a,b){return haversineKm(a,b)*1000}
function landmarkIcon(l){return L.divIcon({className:'landmark-icon-wrap',html:`<div class="landmark-label ${l.kind}"><i></i><span>${esc(l.name)}</span></div>`,iconSize:[150,28],iconAnchor:[8,14]})}
function routePin(kind,label){return L.divIcon({className:'route-pin-wrap',html:`<div class="route-pin ${kind}"><i></i><span>${esc(label)}</span></div>`,iconSize:[190,34],iconAnchor:[12,17]})}
function addContextLandmarks(){contextLayer.clearLayers();LANDMARKS.forEach(l=>L.marker([l.lat,l.lon],{icon:landmarkIcon(l),interactive:false,zIndexOffset:l.kind==='city'?450:100}).addTo(contextLayer))}
function fitRoute(){if(routeBounds?.isValid())map.fitBounds(routeBounds.pad(.11),{animate:true,maxZoom:14})}
function fitContext(){if(!routeBounds?.isValid())return;const b=L.latLngBounds(routeBounds);b.extend([ZAKOPANE.lat,ZAKOPANE.lon]);map.fitBounds(b.pad(.14),{animate:true,maxZoom:11})}
function bindMapViews(){document.querySelectorAll('[data-map-view]').forEach(btn=>btn.onclick=()=>{document.querySelectorAll('[data-map-view]').forEach(x=>x.classList.remove('active'));btn.classList.add('active');btn.dataset.mapView==='context'?fitContext():fitRoute()})}
function returnClass(score){return score>=5?'excellent':score>=4?'good':'caution'}
function kindLabel(r){return r.routeKind==='height'?'ЦЕЛЬ: ВЫСОТА':'ПРОСТО ХАЙК'}
function googleDirections(lat,lon,mode='walking'){return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=${mode}&dir_action=navigate`}
function appleDirections(lat,lon,mode='w'){return `https://maps.apple.com/?daddr=${lat},${lon}&dirflg=${mode}`}
function renderTerrainMix(mix=[]){return mix.map(([label,value])=>{const v=Math.max(0,Math.min(100,Number(value)||0));return `<div class="terrain-row"><div class="terrain-row-head"><span>${esc(label)}</span><b>${v}%</b></div><div class="terrain-track"><i style="width:${v}%"></i></div></div>`}).join('')}
function renderStoryTags(tags=[]){return tags.map(t=>`<span>${esc(t)}</span>`).join('')}

function renderBase(){
  const straight=haversineKm(ZAKOPANE,{lat:route.startLat,lon:route.startLon});
  const obj=route.objective||{name:route.goal||route.end,altitude:route.maxAlt,type:'цель'};
  const ret=route.returnToZakopane||{};
  const exp=route.experience||{};
  document.title=`${route.name} — TATRY / FIELD`;
  document.querySelector('#routeApp').innerHTML=`
  <section class="route-hero"><a class="back" href="/">← все маршруты</a><h1>${esc(route.name)}</h1>
    <div class="route-deck"><p>${esc(route.why)}</p><div class="difficulty-box"><small>сложность ${route.diff}/5</small><b>${LEVELS[route.diff]}</b></div></div>
    <div class="identity-strip"><div><small>Формат</small><b>${kindLabel(route)}</b></div><div><small>Цель</small><b>${esc(obj.name)}</b><span>${obj.altitude} м · ${esc(obj.type)}</span></div><div><small>Обратно в Zakopane</small><b>${ret.score||'—'}/5 · ${esc(ret.label||'')}</b><span>${esc(ret.typicalTime||'')}</span></div></div>
  </section>
  <div class="route-body"><div class="route-main">
    <section class="route-section"><div class="stat-grid"><div class="stat"><small>Время</small><b>${route.hours} ч</b></div><div class="stat"><small>Км</small><b>${route.km}</b></div><div class="stat"><small>Набор</small><b>+${route.ascent} м</b></div><div class="stat"><small>Max</small><b>${route.maxAlt} м</b></div><div class="stat"><small>Цепи</small><b>${route.chains?'да':'нет'}</b></div><div class="stat"><small>Лучше</small><b>${esc(route.best||'по условиям')}</b></div></div><div class="source-note">${esc(route.metricNote)}</div></section>
    <section class="route-section route-story-section"><div class="story-head"><div class="eyebrow">ROUTE STORY / ЧЕГО ЖДАТЬ</div><h2>Как ощущается этот маршрут.</h2><p>${esc(exp.routeStory||exp.intro||route.why)}</p></div><div class="story-top-grid"><div class="why-go-panel"><small>WHY GO</small><div class="why-go-tags">${renderStoryTags(exp.whyGo?.tags||[])}</div><p>${esc(exp.whyGo?.text||route.why)}</p></div><div class="terrain-panel"><div class="terrain-title"><small>TERRAIN MIX</small><span>примерная доля маршрута</span></div>${renderTerrainMix(exp.terrainMix||[])}</div></div><div class="story-grid"><div class="story-card"><small>Город / подход</small><p>${esc(exp.city||'')}</p></div><div class="story-card"><small>Что под ногами</small><p>${esc(exp.terrain||'')}</p></div><div class="story-card story-card-wide"><small>Ради каких видов идти</small><p>${esc(exp.views||'')}</p></div></div><div class="route-logic"><div><small>Почему старт здесь</small><p>${esc(exp.whyStart||'')}</p></div><div><small>Почему финиш здесь</small><p>${esc(exp.whyFinish||'')}</p></div></div><div class="tradeoff-block"><div class="tradeoff-title"><small>TRADE-OFFS</small><b>За что платишь ради этого маршрута.</b></div><div class="tradeoff-list">${(exp.tradeOffs||[]).map((x,i)=>`<div><span>${String(i+1).padStart(2,'0')}</span><p>${esc(x)}</p></div>`).join('')}</div></div><div class="day-flow"><div class="day-flow-label">ДЕНЬ ПО АКТАМ</div>${(exp.flow||[]).map((x,i)=>`<div class="day-flow-step"><span>${String(i+1).padStart(2,'0')}</span><b>${esc(x)}</b></div>`).join('')}</div><div class="source-note">Terrain mix — кураторская приблизительная доля маршрута по характеру покрытия/ландшафта, а не GPS-измерение. Route Story помогает представить день, но не заменяет маркировку на местности и актуальные сообщения TPN.</div></section>
    <section class="route-section trail-launch-section"><div class="trail-launch-copy"><div class="eyebrow">LIVE TRAIL MODE</div><h2>В дороге — уже не обзорная карта.</h2><p>Показывает твою позицию на треке, GPS accuracy, прогресс, расстояние до цели и ближайших POI, а также предупреждает, если ты ушёл от линии маршрута.</p></div><button class="trail-launch" id="openTrailMode"><span>START</span><b>TRAIL MODE</b><i>→</i></button><div class="source-note secure-note" id="secureNote"></div></section>
    <section class="route-section"><h2>Маршрут / GPX</h2><div class="map-toolbar map-toolbar-rich"><div><span id="routeGeometryMeta" class="loading">Загружаю эталонный трек…</span><span class="context-distance">Старт ≈ ${straight.toFixed(1)} км по прямой от центра Zakopane</span></div><div class="map-toolbar-actions"><div class="map-view-toggle"><button class="active" data-map-view="route">Маршрут</button><button data-map-view="context">Где это?</button></div><a class="btn acid" href="/api/gpx/${route.id}">Скачать GPX</a></div></div><div class="map-frame"><div id="detailMap" class="detail-map"></div><div class="map-legend"><span><i class="legend-start"></i>старт / финиш</span><span><i class="legend-goal"></i>цель / ключевая точка</span><span><i class="legend-route"></i>маршрут</span></div></div><div class="source-note">Планировочная карта показывает контекст. Линия взята из маршрутного источника и проверена по длине, границам региона и разрывам. Это всё равно не официальный GPX TPN: на местности следуй маркировке и актуальным сообщениям TPN/TOPR.</div></section>
    <section class="route-section"><h2>Профиль высот</h2><div class="elevation" id="elevation"><span class="loading">Считаю профиль…</span></div><div class="profile-meta" id="profileMeta"></div></section>
    <section class="route-section"><h2>Планирование заранее</h2><div class="planning-box"><div><small>Лучший период</small><b>${esc(route.best||'зависит от условий')}</b></div><p>Мы убрали «сегодня / завтра»: если поездка через неделю или две, ранний прогноз создаёт ложную уверенность. Проверяй погоду и TPN/TOPR ближе к дате, а затем ещё раз утром перед стартом.</p></div></section>
    <section class="route-section"><h2>Что может пойти не так</h2><div class="split"><ul class="bullet-list">${route.risks.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><ul class="bullet-list">${route.gear.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div></section>
    <section class="route-section"><h2>Официальный check</h2><div id="official" class="official-box"><span class="loading">Проверяю TPN/TOPR…</span></div></section>
  </div>
  <aside class="sidebar"><div class="sidebar-inner">
    <div class="safety-banner"><b>НЕ “SAFE / UNSAFE”.</b><br>Сервис помогает планировать и ориентироваться, но не заменяет официальные указатели, TPN/TOPR и здравый смысл на месте.</div>
    <section class="side-section directions-section"><h2>До старта</h2><p><b>${esc(route.start)}</b><br>Открой обычную навигацию от текущего места до trailhead.</p><div class="direction-buttons"><a class="btn primary" target="_blank" rel="noopener" href="${googleDirections(route.startLat,route.startLon,'walking')}">Google Maps ↗</a><a class="btn" target="_blank" rel="noopener" href="${appleDirections(route.startLat,route.startLon,'w')}">Apple Maps ↗</a></div></section>
    <section class="side-section"><h2>Логистика</h2><p><b>Старт:</b> ${esc(route.start)}<br><b>Цель:</b> ${esc(obj.name)} · ${obj.altitude} м<br><b>Финиш полного маршрута:</b> ${esc(route.finish||route.start)}<br><br>${esc(route.transport)}<br><br>${esc(route.parking)}</p></section>
    <section class="side-section return-section"><h2>Вернуться в Zakopane</h2><div class="return-score ${returnClass(ret.score)}"><b>${ret.score||'—'}/5</b><span>${esc(ret.label||'')}</span></div><p>${esc(ret.note||'')}</p><div class="return-time">Ориентир: <b>${esc(ret.typicalTime||'—')}</b></div><div class="direction-buttons"><a class="btn primary" target="_blank" rel="noopener" href="${googleDirections(ZAKOPANE.lat,ZAKOPANE.lon,'transit')}">Google · transit ↗</a><a class="btn" target="_blank" rel="noopener" href="${appleDirections(ZAKOPANE.lat,ZAKOPANE.lon,'r')}">Apple · transit ↗</a></div>${ret.sourceUrl?`<a class="btn transport-source" target="_blank" rel="noopener" href="${ret.sourceUrl}">актуальный транспорт ↗</a>`:''}</section>
    <section class="side-section"><h2>Где жить под этот маршрут</h2><div id="stayBox"><span class="loading">Подбираю базу и жильё…</span></div></section>
    <section class="side-section"><h2>Кофе / еда / транспорт рядом</h2><div class="poi-tabs"><button class="poi-tab active" data-kind="food">кофе + еда</button><button class="poi-tab" data-kind="parking">паркинг</button><button class="poi-tab" data-kind="transit">автобус</button></div><div id="poiList" class="poi-list"><span class="loading">Ищу вокруг старта…</span></div><div class="source-note">POI приходят из OpenStreetMap и могут быть неполными или устаревшими; часы работы лучше перепроверить.</div></section>
    <section class="side-section"><h2>Original sources</h2><div style="display:flex;gap:7px;flex-wrap:wrap"><a class="btn primary" href="https://tpn.gov.pl/komunikat-turystyczny" target="_blank" rel="noopener">TPN conditions ↗</a><a class="btn" href="https://topr.pl/" target="_blank" rel="noopener">TOPR ↗</a><a class="btn" href="${route.mapUrl}" target="_blank" rel="noopener">route reference ↗</a></div></section>
  </div></aside></div>`;
  document.querySelector('#secureNote').textContent=window.isSecureContext?'На HTTPS/localhost браузер сможет запросить GPS и компас.':'Сейчас открыт обычный HTTP по локальной сети. Trail Mode можно посмотреть в DEMO, но настоящий GPS/компас на iPhone потребует HTTPS после публикации.';
  initMap();bindPoiTabs();bindMapViews();bindTrailLaunch();
}

function initMap(){
  if(!window.L) throw new Error('Map library failed to load');
  routeMarkers=L.layerGroup();contextLayer=L.layerGroup();poiLayer=L.layerGroup();
  map=L.map('detailMap',{zoomControl:false,preferCanvas:true});
  L.control.zoom({position:'topright'}).addTo(map);
  L.control.scale({imperial:false,position:'bottomright'}).addTo(map);
  L.tileLayer(TOPO_URL,{maxZoom:17,attribution:TOPO_ATTR}).addTo(map);
  contextLayer.addTo(map);routeMarkers.addTo(map);poiLayer.addTo(map);
  addContextLandmarks();map.setView([route.startLat,route.startLon],12);loadGeometry();
}
function addRouteMarkers(g){
  routeMarkers.clearLayers();const coords=g.geometry?.coordinates||[];const first=coords[0]||[route.startLon,route.startLat];const last=coords[coords.length-1]||first;const startLL=L.latLng(first[1],first[0]);const endLL=L.latLng(last[1],last[0]);const returnsToStart=map.distance(startLL,endLL)<180;
  L.marker(startLL,{icon:routePin('start',returnsToStart?'СТАРТ / ФИНИШ':'СТАРТ'),zIndexOffset:1000}).addTo(routeMarkers).bindPopup(`<b>${returnsToStart?'Старт / финиш':'Старт'}</b><br>${esc(route.start)}`);
  const obj=route.objective||{};L.marker([route.summitLat,route.summitLon],{icon:routePin('goal',`${route.routeKind==='height'?'ВЫСОТА':'ЦЕЛЬ'} · ${obj.name||route.goal||''}`),zIndexOffset:1100}).addTo(routeMarkers).bindPopup(`<b>${esc(obj.name||route.goal||'Ключевая точка')}</b><br>${obj.altitude||route.maxAlt} м`);
  if(!returnsToStart)L.marker(endLL,{icon:routePin('finish','ФИНИШ'),zIndexOffset:1050}).addTo(routeMarkers).bindPopup(`<b>Финиш</b><br>${esc(route.finish||route.end)}`);
}
async function loadGeometry(){
  try{const g=await fetch(`/api/geometry/${route.id}`).then(r=>r.json());geometryData=g;routeOutline=L.geoJSON(g.geometry,{style:{color:'#fff8e8',weight:11,opacity:.95,lineJoin:'round',lineCap:'round'}}).addTo(map);routeLayer=L.geoJSON(g.geometry,{style:{color:'#ff4f2e',weight:6,opacity:1,lineJoin:'round',lineCap:'round'}}).addTo(map);routeBounds=routeLayer.getBounds();addRouteMarkers(g);fitRoute();const quality=g.verified?'reference track':g.approximate?'approx.':'validated hiking route';document.querySelector('#routeGeometryMeta').textContent=`${quality} · ${g.distanceKm} км · ${g.source}`;loadElevation()}catch(e){document.querySelector('#routeGeometryMeta').textContent='Линия маршрута сейчас недоступна.'}
}
async function loadElevation(){
  try{const d=await fetch(`/api/elevation/${route.id}`).then(r=>r.json());const pts=(d.profile||[]).filter(p=>Number.isFinite(p.elevation)&&Number.isFinite(p.km));if(!pts.length)throw new Error('No elevation');const w=900,h=220,pad=18;const min=Math.min(...pts.map(p=>p.elevation)),max=Math.max(...pts.map(p=>p.elevation));const end=Math.max(...pts.map(p=>p.km))||1;const xy=pts.map(p=>[pad+(p.km/end)*(w-pad*2),h-pad-((p.elevation-min)/(Math.max(1,max-min)))*(h-pad*2)]);const line=xy.map(p=>p.join(',')).join(' ');const area=`${pad},${h-pad} ${line} ${w-pad},${h-pad}`;document.querySelector('#elevation').innerHTML=`<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><polygon points="${area}" fill="rgba(255,79,46,.10)"/><polyline points="${line}" fill="none" stroke="#ff4f2e" stroke-width="3" vector-effect="non-scaling-stroke"/><text x="${pad}" y="18" font-size="11">${Math.round(max)} m</text><text x="${pad}" y="${h-5}" font-size="11">${Math.round(min)} m</text><text x="${w-90}" y="${h-5}" font-size="11">${end.toFixed(1)} km</text></svg>`;document.querySelector('#profileMeta').innerHTML=`<span>track/elevation distance: <b>${d.distanceKm} км</b></span><span>sampled ascent: <b>+${d.ascentM} м</b></span>${d.approximate?'<span>fallback / approximate</span>':''}`}catch{document.querySelector('#elevation').innerHTML='<span class="loading">Профиль высот сейчас недоступен.</span>'}
}
async function loadOfficial(){try{const d=await fetch(`/api/official?route=${route.id}`).then(r=>r.json());const m=d.tpn?.routeMentions||[];document.querySelector('#official').innerHTML=`<strong>${d.tpn?.ok?'TPN получен':'TPN auto-check недоступен'}</strong><p>${esc(d.tpn?.note||'Открой официальный источник вручную.')}</p>${m.map(x=>`<div class="mention"><b>${esc(x.alias)}</b><br>${esc(x.snippet)}</div>`).join('')}<div style="display:flex;gap:7px;flex-wrap:wrap;margin-top:12px"><a class="btn primary" target="_blank" rel="noopener" href="${d.tpn.url}">прочитать TPN ↗</a><a class="btn" target="_blank" rel="noopener" href="${d.avalanche.url}">TOPR avalanche ↗</a></div>`}catch{document.querySelector('#official').innerHTML='Не удалось сделать auto-check. Открой TPN вручную.'}}

let poiData=null,poiKind='food';
function bindPoiTabs(){document.querySelectorAll('.poi-tab').forEach(b=>b.onclick=()=>{document.querySelectorAll('.poi-tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');poiKind=b.dataset.kind;renderPois()})}
async function loadPois(){poiData=await fetch(`/api/pois/${route.id}`).then(r=>r.json());renderPois()}
function renderPois(){if(!poiData)return;const arr=poiData[poiKind]||[];document.querySelector('#poiList').innerHTML=arr.length?arr.map(p=>`<a class="poi" target="_blank" rel="noopener" href="${poiLink(p)}"><b>${esc(p.name)}</b><span>${p.distanceKm} км от старта${p.cuisine?` · ${esc(p.cuisine)}`:''}${p.openingHours?` · ${esc(p.openingHours)}`:''}</span></a>`).join(''):`<span class="loading">В OSM рядом ничего не найдено. Это не значит, что там ничего нет.</span>`;poiLayer.clearLayers();arr.slice(0,10).forEach(p=>L.marker([p.lat,p.lon],{icon:L.divIcon({className:'',html:'<div class="poi-marker"></div>',iconSize:[15,15],iconAnchor:[7,7]})}).addTo(poiLayer).bindPopup(p.name))}
function stayType(t){return ({hotel:'hotel',guest_house:'guest house',hostel:'hostel',apartment:'apartments',chalet:'chalet',motel:'motel'})[t]||t}
async function loadStays(){
  try{const d=await fetch(`/api/stays/${route.id}`).then(r=>r.json());const z=d.zone;const items=d.items||[];document.querySelector('#stayBox').innerHTML=`<div class="stay-route-box"><div class="stay-tag">${esc(z.tag||'BASE')}</div><h3>${esc(z.name)}</h3><p>${esc(z.why)}</p><div class="stay-tradeoff"><b>Компромисс:</b> ${esc(z.tradeoff)}</div><div class="stay-buttons"><a class="btn acid" target="_blank" rel="noopener" href="${z.bookingUrl}">Booking.com ↗</a><a class="btn" target="_blank" rel="noopener" href="https://www.tatrytop.pl/en">TatryTop ↗</a><a class="btn" target="_blank" rel="noopener" href="https://www.zakobooking.pl/">ZAKObooking ↗</a></div></div><div class="stay-list-title">Жильё рядом с этой базой</div><div class="stay-list">${items.length?items.slice(0,6).map(p=>`<div class="stay-item"><div><b>${esc(p.name)}</b><span>${esc(stayType(p.type))} · ${p.distanceKm} км от центра зоны${p.address?` · ${esc(p.address)}`:''}</span></div><a target="_blank" rel="noopener" href="${p.bookingUrl}">Booking ↗</a></div>`).join(''):'<span class="loading">OSM не вернул жильё рядом. Используй поиск по зоне выше.</span>'}</div><div class="source-note">Это не рейтинг отелей и не live-цены Booking. Мы рекомендуем район по логистике; точки жилья берём из OpenStreetMap и открываем внешний поиск Booking.</div>`}catch{document.querySelector('#stayBox').innerHTML=`<p>${esc(route.stay||'Смотри жильё ближе к старту маршрута.')}</p>`}
}
async function loadTrailPois(){try{const d=await fetch(`/api/trail-pois/${route.id}`).then(r=>r.json());trailPois=d.items||[]}catch{trailPois=[]}}

/* ---------------- Live Trail Mode ---------------- */
let trailMap=null,trailRouteLayer=null,trailDoneLayer=null,trailUserMarker=null,trailAccuracyCircle=null,trailWatchId=null;
let trailLengths=[],trailTotalM=0,trailHeading=null,trailState={lastProgress:null,reachedObjective:false,returning:false,lastStatus:null,demoIndex:0};
function bindTrailLaunch(){document.querySelector('#openTrailMode').onclick=openTrailMode}
function trailOverlayHtml(){
  const obj=route.objective||{name:route.goal||route.end,altitude:route.maxAlt};
  return `<div class="trail-overlay" id="trailOverlay" aria-hidden="true"><div class="trail-topbar"><button id="closeTrailMode">← EXIT</button><div><small>LIVE TRAIL MODE</small><b>${esc(route.name)}</b></div><div class="trail-top-status"><span id="trailGpsStatus">GPS OFF</span><span id="trailCompassStatus">COMPASS OFF</span></div></div>
    <div class="trail-alert idle" id="trailAlert"><b>READY</b><span>Запусти GPS или используй DEMO для проверки интерфейса.</span></div>
    <div class="trail-dashboard"><div><small>Прогресс</small><b id="trailProgress">—</b><span id="trailRemaining">— км осталось</span></div><div><small>До цели</small><b id="trailObjective">—</b><span>${esc(obj.name)} · ${obj.altitude} м</span></div><div><small>Ближайший POI</small><b id="trailPoiDistance">—</b><span id="trailPoiName">загружаю точки…</span></div><div><small>GPS</small><b id="trailAccuracy">—</b><span id="trailHeading">heading —</span></div></div>
    <div class="trail-map-wrap"><div id="trailMap" class="trail-map"></div><div class="trail-map-key"><span><i class="key-user"></i>ты</span><span><i class="key-done"></i>пройдено</span><span><i class="key-route"></i>трек</span></div></div>
    <div class="trail-actions"><button class="trail-action primary" id="startGps">START GPS</button><button class="trail-action" id="startCompass">COMPASS</button><button class="trail-action" id="recenterTrail">RECENTER</button><button class="trail-action demo" id="demoTrail">DEMO +</button></div>
    <div class="trail-bottom"><div class="trail-nav-group"><span>GET TO START</span><a target="_blank" rel="noopener" href="${googleDirections(route.startLat,route.startLon,'walking')}">Google ↗</a><a target="_blank" rel="noopener" href="${appleDirections(route.startLat,route.startLon,'w')}">Apple ↗</a></div><div class="trail-nav-group"><span>GET BACK TO ZAKOPANE</span><a target="_blank" rel="noopener" href="${googleDirections(ZAKOPANE.lat,ZAKOPANE.lon,'transit')}">Google ↗</a><a target="_blank" rel="noopener" href="${appleDirections(ZAKOPANE.lat,ZAKOPANE.lon,'r')}">Apple ↗</a></div><div class="trail-caveat">Не turn-by-turn гарантия. Следуй официальной маркировке на местности. GPS в горах может ошибаться; интерфейс всегда показывает reported accuracy.</div></div>
  </div>`;
}
function openTrailMode(){
  if(!document.querySelector('#trailOverlay'))document.body.insertAdjacentHTML('beforeend',trailOverlayHtml());
  const overlay=document.querySelector('#trailOverlay');overlay.classList.add('open');overlay.setAttribute('aria-hidden','false');document.body.classList.add('trail-open');
  document.querySelector('#closeTrailMode').onclick=closeTrailMode;
  document.querySelector('#startGps').onclick=startGps;
  document.querySelector('#startCompass').onclick=startCompass;
  document.querySelector('#recenterTrail').onclick=()=>{if(trailUserMarker)trailMap.setView(trailUserMarker.getLatLng(),17);else if(routeBounds)trailMap.fitBounds(routeBounds.pad(.08),{maxZoom:16})};
  document.querySelector('#demoTrail').onclick=demoTrail;
  requestAnimationFrame(initTrailMap);
}
function closeTrailMode(){document.querySelector('#trailOverlay')?.classList.remove('open');document.querySelector('#trailOverlay')?.setAttribute('aria-hidden','true');document.body.classList.remove('trail-open')}
function initTrailMap(){
  if(trailMap){trailMap.invalidateSize();return}
  trailMap=L.map('trailMap',{zoomControl:false,preferCanvas:true}).setView([route.startLat,route.startLon],15);
  const detail=L.tileLayer(DETAIL_URL,{maxZoom:19,attribution:DETAIL_ATTR});
  const topo=L.tileLayer(TOPO_URL,{maxZoom:17,attribution:TOPO_ATTR});
  detail.addTo(trailMap);L.control.layers({'DETAIL · OSM':detail,'TOPO':topo},null,{position:'topright',collapsed:true}).addTo(trailMap);L.control.zoom({position:'bottomright'}).addTo(trailMap);L.control.scale({imperial:false,position:'bottomleft'}).addTo(trailMap);
  if(geometryData?.geometry){drawTrailGeometry()}else{const timer=setInterval(()=>{if(geometryData?.geometry){clearInterval(timer);drawTrailGeometry()}},250)}
}
function drawTrailGeometry(){
  const coords=geometryData.geometry.coordinates;buildTrailLengths(coords);
  L.geoJSON(geometryData.geometry,{style:{color:'#fff7df',weight:12,opacity:.96,lineCap:'round',lineJoin:'round'}}).addTo(trailMap);
  trailRouteLayer=L.geoJSON(geometryData.geometry,{style:{color:'#ff4f2e',weight:6,opacity:1,lineCap:'round',lineJoin:'round'}}).addTo(trailMap);
  const first=coords[0],last=coords[coords.length-1];L.marker([first[1],first[0]],{icon:routePin('start','START')}).addTo(trailMap);
  L.marker([route.summitLat,route.summitLon],{icon:routePin('goal','OBJECTIVE')}).addTo(trailMap);
  if(haversineM({lat:first[1],lon:first[0]},{lat:last[1],lon:last[0]})>180)L.marker([last[1],last[0]],{icon:routePin('finish','FINISH')}).addTo(trailMap);
  trailPois.slice(0,18).forEach(p=>L.marker([p.lat,p.lon],{icon:L.divIcon({className:'trail-poi-icon-wrap',html:`<div class="trail-poi-icon ${p.kind}"><i></i><span>${esc(p.name)}</span></div>`,iconSize:[150,26],iconAnchor:[8,13]})}).addTo(trailMap));
  trailMap.fitBounds(trailRouteLayer.getBounds().pad(.08),{maxZoom:16});
}
function buildTrailLengths(coords){trailLengths=[0];trailTotalM=0;for(let i=1;i<coords.length;i++){trailTotalM+=haversineM({lat:coords[i-1][1],lon:coords[i-1][0]},{lat:coords[i][1],lon:coords[i][0]});trailLengths.push(trailTotalM)}}
function projectOnSegment(p,a,b){
  const lat0=(p.lat+a.lat+b.lat)/3*Math.PI/180;const sx=111320*Math.cos(lat0),sy=110540;
  const ax=(a.lon-p.lon)*sx,ay=(a.lat-p.lat)*sy,bx=(b.lon-p.lon)*sx,by=(b.lat-p.lat)*sy;const dx=bx-ax,dy=by-ay;const den=dx*dx+dy*dy;let t=den?-(ax*dx+ay*dy)/den:0;t=Math.max(0,Math.min(1,t));const x=ax+t*dx,y=ay+t*dy;const lon=p.lon+x/sx,lat=p.lat+y/sy;return {t,lat,lon,dist:Math.hypot(x,y)}}
function nearestRoutePoint(pos){
  const coords=geometryData?.geometry?.coordinates||[];if(coords.length<2)return null;const candidates=[];
  for(let i=0;i<coords.length-1;i++){const a={lat:coords[i][1],lon:coords[i][0]},b={lat:coords[i+1][1],lon:coords[i+1][0]},pr=projectOnSegment(pos,a,b),seg=trailLengths[i+1]-trailLengths[i];candidates.push({...pr,i,progress:trailLengths[i]+seg*pr.t})}
  candidates.sort((a,b)=>a.dist-b.dist);const min=candidates[0].dist;const near=candidates.filter(c=>c.dist<=min+10);
  if(route.mode==='out_back'){
    if(trailState.returning)return near.sort((a,b)=>b.progress-a.progress)[0];
    if(Number.isFinite(trailState.lastProgress))return near.sort((a,b)=>Math.abs(a.progress-trailState.lastProgress)-Math.abs(b.progress-trailState.lastProgress))[0];
    return near.sort((a,b)=>a.progress-b.progress)[0];
  }
  return candidates[0];
}
function pointAtProgress(m){const c=geometryData.geometry.coordinates;if(m<=0)return {lat:c[0][1],lon:c[0][0]};if(m>=trailTotalM){const p=c[c.length-1];return {lat:p[1],lon:p[0]}};let i=1;while(i<trailLengths.length&&trailLengths[i]<m)i++;const prev=trailLengths[i-1],seg=trailLengths[i]-prev,t=(m-prev)/Math.max(1,seg),a=c[i-1],b=c[i];return {lat:a[1]+(b[1]-a[1])*t,lon:a[0]+(b[0]-a[0])*t}}
function trailUserIcon(heading=0){return L.divIcon({className:'trail-user-icon-wrap',html:`<div class="trail-user-icon"><div class="trail-user-arrow" style="transform:rotate(${heading}deg)"></div><i></i></div>`,iconSize:[34,34],iconAnchor:[17,17]})}
function setTrailAlert(level,title,text){const el=document.querySelector('#trailAlert');if(!el)return;el.className=`trail-alert ${level}`;el.innerHTML=`<b>${esc(title)}</b><span>${esc(text)}</span>`;if(level==='danger'&&trailState.lastStatus!=='danger'&&navigator.vibrate)navigator.vibrate([180,100,180]);trailState.lastStatus=level}
function nearestTrailPoi(pos){
  const obj={name:(route.objective?.name||route.goal||'Цель'),kind:'objective',lat:route.summitLat,lon:route.summitLon};
  const finishCoords=geometryData?.geometry?.coordinates?.at(-1);const finish=finishCoords?{name:route.finish||'Финиш',kind:'finish',lat:finishCoords[1],lon:finishCoords[0]}:null;
  const all=[obj,...trailPois,...(finish?[finish]:[])];return all.map(p=>({...p,distanceM:haversineM(pos,p)})).sort((a,b)=>a.distanceM-b.distanceM)[0];
}
function updateDoneLine(progress){if(!trailMap||!geometryData)return;const coords=geometryData.geometry.coordinates;let done=[];for(let i=0;i<coords.length;i++){if(trailLengths[i]<=progress)done.push(coords[i]);else break}const last=pointAtProgress(progress);done.push([last.lon,last.lat]);const gj={type:'LineString',coordinates:done};if(trailDoneLayer)trailDoneLayer.clearLayers();else trailDoneLayer=L.geoJSON(gj,{style:{color:'#111',weight:6,opacity:.95,lineCap:'round',lineJoin:'round'}}).addTo(trailMap);trailDoneLayer.clearLayers();trailDoneLayer.addData(gj)}
function updateTrailLocation(pos,{accuracy=0,demo=false}={}){
  if(!geometryData?.geometry||!trailMap)return;const nearest=nearestRoutePoint(pos);if(!nearest)return;
  const objectiveDist=haversineM(pos,{lat:route.summitLat,lon:route.summitLon});
  if(route.mode==='out_back'){
    if(objectiveDist<120)trailState.reachedObjective=true;
    if(trailState.reachedObjective&&objectiveDist>180)trailState.returning=true;
    if(trailState.returning){const alt=nearestRoutePoint(pos);if(alt)Object.assign(nearest,alt)}
  }
  trailState.lastProgress=nearest.progress;const pct=Math.max(0,Math.min(100,nearest.progress/Math.max(1,trailTotalM)*100)),remaining=Math.max(0,trailTotalM-nearest.progress);const poi=nearestTrailPoi(pos);
  document.querySelector('#trailProgress').textContent=`${Math.round(pct)}%`;document.querySelector('#trailRemaining').textContent=`${(remaining/1000).toFixed(1)} км осталось`;
  document.querySelector('#trailObjective').textContent=objectiveDist<1000?`${Math.round(objectiveDist)} м`:`${(objectiveDist/1000).toFixed(1)} км`;
  document.querySelector('#trailPoiDistance').textContent=poi?(poi.distanceM<1000?`${Math.round(poi.distanceM)} м`:`${(poi.distanceM/1000).toFixed(1)} км`):'—';document.querySelector('#trailPoiName').textContent=poi?poi.name:'нет POI';
  document.querySelector('#trailAccuracy').textContent=demo?'DEMO':accuracy?`±${Math.round(accuracy)} м`:'—';
  const ll=[pos.lat,pos.lon];if(!trailUserMarker)trailUserMarker=L.marker(ll,{icon:trailUserIcon(trailHeading||0),zIndexOffset:2000}).addTo(trailMap);else{trailUserMarker.setLatLng(ll);trailUserMarker.setIcon(trailUserIcon(trailHeading||0))}
  if(accuracy){if(!trailAccuracyCircle)trailAccuracyCircle=L.circle(ll,{radius:accuracy,color:'#2979ff',weight:1,fillColor:'#2979ff',fillOpacity:.08}).addTo(trailMap);else{trailAccuracyCircle.setLatLng(ll);trailAccuracyCircle.setRadius(accuracy)}}
  updateDoneLine(nearest.progress);
  if(!demo&&accuracy>90)setTrailAlert('caution','GPS WEAK',`Точность около ±${Math.round(accuracy)} м. Не делай вывод об отклонении по такой позиции.`);
  else{const warn=Math.max(40,accuracy*1.35),danger=Math.max(90,accuracy*1.8);if(nearest.dist>danger)setTrailAlert('danger','OFF ROUTE',`До трека примерно ${Math.round(nearest.dist)} м. Остановись и сверяйся с официальной маркировкой.`);else if(nearest.dist>warn)setTrailAlert('caution','CHECK ROUTE',`Ты примерно в ${Math.round(nearest.dist)} м от линии. Проверь развилку и маркировку.`);else setTrailAlert('good',demo?'DEMO · ON ROUTE':'ON ROUTE',`До линии маршрута около ${Math.round(nearest.dist)} м${trailState.returning?' · возвращение':''}.`)}
}
function startGps(){
  const status=document.querySelector('#trailGpsStatus');if(!window.isSecureContext){status.textContent='HTTPS NEEDED';setTrailAlert('caution','GPS LOCKED','На iPhone локальная HTTP-ссылка по Wi‑Fi не является secure context. Для настоящего GPS задеплой сайт на HTTPS; пока используй DEMO.');return}
  if(!navigator.geolocation){status.textContent='NO GPS';setTrailAlert('danger','GPS UNAVAILABLE','Браузер не предоставляет Geolocation API.');return}
  if(trailWatchId!==null){navigator.geolocation.clearWatch(trailWatchId);trailWatchId=null}
  status.textContent='GPS STARTING';trailWatchId=navigator.geolocation.watchPosition(p=>{status.textContent='GPS LIVE';const c=p.coords;updateTrailLocation({lat:c.latitude,lon:c.longitude},{accuracy:c.accuracy||0});if(trailUserMarker&&!trailState.didFirstCenter){trailMap.setView(trailUserMarker.getLatLng(),17);trailState.didFirstCenter=true}},e=>{status.textContent='GPS ERROR';setTrailAlert('danger','GPS ERROR',e.message||'Не удалось получить геопозицию.')},{enableHighAccuracy:true,maximumAge:2000,timeout:15000})
}
function orientationHandler(e){let h=null;if(Number.isFinite(e.webkitCompassHeading))h=e.webkitCompassHeading;else if(Number.isFinite(e.alpha))h=(360-e.alpha)%360;if(h===null)return;trailHeading=h;const el=document.querySelector('#trailHeading');if(el)el.textContent=`heading ${Math.round(h)}°`;const st=document.querySelector('#trailCompassStatus');if(st)st.textContent=`${Math.round(h)}°`;if(trailUserMarker)trailUserMarker.setIcon(trailUserIcon(h))}
async function startCompass(){
  const st=document.querySelector('#trailCompassStatus');if(!window.isSecureContext){st.textContent='HTTPS NEEDED';setTrailAlert('caution','COMPASS LOCKED','Датчики ориентации требуют secure context. После HTTPS-публикации кнопка запросит разрешение на iPhone.');return}
  try{if(typeof DeviceOrientationEvent!=='undefined'&&typeof DeviceOrientationEvent.requestPermission==='function'){const r=await DeviceOrientationEvent.requestPermission();if(r!=='granted')throw new Error('Разрешение на компас не выдано.')}window.removeEventListener('deviceorientation',orientationHandler);window.addEventListener('deviceorientation',orientationHandler,true);st.textContent='COMPASS LIVE'}catch(e){st.textContent='COMPASS ERROR';setTrailAlert('caution','COMPASS ERROR',e.message||'Не удалось включить компас.')}
}
function demoTrail(){
  if(!geometryData?.geometry)return;const seq=[.05,.22,.44,.52,.68,.88];const frac=seq[trailState.demoIndex%seq.length];trailState.demoIndex++;let p=pointAtProgress(trailTotalM*frac);if(trailState.demoIndex%7===0)p={lat:p.lat+.0011,lon:p.lon};updateTrailLocation(p,{accuracy:8,demo:true});trailMap.setView([p.lat,p.lon],17)
}

async function boot(){const data=await fetch('/api/routes').then(r=>r.json());route=data.routes.find(r=>r.id===id);if(!route){document.querySelector('#routeApp').innerHTML='<section class="route-hero"><h1>Маршрут не найден</h1></section>';return}renderBase();await Promise.allSettled([loadOfficial(),loadPois(),loadStays(),loadTrailPois()])}
boot().catch(err=>{console.error(err);document.querySelector('#routeApp').innerHTML='<section class="route-hero"><h1>Не удалось загрузить маршрут</h1><p>Обнови страницу. Если ошибка повторяется — map library не загрузилась.</p></section>';});
