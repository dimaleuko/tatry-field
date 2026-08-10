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
let fieldMapLeaflet=null,fieldRouteGroup=null,fieldMapBounds=null,fieldStopMarkers=[];
let trailPois=[];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const savedStore=window.TatrySavedRoutes;
const FIELD_MAPS={
  giewont:{
    issue:'FIELD MAP 01 / GIEWONT BETA',
    title:'Топокарта, которая объясняет маршрут.',
    intro:'Рельеф и соседние тропы остаются на месте. Поверх них — восемь точек, где меняется нагрузка, нужно принять решение или особенно внимательно свериться с маркировкой.',
    stops:[
      {ratio:0,kicker:'00 / START',name:'Kuźnice',tag:'СТАРТ',meta:'≈ 1025 м · 0.0 км',level:'info',decision:'Держись синей маркировки в сторону Kalatówki и Hala Kondratowa.',body:'Каменная дорога начинается почти сразу. Это последний удобный момент проверить воду, офлайн-карту и прогноз до ухода в лес.'},
      {ratio:.14,kicker:'01 / JUNCTION',name:'Kalatówki',tag:'СЛЕДИ ЗА СИНИМ',meta:'≈ 1200 м · 1.6 км',level:'nav',decision:'У развилок и построек не иди за самым большим потоком автоматически: сверяй синюю маркировку на Hala Kondratowa.',body:'На широкой дороге легко расслабиться, но здесь появляются боковые варианты. После дождя камни и короткий скальный порог могут быть скользкими.'},
      {ratio:.291,kicker:'02 / SHELTER',name:'Hala Kondratowa',tag:'РЕШЕНИЕ + ПАУЗА',meta:'1335 м · 3.4 км',level:'nav',decision:'Зелёный уходит к Przełęcz pod Kopą Kondracką. На Giewont продолжай по синему к Kondracka Przełęcz.',body:'Приют — хорошая контрольная точка перед более серьёзным набором. Проверь погоду и силы: дальше быстро становится круче.',photoIndex:2},
      {ratio:.335,kicker:'03 / EFFORT',name:'Piekiełko',tag:'ЗДЕСЬ НАЧИНАЕТСЯ КРУТО',meta:'≈ 1500 м · 3.9 км',level:'effort',decision:'Маршрут по-прежнему синий; в тумане не срезай широкие петли подъёма.',body:'После халы начинается устойчивый крутой набор по открытому склону. Темп падает, ветер ощущается сильнее, а назад до укрытия уже не две минуты.',photoIndex:0},
      {ratio:.443,kicker:'04 / PASS',name:'Kondracka Przełęcz',tag:'КЛЮЧЕВАЯ РАЗВИЛКА',meta:'1725 м · 5.1 км',level:'nav',decision:'Жёлтый ведёт к Kopa Kondracka. На Giewont поверни вправо и оставайся на синем.',body:'Самая важная навигационная точка подъёма: в облаке нужное направление не всегда читается по рельефу. Здесь особенно полезна офлайн-карта.',photoIndex:3},
      {ratio:.469,kicker:'05 / PASS',name:'Wyżnia Kondracka Przełęcz',tag:'ПОСЛЕДНЕЕ РЕШЕНИЕ',meta:'1765 м · 5.4 км',level:'nav',decision:'Красный уходит в Dolina Strążyska. К вершине продолжай по синему; выше начинается односторонняя петля.',body:'До вершины недалеко, но характер маршрута резко меняется. Если погода портится, это разумная точка не входить в скальный финал.'},
      {ratio:.482,kicker:'06 / TECHNICAL',name:'Цепи и скальные ступени',tag:'РУКИ НА СКАЛУ',meta:'≈ 1840 м · 5.6 км',level:'danger',decision:'Следуй одностороннему потоку и разметке. Не разворачивайся против движения на цепях.',body:'Полированный известняк, цепи и скобы требуют свободных рук и спокойного темпа. В грозу этот участок и металлические элементы особенно опасны.',photoIndex:4},
      {ratio:.497,kicker:'07 / SUMMIT',name:'Giewont',tag:'1894 М / КРЕСТ',meta:'1894 м · 5.75 км',level:'summit',decision:'Спуск начинается по другой стороне односторонней петли, затем возвращается к Wyżnia Kondracka Przełęcz.',body:'На вершине мало пространства и много людей. Не задерживай поток ради фото и не оставайся у металлического креста при риске грозы.',photoIndex:5}
    ],
    terrain:[
      {from:0,to:.291,kind:'approach',label:'подход'},
      {from:.291,to:.443,kind:'effort',label:'крутой набор'},
      {from:.443,to:.469,kind:'navigation',label:'развилки'},
      {from:.469,to:.50,kind:'technical',label:'скалы / цепи'}
    ]
  }
};

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
function renderRouteHighlights(photos=[]){
  if(!photos.length)return '';
  return `<section class="route-section route-highlights-section"><div class="route-highlights-head"><div class="eyebrow">ROUTE HIGHLIGHTS / КАК ЭТО ВЫГЛЯДИТ</div><h2>Две сцены, ради которых идти.</h2><p>Не абстрактные Татры, а узнаваемые точки именно этого маршрута.</p></div><div class="route-highlights-grid">${photos.slice(0,2).map((photo,i)=>`<figure class="route-highlight"><div class="route-highlight-image"><img loading="eager" decoding="async" referrerpolicy="no-referrer" src="${esc(photo.src)}" alt="${esc(photo.alt)}"><span>${String(i+1).padStart(2,'0')}</span></div><figcaption><h3>${esc(photo.title)}</h3><p>${esc(photo.caption)}</p><div class="photo-credit">Фото: <a target="_blank" rel="noopener noreferrer" href="${esc(photo.sourceUrl)}">${esc(photo.author)} ↗</a> · <a target="_blank" rel="noopener noreferrer" href="${esc(photo.licenseUrl)}">${esc(photo.license)}</a></div></figcaption></figure>`).join('')}</div><div class="source-note">Фотографии показывают характерные точки маршрута, но сезон, погода и состояние тропы могут сильно отличаться. Источник, автор и лицензия указаны под каждым кадром.</div></section>`;
}
function renderFieldMapShell(){
  const config=FIELD_MAPS[route.id];
  if(!config)return '';
  return `<section class="field-map" id="fieldMap" role="tabpanel" hidden aria-labelledby="fieldMapTitle">
    <header class="field-map-header"><div><span>${esc(config.issue)}</span><h3 id="fieldMapTitle">${esc(config.title)}</h3></div><p>${esc(config.intro)}</p></header>
    <div class="field-map-layout"><div class="field-terrain-map" id="fieldTerrainMap" aria-label="Топографическая карта маршрута на Giewont с интерактивными этапами"></div><aside class="field-map-readout" id="fieldMapReadout" aria-live="polite"></aside></div>
    <footer class="field-map-footer"><div class="field-map-key"><span class="approach">подход</span><span class="effort">крутой набор</span><span class="navigation">точки решения</span><span class="technical">скалы / цепи</span></div><p>Цветная линия показывает подъём; тонкая линия — полный трек туда и обратно. Точки привязаны к треку приблизительно и не заменяют маркировку, офлайн-карту или актуальные сообщения TPN/TOPR. Проверено по описаниям <a target="_blank" rel="noopener noreferrer" href="https://tpn.gov.pl/szlaki-turystyczne/kuznice-polana-kalatowki-polana-kondratowa">TPN</a> и <a target="_blank" rel="noopener noreferrer" href="https://www.zakopane.pl/strefa-turystyczna/turystyka/wycieczki-gorskie-latem/szlaki-lato/hala-kondratowa-giewont-dolina-strazyska">Zakopane.pl</a>.</p></footer>
    <div class="field-photo-overlay" id="fieldPhotoOverlay" hidden role="dialog" aria-modal="true" aria-labelledby="fieldPhotoTitle"><button type="button" class="field-photo-close" data-field-photo-close aria-label="Закрыть фотографию">×</button><div class="field-photo-dialog"><img id="fieldPhotoImage" alt=""><div><span>ROUTE PHOTO / МЕСТО НА ТРЕКЕ</span><h4 id="fieldPhotoTitle"></h4><p id="fieldPhotoCaption"></p><div id="fieldPhotoCredit" class="photo-credit"></div></div></div></div>
  </section>`;
}
function fieldRouteModel(coords){
  const valid=(coords||[]).filter(point=>Array.isArray(point)&&Number.isFinite(point[0])&&Number.isFinite(point[1]));
  if(valid.length<2)return null;
  const lengths=[0];
  for(let i=1;i<valid.length;i++)lengths.push(lengths[i-1]+haversineM({lon:valid[i-1][0],lat:valid[i-1][1]},{lon:valid[i][0],lat:valid[i][1]}));
  return {coords:valid,lengths,total:lengths.at(-1)||1};
}
function fieldCoordinateAt(model,ratio){
  const target=Math.max(0,Math.min(1,ratio))*model.total;
  let index=model.lengths.findIndex(length=>length>=target);
  if(index<=0)return model.coords[0];
  if(index<0)return model.coords.at(-1);
  const before=model.lengths[index-1],after=model.lengths[index];
  const mix=(target-before)/Math.max(.0001,after-before);
  const a=model.coords[index-1],b=model.coords[index];
  return [a[0]+(b[0]-a[0])*mix,a[1]+(b[1]-a[1])*mix];
}
function fieldSegmentCoordinates(model,from,to){
  const start=fieldCoordinateAt(model,from),end=fieldCoordinateAt(model,to);
  const min=from*model.total,max=to*model.total;
  const middle=model.coords.filter((_,index)=>model.lengths[index]>min&&model.lengths[index]<max);
  return [start,...middle,end];
}
function fieldLatLngs(coords){return coords.map(([lon,lat])=>[lat,lon])}
function fieldStopIcon(stop,index){
  return L.divIcon({className:'field-marker-wrap',html:`<div class="field-map-marker ${esc(stop.level)}${index<2?' label-left':''}" data-field-marker="${index}"><b>${String(index+1).padStart(2,'0')}</b><span>${esc(stop.tag)}</span></div>`,iconSize:[38,38],iconAnchor:[19,19]});
}
function fieldPhotoMarkup(photo,index){
  if(!photo)return '';
  return `<div class="field-photo-panel"><button type="button" class="field-photo-open" data-field-photo-open="${index}" aria-label="Открыть фотографию: ${esc(photo.title)}"><img loading="lazy" decoding="async" referrerpolicy="no-referrer" src="${esc(photo.src)}" alt="${esc(photo.alt)}"><span>ОТКРЫТЬ ФОТО ↗</span></button><div><b>${esc(photo.title)}</b><p>${esc(photo.caption)}</p><small>Фото: <a target="_blank" rel="noopener noreferrer" href="${esc(photo.sourceUrl)}">${esc(photo.author)} ↗</a> · <a target="_blank" rel="noopener noreferrer" href="${esc(photo.licenseUrl)}">${esc(photo.license)}</a></small></div></div>`;
}
function fieldMapReadout(index,{focusMap=true}={}){
  const config=FIELD_MAPS[route.id],stop=config?.stops[index];
  const readout=document.querySelector('#fieldMapReadout');
  if(!stop||!readout)return;
  readout.dataset.active=String(index);
  const photo=Number.isInteger(stop.photoIndex)?route.photos?.[stop.photoIndex]:null;
  readout.innerHTML=`<div class="field-readout-head"><span class="field-level ${esc(stop.level)}">${esc(stop.tag)}</span><small>${esc(stop.kicker)}</small><h4>${esc(stop.name)}</h4><b>${esc(stop.meta)}</b></div><div class="field-decision"><small>${stop.level==='danger'?'ТЕХНИЧЕСКИЙ УЧАСТОК':'СМОТРИ НА МАРКИРОВКУ'}</small><strong>${esc(stop.decision)}</strong></div><p class="field-readout-body">${esc(stop.body)}</p>${fieldPhotoMarkup(photo,stop.photoIndex)}<div class="field-map-stepper"><button type="button" data-field-step="-1" aria-label="Предыдущий этап">←</button><b>${String(index+1).padStart(2,'0')} / ${String(config.stops.length).padStart(2,'0')}</b><button type="button" data-field-step="1" aria-label="Следующий этап">→</button></div>`;
  fieldStopMarkers.forEach((marker,markerIndex)=>marker.getElement()?.querySelector('[data-field-marker]')?.classList.toggle('active',markerIndex===index));
  const marker=fieldStopMarkers[index];
  if(focusMap&&marker&&fieldMapLeaflet&&!document.querySelector('#fieldMap')?.hidden)fieldMapLeaflet.panTo(marker.getLatLng(),{animate:true,duration:.35});
}
function renderFieldMap(coords){
  const config=FIELD_MAPS[route.id],container=document.querySelector('#fieldTerrainMap'),model=fieldRouteModel(coords);
  if(!config||!container||!model)return;
  fieldMapLeaflet?.remove();fieldStopMarkers=[];
  fieldMapLeaflet=L.map(container,{zoomControl:false,preferCanvas:true,scrollWheelZoom:false});
  L.control.zoom({position:'bottomright'}).addTo(fieldMapLeaflet);L.control.scale({imperial:false,position:'bottomleft'}).addTo(fieldMapLeaflet);
  L.tileLayer(TOPO_URL,{maxZoom:17,attribution:TOPO_ATTR}).addTo(fieldMapLeaflet);
  fieldRouteGroup=L.layerGroup().addTo(fieldMapLeaflet);
  const fullLatLngs=fieldLatLngs(model.coords);
  L.polyline(fullLatLngs,{color:'#f7f0df',weight:11,opacity:.92,lineJoin:'round',lineCap:'round',interactive:false}).addTo(fieldRouteGroup);
  L.polyline(fullLatLngs,{color:'#1b211d',weight:4,opacity:.72,dashArray:'4 8',lineJoin:'round',lineCap:'round',interactive:false}).addTo(fieldRouteGroup);
  const colors={approach:'#b7ff35',effort:'#ffd166',navigation:'#f8f2e7',technical:'#ff5b43'};
  config.terrain.forEach(segment=>L.polyline(fieldLatLngs(fieldSegmentCoordinates(model,segment.from,segment.to)),{color:colors[segment.kind],weight:7,opacity:1,lineJoin:'round',lineCap:'round',interactive:false,className:`field-route-${segment.kind}`}).addTo(fieldRouteGroup));
  config.stops.forEach((stop,index)=>{const [lon,lat]=fieldCoordinateAt(model,stop.ratio);const marker=L.marker([lat,lon],{icon:fieldStopIcon(stop,index),zIndexOffset:1200+index,title:`${index+1}. ${stop.name}`,alt:`Этап ${index+1}: ${stop.name}`}).addTo(fieldRouteGroup);marker.on('click',()=>fieldMapReadout(index));fieldStopMarkers.push(marker)});
  fieldMapBounds=L.latLngBounds(fullLatLngs);fieldMapLeaflet.setView(fieldMapBounds.getCenter(),12);
  fieldMapReadout(0,{focusMap:false});
}
function setMapMode(mode){
  const field=mode==='field'&&Boolean(FIELD_MAPS[route.id]);
  document.querySelector('#topoMapPanel')?.toggleAttribute('hidden',field);
  document.querySelector('#fieldMap')?.toggleAttribute('hidden',!field);
  document.querySelector('.map-view-toggle')?.toggleAttribute('hidden',field);
  document.querySelectorAll('[data-map-mode]').forEach(button=>{const active=button.dataset.mapMode===(field?'field':'topo');button.classList.toggle('active',active);button.setAttribute('aria-selected',String(active))});
  const note=document.querySelector('#mapSourceNote');
  if(note)note.textContent=field?'Field Map сохраняет реальную топографию и добавляет приблизительные точки решений, смены нагрузки и фото. Для движения всё равно нужны официальная маркировка, офлайн-карта и актуальные сообщения TPN/TOPR.':'Планировочная карта показывает контекст. Линия взята из маршрутного источника и проверена по длине, границам региона и разрывам. Это всё равно не официальный GPX TPN: на местности следуй маркировке и актуальным сообщениям TPN/TOPR.';
  if(field)setTimeout(()=>{fieldMapLeaflet?.invalidateSize();if(fieldMapBounds?.isValid())fieldMapLeaflet.fitBounds(fieldMapBounds.pad(.12),{animate:false,maxZoom:14});fieldMapReadout(Number(document.querySelector('#fieldMapReadout')?.dataset.active||0),{focusMap:false})},0);
  else setTimeout(()=>{map?.invalidateSize();document.querySelector('[data-map-view].active')?.dataset.mapView==='context'?fitContext():fitRoute()},0);
}
function openFieldPhoto(index){
  const photo=route.photos?.[index],overlay=document.querySelector('#fieldPhotoOverlay');
  if(!photo||!overlay)return;
  document.querySelector('#fieldPhotoImage').src=photo.src;document.querySelector('#fieldPhotoImage').alt=photo.alt;document.querySelector('#fieldPhotoTitle').textContent=photo.title;document.querySelector('#fieldPhotoCaption').textContent=photo.caption;
  document.querySelector('#fieldPhotoCredit').innerHTML=`Фото: <a target="_blank" rel="noopener noreferrer" href="${esc(photo.sourceUrl)}">${esc(photo.author)} ↗</a> · <a target="_blank" rel="noopener noreferrer" href="${esc(photo.licenseUrl)}">${esc(photo.license)}</a>`;
  overlay.hidden=false;document.body.classList.add('field-photo-open');overlay.querySelector('[data-field-photo-close]')?.focus();
}
function closeFieldPhoto(){const overlay=document.querySelector('#fieldPhotoOverlay');if(!overlay||overlay.hidden)return;overlay.hidden=true;document.body.classList.remove('field-photo-open');document.querySelector('[data-field-photo-open]')?.focus()}
function bindFieldMap(){
  document.querySelectorAll('[data-map-mode]').forEach(button=>button.addEventListener('click',()=>setMapMode(button.dataset.mapMode)));
  const field=document.querySelector('#fieldMap');
  field?.addEventListener('click',event=>{
    const photo=event.target.closest('[data-field-photo-open]');
    if(photo){openFieldPhoto(Number(photo.dataset.fieldPhotoOpen));return}
    if(event.target.closest('[data-field-photo-close]')||event.target.id==='fieldPhotoOverlay'){closeFieldPhoto();return}
    const step=event.target.closest('[data-field-step]');
    if(!step)return;
    const count=FIELD_MAPS[route.id].stops.length,current=Number(document.querySelector('#fieldMapReadout')?.dataset.active||0);
    fieldMapReadout((current+Number(step.dataset.fieldStep)+count)%count);
  });
  document.addEventListener('keydown',event=>{if(event.key==='Escape')closeFieldPhoto()});
}

function renderBase(){
  const straight=haversineKm(ZAKOPANE,{lat:route.startLat,lon:route.startLon});
  const obj=route.objective||{name:route.goal||route.end,altitude:route.maxAlt,type:'цель'};
  const ret=route.returnToZakopane||{};
  const exp=route.experience||{};
  const isSaved=savedStore?.has(route.id)||false;
  const savedCount=savedStore?.get().length||0;
  document.title=`${route.name} — TATRY / FIELD`;
  document.querySelector('#routeApp').innerHTML=`
  <section class="route-hero"><a class="back" href="/">← все маршруты</a><h1>${esc(route.name)}</h1>
    <div class="route-deck"><p>${esc(route.why)}</p><div class="difficulty-box"><small>сложность ${route.diff}/5</small><b>${LEVELS[route.diff]}</b></div></div>
    <div class="route-save-bar"><button type="button" id="routeSaveButton" class="route-detail-save${isSaved?' saved':''}" aria-pressed="${isSaved}">${isSaved?'СОХРАНЕНО ✓':'СОХРАНИТЬ МАРШРУТ +'}</button><a id="routeCompareLink" class="route-detail-compare${savedCount<2?' disabled':''}" href="/?compare=1#routes">СРАВНИТЬ <span>${savedCount}</span> →</a><span id="routeSaveStatus" aria-live="polite">${savedCount?`Сохранено: ${savedCount} / ${savedStore.max}`:'Можно сохранить до трёх маршрутов'}</span></div>
    <div class="identity-strip"><div><small>Формат</small><b>${kindLabel(route)}</b></div><div><small>Цель</small><b>${esc(obj.name)}</b><span>${obj.altitude} м · ${esc(obj.type)}</span></div><div><small>Обратно в Zakopane</small><b>${ret.score||'—'}/5 · ${esc(ret.label||'')}</b><span>${esc(ret.typicalTime||'')}</span></div></div>
  </section>
  <div class="route-body"><div class="route-main">
    <section class="route-section"><div class="stat-grid"><div class="stat"><small>Время</small><b>${route.hours} ч</b></div><div class="stat"><small>Км</small><b>${route.km}</b></div><div class="stat"><small>Набор</small><b>+${route.ascent} м</b></div><div class="stat"><small>Max</small><b>${route.maxAlt} м</b></div><div class="stat"><small>Цепи</small><b>${route.chains?'да':'нет'}</b></div><div class="stat"><small>Лучше</small><b>${esc(route.best||'по условиям')}</b></div></div><div class="source-note">${esc(route.metricNote)}</div></section>
    ${renderRouteHighlights(route.photos)}
    <section class="route-section route-story-section"><div class="story-head"><div class="eyebrow">ROUTE STORY / ЧЕГО ЖДАТЬ</div><h2>Как ощущается этот маршрут.</h2><p>${esc(exp.routeStory||exp.intro||route.why)}</p></div><div class="story-top-grid"><div class="why-go-panel"><small>WHY GO</small><div class="why-go-tags">${renderStoryTags(exp.whyGo?.tags||[])}</div><p>${esc(exp.whyGo?.text||route.why)}</p></div><div class="terrain-panel"><div class="terrain-title"><small>TERRAIN MIX</small><span>примерная доля маршрута</span></div>${renderTerrainMix(exp.terrainMix||[])}</div></div><div class="story-grid"><div class="story-card"><small>Город / подход</small><p>${esc(exp.city||'')}</p></div><div class="story-card"><small>Что под ногами</small><p>${esc(exp.terrain||'')}</p></div><div class="story-card story-card-wide"><small>Ради каких видов идти</small><p>${esc(exp.views||'')}</p></div></div><div class="route-logic"><div><small>Почему старт здесь</small><p>${esc(exp.whyStart||'')}</p></div><div><small>Почему финиш здесь</small><p>${esc(exp.whyFinish||'')}</p></div></div><div class="tradeoff-block"><div class="tradeoff-title"><small>TRADE-OFFS</small><b>За что платишь ради этого маршрута.</b></div><div class="tradeoff-list">${(exp.tradeOffs||[]).map((x,i)=>`<div><span>${String(i+1).padStart(2,'0')}</span><p>${esc(x)}</p></div>`).join('')}</div></div><div class="day-flow"><div class="day-flow-label">ДЕНЬ ПО АКТАМ</div>${(exp.flow||[]).map((x,i)=>`<div class="day-flow-step"><span>${String(i+1).padStart(2,'0')}</span><b>${esc(x)}</b></div>`).join('')}</div><div class="source-note">Terrain mix — кураторская приблизительная доля маршрута по характеру покрытия/ландшафта, а не GPS-измерение. Route Story помогает представить день, но не заменяет маркировку на местности и актуальные сообщения TPN.</div></section>
    <section class="route-section trail-launch-section"><div class="trail-launch-copy"><div class="eyebrow">LIVE TRAIL MODE</div><h2>В дороге — уже не обзорная карта.</h2><p>Показывает твою позицию на треке, GPS accuracy, прогресс, расстояние до цели и ближайших POI, а также предупреждает, если ты ушёл от линии маршрута.</p></div><button class="trail-launch" id="openTrailMode"><span>START</span><b>TRAIL MODE</b><i>→</i></button><div class="source-note secure-note" id="secureNote"></div></section>
    <section class="route-section"><h2>Маршрут / GPX</h2><div class="map-toolbar map-toolbar-rich"><div><span id="routeGeometryMeta" class="loading">Загружаю эталонный трек…</span><span class="context-distance">Старт ≈ ${straight.toFixed(1)} км по прямой от центра Zakopane</span></div><div class="map-toolbar-actions">${FIELD_MAPS[route.id]?'<div class="map-mode-toggle" role="tablist" aria-label="Вид карты"><button class="active" type="button" role="tab" aria-controls="topoMapPanel" data-map-mode="topo" aria-selected="true">TOPO MAP</button><button type="button" role="tab" aria-controls="fieldMap" data-map-mode="field" aria-selected="false">FIELD MAP <span>BETA</span></button></div>':''}<div class="map-view-toggle"><button class="active" data-map-view="route">Маршрут</button><button data-map-view="context">Где это?</button></div><a class="btn acid" href="/api/gpx/${route.id}">Скачать GPX</a></div></div><div class="map-frame"><div id="topoMapPanel" class="topo-map-panel" role="tabpanel"><div id="detailMap" class="detail-map"></div><div class="map-legend"><span><i class="legend-start"></i>старт / финиш</span><span><i class="legend-goal"></i>цель / ключевая точка</span><span><i class="legend-route"></i>маршрут</span></div></div>${renderFieldMapShell()}</div><div class="source-note" id="mapSourceNote">Планировочная карта показывает контекст. Линия взята из маршрутного источника и проверена по длине, границам региона и разрывам. Это всё равно не официальный GPX TPN: на местности следуй маркировке и актуальным сообщениям TPN/TOPR.</div></section>
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
  bindSavedRoute();bindFieldMap();initMap();bindPoiTabs();bindMapViews();bindTrailLaunch();
}

function syncSavedRoute(message=''){
  if(!route||!savedStore)return;
  const ids=savedStore.get();
  const isSaved=ids.includes(route.id);
  const button=document.querySelector('#routeSaveButton');
  const compare=document.querySelector('#routeCompareLink');
  const status=document.querySelector('#routeSaveStatus');
  if(button){
    button.classList.toggle('saved',isSaved);
    button.setAttribute('aria-pressed',String(isSaved));
    button.setAttribute('aria-label',`${isSaved?'Убрать из сохранённых':'Сохранить для сравнения'}: ${route.name}`);
    button.textContent=isSaved?'СОХРАНЕНО ✓':'СОХРАНИТЬ МАРШРУТ +';
  }
  if(compare){
    compare.classList.toggle('disabled',ids.length<2);
    compare.setAttribute('aria-disabled',String(ids.length<2));
    compare.innerHTML=`СРАВНИТЬ <span>${ids.length}</span> →`;
  }
  if(status)status.textContent=message||(ids.length?`Сохранено: ${ids.length} / ${savedStore.max}`:'Можно сохранить до трёх маршрутов');
}
function bindSavedRoute(){
  const button=document.querySelector('#routeSaveButton');
  const compare=document.querySelector('#routeCompareLink');
  button?.addEventListener('click',()=>{
    const result=savedStore.toggle(route.id);
    syncSavedRoute(result.ok?(savedStore.has(route.id)?'Маршрут добавлен в сравнение.':'Маршрут удалён из сохранённых.'):'Уже сохранено три маршрута. Убери один перед добавлением.');
  });
  compare?.addEventListener('click',event=>{
    if(savedStore.get().length>=2)return;
    event.preventDefault();
    syncSavedRoute('Для сравнения нужны хотя бы два маршрута.');
  });
  syncSavedRoute();
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
  try{const g=await fetch(`/api/geometry/${route.id}`).then(r=>r.json());geometryData=g;routeOutline=L.geoJSON(g.geometry,{style:{color:'#fff8e8',weight:11,opacity:.95,lineJoin:'round',lineCap:'round'}}).addTo(map);routeLayer=L.geoJSON(g.geometry,{style:{color:'#ff4f2e',weight:6,opacity:1,lineJoin:'round',lineCap:'round'}}).addTo(map);routeBounds=routeLayer.getBounds();addRouteMarkers(g);renderFieldMap(g.geometry?.coordinates||[]);fitRoute();const quality=g.verified?'reference track':g.approximate?'approx.':'validated hiking route';document.querySelector('#routeGeometryMeta').textContent=`${quality} · ${g.distanceKm} км · ${g.source}`;loadElevation()}catch(e){document.querySelector('#routeGeometryMeta').textContent='Линия маршрута сейчас недоступна.'}
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
window.addEventListener('tatry:saved-routes',()=>syncSavedRoute());
boot().catch(err=>{console.error(err);document.querySelector('#routeApp').innerHTML='<section class="route-hero"><h1>Не удалось загрузить маршрут</h1><p>Обнови страницу. Если ошибка повторяется — map library не загрузилась.</p></section>';});
