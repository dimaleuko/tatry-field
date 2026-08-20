const I18N=window.TatryI18n||{isEnglish:false,tr:(ru)=>ru,routeHref:id=>`/route/${id}`,homeHref:hash=>`/${hash||''}`,localizeRoutes:value=>value,localizeZones:value=>value,localizeZone:value=>value,localizeFieldMap:value=>value};
const EN=I18N.isEnglish;
const tr=I18N.tr;
const LEVELS=EN?{1:'WELLNESS CORE',2:'MY SALOMONS, WHERE THEY BELONG',3:'KNEES ARE NOTICING',4:'DON’T LOOK DOWN IN ANGER',5:'CALL THE HELICOPTER'}:{1:'WELLNESS CORE',2:'МОИ SALOMON ТАМ, ГДЕ ИМ МЕСТО',3:'КОЛЕНИ ПОБАЛИВАЮТ',4:'DON’T LOOK DOWN IN ANGER',5:'ВЫЗЫВАЙТЕ ВЕРТОЛЁТ'};
const ZAKOPANE={name:'ZAKOPANE',lat:49.2992,lon:19.9496,kind:'city'};
const HOME_BASE=window.TatryMapPoints?.home||null;
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
let route,routes=[],stayZones=[],map,routeOutline,routeLayer,routeBounds,geometryData,routeMarkers=null,contextLayer=null,poiLayer=null,homeMarker=null;
let fieldMapLeaflet=null,fieldRouteGroup=null,fieldMapBounds=null,fieldStopMarkers=[];
let trailPois=[];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const savedStore=window.TatrySavedRoutes;
const tripStore=window.TatryTrip;
const FIELD_MAPS=window.TATRY_FIELD_MAPS||{};
let officialData=null,weatherData=null,briefingDay=0,briefingObservations={officialRead:false,wet:false,snow:false,lowVisibility:false,groupNotReady:false};

function poiLink(p){return `https://www.openstreetmap.org/?mlat=${p.lat}&mlon=${p.lon}#map=17/${p.lat}/${p.lon}`}
function haversineKm(a,b){const R=6371,rad=Math.PI/180,dLat=(b.lat-a.lat)*rad,dLon=(b.lon-a.lon)*rad,lat1=a.lat*rad,lat2=b.lat*rad;const h=Math.sin(dLat/2)**2+Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;return 2*R*Math.asin(Math.sqrt(h))}
function haversineM(a,b){return haversineKm(a,b)*1000}
function landmarkIcon(l){return L.divIcon({className:'landmark-icon-wrap',html:`<div class="landmark-label ${l.kind}"><i></i><span>${esc(l.name)}</span></div>`,iconSize:[150,28],iconAnchor:[8,14]})}
function routePin(kind,label){return L.divIcon({className:'route-pin-wrap',html:`<div class="route-pin ${kind}"><i></i><span>${esc(label)}</span></div>`,iconSize:[190,34],iconAnchor:[12,17]})}
function addContextLandmarks(){contextLayer.clearLayers();LANDMARKS.forEach(l=>L.marker([l.lat,l.lon],{icon:landmarkIcon(l),interactive:false,zIndexOffset:l.kind==='city'?450:100}).addTo(contextLayer));if(!EN&&window.TatryMapPoints)homeMarker=window.TatryMapPoints.addHomeMarker(contextLayer)}
function fitRoute(){if(routeBounds?.isValid())map.fitBounds(routeBounds.pad(.11),{animate:true,maxZoom:14})}
function fitContext(){if(!routeBounds?.isValid())return;const b=L.latLngBounds(routeBounds);if(!EN&&HOME_BASE)b.extend([HOME_BASE.lat,HOME_BASE.lon]);map.fitBounds(b.pad(.14),{animate:true,maxZoom:11})}
function fitHome(){if(!HOME_BASE)return;map.setView([HOME_BASE.lat,HOME_BASE.lon],15,{animate:true});homeMarker?.openPopup()}
function bindMapViews(){document.querySelectorAll('[data-map-view]').forEach(btn=>btn.onclick=()=>{document.querySelectorAll('[data-map-view]').forEach(x=>x.classList.remove('active'));btn.classList.add('active');if(btn.dataset.mapView==='context')fitContext();else if(btn.dataset.mapView==='home')fitHome();else fitRoute()})}
function returnClass(score){return score>=5?'excellent':score>=4?'good':'caution'}
function kindLabel(r){return r.routeKind==='height'?tr('ЦЕЛЬ: ВЫСОТА','SUMMIT / ALTITUDE'):tr('ПРОСТО ХАЙК','HIKING DAY')}
function googleDirections(lat,lon,mode='walking'){return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=${mode}&dir_action=navigate`}
function appleDirections(lat,lon,mode='w'){return `https://maps.apple.com/?daddr=${lat},${lon}&dirflg=${mode}`}
function renderTerrainMix(mix=[]){return mix.map(([label,value])=>{const v=Math.max(0,Math.min(100,Number(value)||0));return `<div class="terrain-row"><div class="terrain-row-head"><span>${esc(label)}</span><b>${v}%</b></div><div class="terrain-track"><i style="width:${v}%"></i></div></div>`}).join('')}
function renderStoryTags(tags=[]){return tags.map(t=>`<span>${esc(t)}</span>`).join('')}
function renderSafetyNotice(notice){
  if(!notice)return '';
  const status=notice.status==='closed'?'closed':'expert';
  return `<section class="route-section route-safety-notice ${status}" role="note" aria-label="${tr('Важное предупреждение по безопасности','Important safety notice')}"><div class="route-safety-kicker"><span>${esc(notice.label||'SAFETY CHECK')}</span><b>${status==='closed'?tr('ЗАКРЫТО','CLOSED'):tr('ВЫСОКИЙ РИСК','HIGH CONSEQUENCE')}</b></div><div class="route-safety-copy"><h2>${esc(notice.title)}</h2><p>${esc(notice.text)}</p></div><ol>${(notice.checks||[]).map((item,index)=>`<li><span>${String(index+1).padStart(2,'0')}</span>${esc(item)}</li>`).join('')}</ol>${notice.sourceUrl?`<a target="_blank" rel="noopener noreferrer" href="${esc(notice.sourceUrl)}">${tr('ОТКРЫТЬ ОФИЦИАЛЬНЫЙ ИСТОЧНИК ↗','OPEN OFFICIAL SOURCE ↗')}</a>`:''}</section>`;
}
function personalRouteMarkup(){
  const fit=tripStore.personalizedDifficulty(route);
  return `<div class="route-personal-fit ${fit.status}"><small>${tr('ДЛЯ ТЕБЯ','FOR YOU')}</small><b>${fit.status==='unknown'?'—':`${fit.score}/5`} · ${esc(fit.label)}</b><span>${fit.gaps.length?esc(fit.gaps.join(' · ')):esc(fit.note||tr('Параметры совпадают с привычной нагрузкой.','The route fits your usual range.'))}</span>${fit.status==='unknown'?`<a href="${I18N.homeHref('#trip-studio')}">${tr('заполнить профиль →','complete the profile →')}</a>`:''}</div>`;
}
function renderRouteHighlights(photos=[]){
  if(!photos.length)return '';
  return `<section class="route-section route-highlights-section"><div class="route-highlights-head"><div class="eyebrow">${tr('ROUTE HIGHLIGHTS / КАК ЭТО ВЫГЛЯДИТ','ROUTE HIGHLIGHTS / WHAT IT LOOKS LIKE')}</div><h2>${tr('Две сцены, ради которых идти.','Two scenes worth the walk.')}</h2><p>${tr('Не абстрактные Татры, а узнаваемые точки именно этого маршрута.','Recognisable places from this route, not generic mountain photography.')}</p></div><div class="route-highlights-grid">${photos.slice(0,2).map((photo,i)=>`<figure class="route-highlight"><div class="route-highlight-image"><img loading="eager" decoding="async" referrerpolicy="no-referrer" src="${esc(photo.src)}" alt="${esc(photo.alt)}"><span>${String(i+1).padStart(2,'0')}</span></div><figcaption><h3>${esc(photo.title)}</h3><p>${esc(photo.caption)}</p><div class="photo-credit">${tr('Фото','Photo')}: <a target="_blank" rel="noopener noreferrer" href="${esc(photo.sourceUrl)}">${esc(photo.author)} ↗</a> · <a target="_blank" rel="noopener noreferrer" href="${esc(photo.licenseUrl)}">${esc(photo.license)}</a></div></figcaption></figure>`).join('')}</div><div class="source-note">${tr('Фотографии показывают характерные точки маршрута, но сезон, погода и состояние тропы могут сильно отличаться. Источник, автор и лицензия указаны под каждым кадром.','Photos show characteristic points, but season, weather and trail condition can look very different. Source, author and licence appear below each image.')}</div></section>`;
}
function fieldSourceLinks(config){
  const sources=[...(config.sources||[]),[tr('трек маршрута','route track'),route.mapUrl]].filter((source,index,all)=>source?.[1]&&all.findIndex(item=>item?.[1]===source[1])===index);
  return sources.map(([label,url])=>`<a target="_blank" rel="noopener noreferrer" href="${esc(url)}">${esc(label)}</a>`).join(' · ');
}
function renderFieldMapShell(){
  const config=FIELD_MAPS[route.id];
  if(!config)return '';
  return `<section class="field-map" id="fieldMap" role="tabpanel" hidden aria-labelledby="fieldMapTitle">
    <header class="field-map-header"><div><span>${esc(config.issue)}</span><h3 id="fieldMapTitle">${esc(config.title)}</h3></div><p>${esc(config.intro)}</p></header>
    <div class="field-map-layout"><div class="field-terrain-map" id="fieldTerrainMap" aria-label="${tr('Топографическая карта маршрута','Topographic map of')} ${esc(route.name)} ${tr('с интерактивными этапами','with interactive stages')}"></div><aside class="field-map-readout" id="fieldMapReadout" aria-live="polite"></aside></div>
    <footer class="field-map-footer"><div class="field-map-key"><span class="approach">${tr('подход','approach')}</span><span class="effort">${tr('набор / нагрузка','ascent / effort')}</span><span class="navigation">${tr('точки решения','decision points')}</span><span class="technical">${tr('сложное покрытие','technical terrain')}</span></div><div class="field-home-action">${EN?'':`<button type="button" data-field-home>⌂ ПОКАЗАТЬ НАШ ДОМ</button>`}<p>${tr('Цветом выделены ключевые участки; тонкая линия сохраняет полный трек. Точки привязаны приблизительно и не заменяют маркировку, офлайн-карту или актуальные сообщения TPN/TOPR. Источники:','Colour marks key sections while the thin line preserves the complete track. Points are approximate and do not replace trail markings, an offline map or current TPN/TOPR notices. Sources:')} ${fieldSourceLinks(config)}.</p></div></footer>
    <div class="field-photo-overlay" id="fieldPhotoOverlay" hidden role="dialog" aria-modal="true" aria-labelledby="fieldPhotoTitle"><button type="button" class="field-photo-close" data-field-photo-close aria-label="${tr('Закрыть фотографию','Close photo')}">×</button><div class="field-photo-dialog"><img id="fieldPhotoImage" alt=""><div><span>${tr('ROUTE PHOTO / МЕСТО НА ТРЕКЕ','ROUTE PHOTO / PLACE ON TRACK')}</span><h4 id="fieldPhotoTitle"></h4><p id="fieldPhotoCaption"></p><div id="fieldPhotoCredit" class="photo-credit"></div></div></div></div>
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
  return `<div class="field-photo-panel"><button type="button" class="field-photo-open" data-field-photo-open="${index}" aria-label="${tr('Открыть фотографию','Open photo')}: ${esc(photo.title)}"><img loading="lazy" decoding="async" referrerpolicy="no-referrer" src="${esc(photo.src)}" alt="${esc(photo.alt)}"><span>${tr('ОТКРЫТЬ ФОТО ↗','OPEN PHOTO ↗')}</span></button><div><b>${esc(photo.title)}</b><p>${esc(photo.caption)}</p><small>${tr('Фото','Photo')}: <a target="_blank" rel="noopener noreferrer" href="${esc(photo.sourceUrl)}">${esc(photo.author)} ↗</a> · <a target="_blank" rel="noopener noreferrer" href="${esc(photo.licenseUrl)}">${esc(photo.license)}</a></small></div></div>`;
}
function fieldMapReadout(index,{focusMap=true}={}){
  const config=FIELD_MAPS[route.id],stop=config?.stops[index];
  const readout=document.querySelector('#fieldMapReadout');
  if(!stop||!readout)return;
  readout.dataset.active=String(index);
  const photo=Number.isInteger(stop.photoIndex)?route.photos?.[stop.photoIndex]:null;
  readout.innerHTML=`<div class="field-readout-head"><span class="field-level ${esc(stop.level)}">${esc(stop.tag)}</span><small>${esc(stop.kicker)}</small><h4>${esc(stop.name)}</h4><b>${esc(stop.meta)}</b></div><div class="field-decision"><small>${esc(stop.prompt||(stop.level==='danger'?tr('ТЕХНИЧЕСКИЙ УЧАСТОК','TECHNICAL SECTION'):tr('СМОТРИ НА МАРКИРОВКУ','CHECK THE MARKS')))}</small><strong>${esc(stop.decision)}</strong></div><p class="field-readout-body">${esc(stop.body)}</p>${fieldPhotoMarkup(photo,stop.photoIndex)}<div class="field-map-stepper"><button type="button" data-field-step="-1" aria-label="${tr('Предыдущий этап','Previous stage')}">←</button><b>${String(index+1).padStart(2,'0')} / ${String(config.stops.length).padStart(2,'0')}</b><button type="button" data-field-step="1" aria-label="${tr('Следующий этап','Next stage')}">→</button></div>`;
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
  config.stops.forEach((stop,index)=>{const [lon,lat]=fieldCoordinateAt(model,stop.ratio);const marker=L.marker([lat,lon],{icon:fieldStopIcon(stop,index),zIndexOffset:1200+index,title:`${index+1}. ${stop.name}`,alt:`${tr('Этап','Stage')} ${index+1}: ${stop.name}`}).addTo(fieldRouteGroup);marker.on('click',()=>fieldMapReadout(index));fieldStopMarkers.push(marker)});
  if(!EN&&window.TatryMapPoints)window.TatryMapPoints.addHomeMarker(fieldMapLeaflet);
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
  if(note)note.textContent=field?tr('Field Map сохраняет реальную топографию и добавляет приблизительные точки решений, смены нагрузки и фото. Для движения всё равно нужны официальная маркировка, офлайн-карта и актуальные сообщения TPN/TOPR.','Field Map keeps real topography and adds approximate decision, effort and photo points. Official markings, an offline map and current TPN/TOPR notices are still required on the trail.'):tr('Планировочная карта показывает контекст. Линия взята из маршрутного источника и проверена по длине, границам региона и разрывам. Это всё равно не официальный GPX TPN: на местности следуй маркировке и актуальным сообщениям TPN/TOPR.','The planning map shows context. The line comes from a route source and is checked for length, regional bounds and gaps. It is not an official TPN GPX: follow marked trails and current TPN/TOPR notices on the ground.');
  if(field)setTimeout(()=>{fieldMapLeaflet?.invalidateSize();if(fieldMapBounds?.isValid())fieldMapLeaflet.fitBounds(fieldMapBounds.pad(.12),{animate:false,maxZoom:14});fieldMapReadout(Number(document.querySelector('#fieldMapReadout')?.dataset.active||0),{focusMap:false})},0);
  else setTimeout(()=>{map?.invalidateSize();document.querySelector('[data-map-view].active')?.dataset.mapView==='context'?fitContext():fitRoute()},0);
}
function openFieldPhoto(index){
  const photo=route.photos?.[index],overlay=document.querySelector('#fieldPhotoOverlay');
  if(!photo||!overlay)return;
  document.querySelector('#fieldPhotoImage').src=photo.src;document.querySelector('#fieldPhotoImage').alt=photo.alt;document.querySelector('#fieldPhotoTitle').textContent=photo.title;document.querySelector('#fieldPhotoCaption').textContent=photo.caption;
  document.querySelector('#fieldPhotoCredit').innerHTML=`${tr('Фото','Photo')}: <a target="_blank" rel="noopener noreferrer" href="${esc(photo.sourceUrl)}">${esc(photo.author)} ↗</a> · <a target="_blank" rel="noopener noreferrer" href="${esc(photo.licenseUrl)}">${esc(photo.license)}</a>`;
  overlay.hidden=false;document.body.classList.add('field-photo-open');overlay.querySelector('[data-field-photo-close]')?.focus();
}
function closeFieldPhoto(){const overlay=document.querySelector('#fieldPhotoOverlay');if(!overlay||overlay.hidden)return;overlay.hidden=true;document.body.classList.remove('field-photo-open');document.querySelector('[data-field-photo-open]')?.focus()}
function bindFieldMap(){
  document.querySelectorAll('[data-map-mode]').forEach(button=>button.addEventListener('click',()=>setMapMode(button.dataset.mapMode)));
  const field=document.querySelector('#fieldMap');
  field?.addEventListener('click',event=>{
    if(event.target.closest('[data-field-home]')&&HOME_BASE){fieldMapLeaflet?.setView([HOME_BASE.lat,HOME_BASE.lon],15,{animate:true});return}
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
  const straight=!EN&&HOME_BASE?haversineKm(HOME_BASE,{lat:route.startLat,lon:route.startLon}):null;
  const obj=route.objective||{name:route.goal||route.end,altitude:route.maxAlt,type:tr('цель','objective')};
  const ret=route.returnToZakopane||{};
  const exp=route.experience||{};
  const isSaved=savedStore?.has(route.id)||false;
  const savedCount=savedStore?.get().length||0;
  const trailLaunch=route.temporarilyClosed?'<div class="trail-launch trail-launch-disabled" aria-disabled="true"><span>CLOSED BY TPN</span><b>TRAIL MODE</b><i>×</i></div>':'<button class="trail-launch" id="openTrailMode"><span>START</span><b>TRAIL MODE</b><i>→</i></button>';
  const gpxAction=route.temporarilyClosed?`<span class="btn acid disabled" aria-disabled="true" title="${tr('GPX недоступен, пока участок официально закрыт','GPX is unavailable while the section is officially closed')}">${tr('GPX НЕДОСТУПЕН','GPX UNAVAILABLE')}</span>`:`<a class="btn acid" href="/api/gpx/${route.id}">${tr('Скачать GPX','Download GPX')}</a>`;
  const compareHref=EN?'/en/?compare=1#routes':'/?compare=1#routes';
  const distanceFromHome=straight===null?'':`<span class="context-distance">${tr('От нашего дома до старта','From our home to the start')} ≈ ${straight.toFixed(1)} ${tr('км по прямой','km straight-line')}</span>`;
  const mapViewToggle=EN?`<div class="map-view-toggle"><button class="active" data-map-view="route">Route</button><button data-map-view="context">Route + context</button></div>`:`<div class="map-view-toggle"><button class="active" data-map-view="route">Маршрут</button><button data-map-view="context">Маршрут + дом</button><button data-map-view="home">Дом</button></div>`;
  const homeLegend=EN?'':'<span><i class="legend-home"></i>наш дом</span>';
  document.title=`${route.name} — TATRY / FIELD`;
  document.querySelector('#routeApp').innerHTML=`
  <section class="route-hero"><a class="back" href="${I18N.homeHref()}">← ${tr('все маршруты','all routes')}</a><h1>${esc(route.name)}</h1>
    <div class="route-deck"><p>${esc(route.why)}</p><div class="difficulty-stack"><div class="difficulty-box"><small>${tr('базовая сложность','base difficulty')} ${route.diff}/5</small><b>${LEVELS[route.diff]}</b></div>${personalRouteMarkup()}</div></div>
    <div class="route-save-bar"><button type="button" id="routeSaveButton" class="route-detail-save${isSaved?' saved':''}" aria-pressed="${isSaved}">${isSaved?tr('СОХРАНЕНО ✓','SAVED ✓'):tr('СОХРАНИТЬ МАРШРУТ +','SAVE ROUTE +')}</button><a id="routeCompareLink" class="route-detail-compare${savedCount<2?' disabled':''}" href="${compareHref}">${tr('СРАВНИТЬ','COMPARE')} <span>${savedCount}</span> →</a><span id="routeSaveStatus" aria-live="polite">${savedCount?`${tr('Сохранено','Saved')}: ${savedCount} / ${savedStore.max}`:tr('Можно сохранить до трёх маршрутов','Save up to three routes')}</span></div>
    <div class="identity-strip"><div><small>${tr('Формат','Format')}</small><b>${kindLabel(route)}</b></div><div><small>${tr('Цель','Objective')}</small><b>${esc(obj.name)}</b><span>${obj.altitude} ${tr('м','m')} · ${esc(obj.type)}</span></div><div><small>${tr('Обратно в Zakopane','Return to Zakopane')}</small><b>${ret.score||'—'}/5 · ${esc(ret.label||'')}</b><span>${esc(ret.typicalTime||'')}</span></div></div>
  </section>
  <div class="route-body"><div class="route-main">
    <section class="route-section"><div class="stat-grid"><div class="stat"><small>${tr('Время','Time')}</small><b>${route.hours} ${tr('ч','h')}</b></div><div class="stat"><small>${tr('Км','Km')}</small><b>${route.km}</b></div><div class="stat"><small>${tr('Набор','Ascent')}</small><b>+${route.ascent} ${tr('м','m')}</b></div><div class="stat"><small>Max</small><b>${route.maxAlt} ${tr('м','m')}</b></div><div class="stat"><small>${tr('Цепи','Chains')}</small><b>${route.chains?tr('да','yes'):tr('нет','no')}</b></div><div class="stat"><small>${tr('Лучше','Best')}</small><b>${esc(route.best||tr('по условиям','condition dependent'))}</b></div></div><div class="source-note">${esc(route.metricNote)}</div></section>
    ${renderSafetyNotice(route.safetyNotice)}
    ${renderRouteHighlights(route.photos)}
    <section class="route-section route-story-section"><div class="story-head"><div class="eyebrow">${tr('ROUTE STORY / ЧЕГО ЖДАТЬ','ROUTE STORY / WHAT TO EXPECT')}</div><h2>${tr('Как ощущается этот маршрут.','How this route feels.')}</h2><p>${esc(exp.routeStory||exp.intro||route.why)}</p></div><div class="story-top-grid"><div class="why-go-panel"><small>WHY GO</small><div class="why-go-tags">${renderStoryTags(exp.whyGo?.tags||[])}</div><p>${esc(exp.whyGo?.text||route.why)}</p></div><div class="terrain-panel"><div class="terrain-title"><small>TERRAIN MIX</small><span>${tr('примерная доля маршрута','approximate share of the route')}</span></div>${renderTerrainMix(exp.terrainMix||[])}</div></div><div class="story-grid"><div class="story-card"><small>${tr('Город / подход','Town / approach')}</small><p>${esc(exp.city||'')}</p></div><div class="story-card"><small>${tr('Что под ногами','Underfoot')}</small><p>${esc(exp.terrain||'')}</p></div><div class="story-card story-card-wide"><small>${tr('Ради каких видов идти','Views worth the walk')}</small><p>${esc(exp.views||'')}</p></div></div><div class="route-logic"><div><small>${tr('Почему старт здесь','Why start here')}</small><p>${esc(exp.whyStart||'')}</p></div><div><small>${tr('Почему финиш здесь','Why finish here')}</small><p>${esc(exp.whyFinish||'')}</p></div></div><div class="tradeoff-block"><div class="tradeoff-title"><small>TRADE-OFFS</small><b>${tr('За что платишь ради этого маршрута.','What this route asks in return.')}</b></div><div class="tradeoff-list">${(exp.tradeOffs||[]).map((x,i)=>`<div><span>${String(i+1).padStart(2,'0')}</span><p>${esc(x)}</p></div>`).join('')}</div></div><div class="day-flow"><div class="day-flow-label">${tr('ДЕНЬ ПО АКТАМ','THE DAY IN ACTS')}</div>${(exp.flow||[]).map((x,i)=>`<div class="day-flow-step"><span>${String(i+1).padStart(2,'0')}</span><b>${esc(x)}</b></div>`).join('')}</div><div class="source-note">${tr('Terrain mix — кураторская приблизительная доля маршрута по характеру покрытия/ландшафта, а не GPS-измерение. Route Story помогает представить день, но не заменяет маркировку на местности и актуальные сообщения TPN.','Terrain mix is a curated estimate of surfaces and landscape, not a GPS measurement. Route Story helps picture the day but does not replace trail markings or current TPN notices.')}</div></section>
    <section class="route-section trail-launch-section"><div class="trail-launch-copy"><div class="eyebrow">LIVE TRAIL MODE</div><h2>${tr('В дороге — уже не обзорная карта.','On the trail, the map becomes operational.')}</h2><p>${tr('Показывает твою позицию на треке, GPS accuracy, прогресс, расстояние до цели и ближайших POI, а также предупреждает, если ты ушёл от линии маршрута.','See your position on the track, reported GPS accuracy, progress, distance to the objective and nearby POIs, plus off-route warnings.')}</p></div>${trailLaunch}<div class="source-note secure-note" id="secureNote"></div></section>
    <section class="route-section"><h2>${tr('Маршрут / GPX','Route / GPX')}</h2><div class="map-toolbar map-toolbar-rich"><div><span id="routeGeometryMeta" class="loading">${tr('Загружаю эталонный трек…','Loading reference track…')}</span>${distanceFromHome}</div><div class="map-toolbar-actions">${FIELD_MAPS[route.id]?`<div class="map-mode-toggle" role="tablist" aria-label="${tr('Вид карты','Map view')}"><button class="active" type="button" role="tab" aria-controls="topoMapPanel" data-map-mode="topo" aria-selected="true">TOPO MAP</button><button type="button" role="tab" aria-controls="fieldMap" data-map-mode="field" aria-selected="false">FIELD MAP <span>BETA</span></button></div>`:''}${mapViewToggle}${gpxAction}</div></div><div class="map-frame"><div id="topoMapPanel" class="topo-map-panel" role="tabpanel"><div id="detailMap" class="detail-map"></div><div class="map-legend"><span><i class="legend-start"></i>${tr('старт / финиш','start / finish')}</span><span><i class="legend-goal"></i>${tr('цель / ключевая точка','objective / key point')}</span><span><i class="legend-route"></i>${tr('маршрут','route')}</span>${homeLegend}</div></div>${renderFieldMapShell()}</div><div class="source-note" id="mapSourceNote">${tr('Планировочная карта показывает контекст. Линия взята из маршрутного источника и проверена по длине, границам региона и разрывам. Это всё равно не официальный GPX TPN: на местности следуй маркировке и актуальным сообщениям TPN/TOPR.','The planning map shows context. The line comes from a route source and is checked for length, regional bounds and gaps. It is not an official TPN GPX: follow marked trails and current TPN/TOPR notices on the ground.')}</div></section>
    <section class="route-section"><h2>${tr('Профиль высот','Elevation profile')}</h2><div class="elevation" id="elevation"><span class="loading">${tr('Считаю профиль…','Calculating profile…')}</span></div><div class="profile-meta" id="profileMeta"></div></section>
    <section class="route-section"><h2>${tr('Планирование заранее','Planning ahead')}</h2><div class="planning-box"><div><small>${tr('Лучший период','Best period')}</small><b>${esc(route.best||tr('зависит от условий','condition dependent'))}</b></div><p>${tr('Мы не используем ранний прогноз для поездки через неделю или две: он создаёт ложную уверенность. План B можно подготовить заранее, а погоду и TPN/TOPR нужно проверить ближе к дате и ещё раз утром.','We do not use a forecast one or two weeks out as a go/no-go signal. Prepare Plan B now, then check weather, TPN and TOPR close to the date and again in the morning.')}</p></div></section>
    <section class="route-section morning-section" id="morningSection"><div class="intelligence-head"><div><div class="eyebrow">${tr('MORNING BRIEFING / РЕШЕНИЕ НА СЕГОДНЯ','MORNING BRIEFING / TODAY’S DECISION')}</div><h2>GO, ADJUST<br>${tr('или ниже.','or go lower.')}</h2></div><p>${tr('Свежая погода для верхней точки + TPN + твой профиль + то, что видно на месте. Это не сертификат безопасности.','Fresh upper-route weather + TPN + your profile + what the group sees on site. This is not a safety certificate.')}</p></div><div id="morningBriefing"><span class="loading">${tr('Собираю свежий briefing…','Building a fresh briefing…')}</span></div></section>
    <section class="route-section route-pack-section"><div class="intelligence-head"><div><div class="eyebrow">${tr('ROUTE PACK / ТОЛЬКО ДЛЯ ЭТОГО ДНЯ','ROUTE PACK / FOR THIS DAY')}</div><h2>${tr('Что положить<br>в этот рюкзак.','What belongs<br>in this pack.')}</h2></div><p>${tr('База одинаковая, но длинный день, цепи, набор и открытый рельеф добавляют свои вещи. Отмеченное сохранится на этом устройстве.','The core stays the same, while duration, chains, ascent and exposed terrain add route-specific items. Checked items stay on this device.')}</p></div><div id="routePack"></div></section>
    <section class="route-section"><h2>${tr('Что может пойти не так','What can go wrong')}</h2><div class="split"><ul class="bullet-list">${route.risks.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><ul class="bullet-list">${route.gear.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div></section>
    <section class="route-section"><h2>${tr('Официальный check','Official check')}</h2><div id="official" class="official-box"><span class="loading">${tr('Проверяю TPN/TOPR…','Checking TPN/TOPR…')}</span></div></section>
  </div>
  <aside class="sidebar"><div class="sidebar-inner">
    <div class="safety-banner"><b>${tr('НЕ “SAFE / UNSAFE”.','NOT “SAFE / UNSAFE”.')}</b><br>${tr('Сервис помогает планировать и ориентироваться, но не заменяет официальные указатели, TPN/TOPR и здравый смысл на месте.','This service supports planning and orientation, but does not replace official signs, TPN/TOPR guidance or judgement on the ground.')}</div>
    <section class="side-section directions-section"><h2>${tr('До старта','Get to the start')}</h2><p><b>${esc(route.start)}</b><br>${tr('Открой обычную навигацию от текущего места до trailhead.','Open normal navigation from your current location to the trailhead.')}</p><div class="direction-buttons"><a class="btn primary" target="_blank" rel="noopener" href="${googleDirections(route.startLat,route.startLon,'walking')}">Google Maps ↗</a><a class="btn" target="_blank" rel="noopener" href="${appleDirections(route.startLat,route.startLon,'w')}">Apple Maps ↗</a></div></section>
    <section class="side-section"><h2>${tr('Логистика','Logistics')}</h2><p><b>${tr('Старт','Start')}:</b> ${esc(route.start)}<br><b>${tr('Цель','Objective')}:</b> ${esc(obj.name)} · ${obj.altitude} ${tr('м','m')}<br><b>${tr('Финиш полного маршрута','Full-route finish')}:</b> ${esc(route.finish||route.start)}<br><br>${esc(route.transport)}<br><br>${esc(route.parking)}</p></section>
    <section class="side-section return-section"><h2>${tr('Вернуться в Zakopane','Return to Zakopane')}</h2><div class="return-score ${returnClass(ret.score)}"><b>${ret.score||'—'}/5</b><span>${esc(ret.label||'')}</span></div><p>${esc(ret.note||'')}</p><div class="return-time">${tr('Ориентир','Typical')}: <b>${esc(ret.typicalTime||'—')}</b></div><div class="direction-buttons"><a class="btn primary" target="_blank" rel="noopener" href="${googleDirections(ZAKOPANE.lat,ZAKOPANE.lon,'transit')}">Google · transit ↗</a><a class="btn" target="_blank" rel="noopener" href="${appleDirections(ZAKOPANE.lat,ZAKOPANE.lon,'r')}">Apple · transit ↗</a></div>${ret.sourceUrl?`<a class="btn transport-source" target="_blank" rel="noopener" href="${ret.sourceUrl}">${tr('актуальный транспорт','current transport')} ↗</a>`:''}</section>
    <section class="side-section"><h2>${tr('Где жить под этот маршрут','Where to stay for this route')}</h2><div id="stayBox"><span class="loading">${tr('Подбираю базу и жильё…','Finding a practical base…')}</span></div></section>
    <section class="side-section"><h2>${tr('Кофе / еда / транспорт рядом','Coffee / food / transport nearby')}</h2><div class="poi-tabs"><button class="poi-tab active" data-kind="food">${tr('кофе + еда','coffee + food')}</button><button class="poi-tab" data-kind="parking">${tr('паркинг','parking')}</button><button class="poi-tab" data-kind="transit">${tr('автобус','bus')}</button></div><div id="poiList" class="poi-list"><span class="loading">${tr('Ищу вокруг старта…','Searching near the start…')}</span></div><div class="source-note">${tr('POI приходят из OpenStreetMap и могут быть неполными или устаревшими; часы работы лучше перепроверить.','POIs come from OpenStreetMap and may be incomplete or outdated; verify opening hours separately.')}</div></section>
    <section class="side-section"><h2>Original sources</h2><div style="display:flex;gap:7px;flex-wrap:wrap"><a class="btn primary" href="https://tpn.gov.pl/komunikat-turystyczny" target="_blank" rel="noopener">TPN conditions ↗</a><a class="btn" href="https://topr.pl/" target="_blank" rel="noopener">TOPR ↗</a><a class="btn" href="${route.mapUrl}" target="_blank" rel="noopener">route reference ↗</a></div></section>
  </div></aside></div>`;
  document.querySelector('#secureNote').textContent=window.isSecureContext?tr('На HTTPS/localhost браузер сможет запросить GPS и компас.','On HTTPS/localhost the browser can request GPS and compass access.'):tr('Сейчас открыт обычный HTTP по локальной сети. Trail Mode можно посмотреть в DEMO, но настоящий GPS/компас на iPhone потребует HTTPS после публикации.','This is a plain HTTP local-network page. Trail Mode works in DEMO, but real GPS/compass on iPhone requires HTTPS after deployment.');
  bindSavedRoute();bindFieldMap();initMap();bindPoiTabs();bindMapViews();bindTrailLaunch();bindMorningBriefing();renderRoutePack();
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
    button.setAttribute('aria-label',`${isSaved?tr('Убрать из сохранённых','Remove from saved routes'):tr('Сохранить для сравнения','Save for comparison')}: ${route.name}`);
    button.textContent=isSaved?tr('СОХРАНЕНО ✓','SAVED ✓'):tr('СОХРАНИТЬ МАРШРУТ +','SAVE ROUTE +');
  }
  if(compare){
    compare.classList.toggle('disabled',ids.length<2);
    compare.setAttribute('aria-disabled',String(ids.length<2));
    compare.innerHTML=`${tr('СРАВНИТЬ','COMPARE')} <span>${ids.length}</span> →`;
  }
  if(status)status.textContent=message||(ids.length?`${tr('Сохранено','Saved')}: ${ids.length} / ${savedStore.max}`:tr('Можно сохранить до трёх маршрутов','Save up to three routes'));
}
function bindSavedRoute(){
  const button=document.querySelector('#routeSaveButton');
  const compare=document.querySelector('#routeCompareLink');
  button?.addEventListener('click',()=>{
    const result=savedStore.toggle(route.id);
    syncSavedRoute(result.ok?(savedStore.has(route.id)?tr('Маршрут добавлен в сравнение.','Route added to comparison.'):tr('Маршрут удалён из сохранённых.','Route removed from saved routes.')):tr('Уже сохранено три маршрута. Убери один перед добавлением.','Three routes are already saved. Remove one before adding another.'));
  });
  compare?.addEventListener('click',event=>{
    if(savedStore.get().length>=2)return;
    event.preventDefault();
    syncSavedRoute(tr('Для сравнения нужны хотя бы два маршрута.','Save at least two routes to compare them.'));
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
  L.marker(startLL,{icon:routePin('start',returnsToStart?tr('СТАРТ / ФИНИШ','START / FINISH'):tr('СТАРТ','START')),zIndexOffset:1000}).addTo(routeMarkers).bindPopup(`<b>${returnsToStart?tr('Старт / финиш','Start / finish'):tr('Старт','Start')}</b><br>${esc(route.start)}`);
  const obj=route.objective||{};L.marker([route.summitLat,route.summitLon],{icon:routePin('goal',`${route.routeKind==='height'?tr('ВЫСОТА','SUMMIT'):tr('ЦЕЛЬ','OBJECTIVE')} · ${obj.name||route.goal||''}`),zIndexOffset:1100}).addTo(routeMarkers).bindPopup(`<b>${esc(obj.name||route.goal||tr('Ключевая точка','Key point'))}</b><br>${obj.altitude||route.maxAlt} ${tr('м','m')}`);
  if(!returnsToStart)L.marker(endLL,{icon:routePin('finish',tr('ФИНИШ','FINISH')),zIndexOffset:1050}).addTo(routeMarkers).bindPopup(`<b>${tr('Финиш','Finish')}</b><br>${esc(route.finish||route.end)}`);
}
async function loadGeometry(){
  try{const g=await fetch(`/api/geometry/${route.id}`).then(r=>r.json());geometryData=g;routeOutline=L.geoJSON(g.geometry,{style:{color:'#fff8e8',weight:11,opacity:.95,lineJoin:'round',lineCap:'round'}}).addTo(map);routeLayer=L.geoJSON(g.geometry,{style:{color:'#ff4f2e',weight:6,opacity:1,lineJoin:'round',lineCap:'round'}}).addTo(map);routeBounds=routeLayer.getBounds();addRouteMarkers(g);renderFieldMap(g.geometry?.coordinates||[]);fitRoute();const quality=g.verified?'reference track':g.approximate?'approx.':'validated hiking route';document.querySelector('#routeGeometryMeta').textContent=`${quality} · ${g.distanceKm} ${tr('км','km')} · ${g.source}`;loadElevation()}catch(e){document.querySelector('#routeGeometryMeta').textContent=tr('Линия маршрута сейчас недоступна.','Route line is currently unavailable.')}
}
async function loadElevation(){
  try{const d=await fetch(`/api/elevation/${route.id}`).then(r=>r.json());const pts=(d.profile||[]).filter(p=>Number.isFinite(p.elevation)&&Number.isFinite(p.km));if(!pts.length)throw new Error('No elevation');const w=900,h=220,pad=18;const min=Math.min(...pts.map(p=>p.elevation)),max=Math.max(...pts.map(p=>p.elevation));const end=Math.max(...pts.map(p=>p.km))||1;const xy=pts.map(p=>[pad+(p.km/end)*(w-pad*2),h-pad-((p.elevation-min)/(Math.max(1,max-min)))*(h-pad*2)]);const line=xy.map(p=>p.join(',')).join(' ');const area=`${pad},${h-pad} ${line} ${w-pad},${h-pad}`;document.querySelector('#elevation').innerHTML=`<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><polygon points="${area}" fill="rgba(255,79,46,.10)"/><polyline points="${line}" fill="none" stroke="#ff4f2e" stroke-width="3" vector-effect="non-scaling-stroke"/><text x="${pad}" y="18" font-size="11">${Math.round(max)} ${tr('м','m')}</text><text x="${pad}" y="${h-5}" font-size="11">${Math.round(min)} ${tr('м','m')}</text><text x="${w-90}" y="${h-5}" font-size="11">${end.toFixed(1)} ${tr('км','km')}</text></svg>`;document.querySelector('#profileMeta').innerHTML=`<span>track/elevation distance: <b>${d.distanceKm} ${tr('км','km')}</b></span><span>sampled ascent: <b>+${d.ascentM} ${tr('м','m')}</b></span>${d.approximate?'<span>fallback / approximate</span>':''}`}catch{document.querySelector('#elevation').innerHTML=`<span class="loading">${tr('Профиль высот сейчас недоступен.','Elevation profile is currently unavailable.')}</span>`}
}
function shortDate(value){try{return new Intl.DateTimeFormat(EN?'en-GB':'ru-RU',{weekday:'short',day:'numeric',month:'short'}).format(new Date(`${value}T12:00:00`))}catch{return value||'—'}}
function clock(value){return value?value.slice(11,16):'—'}
function briefingReason(reason){
  if(!EN||!/[А-Яа-яЁё]/.test(reason||''))return reason;
  if(/грозов/.test(reason))return 'The forecast contains a thunderstorm signal.';
  let match=String(reason).match(/Порывы до ([\d.]+) км\/ч/);if(match)return `Gusts up to ${match[1]} km/h.`;
  match=String(reason).match(/Вероятность осадков до ([\d.]+)%, около ([\d.]+) мм/);if(match)return `Precipitation probability up to ${match[1]}%, around ${match[2]} mm.`;
  match=String(reason).match(/Минимум около ([\d.-]+)°C/);if(match)return `Minimum around ${match[1]}°C: winter conditions are possible higher up.`;
  return 'The available data contains a condition that requires a manual check.';
}
function currentTripOptions(){const plan=tripStore.getTrip();return plan||{zoneId:route.stayZone,car:false,rhythm:'balanced'}}
function renderMorningBriefing(){
  const host=document.querySelector('#morningBriefing');if(!host)return;
  const day=weatherData?.days?.[briefingDay];
  if(!weatherData&&!officialData){host.innerHTML=`<span class="loading">${tr('Собираю прогноз для старта и верхней точки, затем сверяю TPN…','Collecting forecasts for the start and upper point, then checking TPN…')}</span>`;return}
  const result=tripStore.morningBriefing(route,day,officialData,tripStore.getProfile(),briefingObservations,routes,currentTripOptions(),stayZones);
  const summit=day?.summit;
  const dayButtons=(weatherData?.days||[{day:0,summit:{date:''}},{day:1,summit:{date:''}}]).map((item,index)=>`<button type="button" class="briefing-day${briefingDay===index?' active':''}" data-briefing-day="${index}">${index===0?tr('СЕГОДНЯ','TODAY'):tr('ЗАВТРА','TOMORROW')}<span>${esc(shortDate(item.summit?.date))}</span></button>`).join('');
  const observationLabels={officialRead:tr('TPN прочитан полностью','TPN bulletin read in full'),wet:tr('мокрая скала','wet rock'),snow:tr('снег / лёд','snow / ice'),lowVisibility:tr('плохая видимость','poor visibility'),groupNotReady:tr('группа не готова','group is not ready')};
  const observations=Object.entries(observationLabels).map(([key,label])=>`<button type="button" data-observation="${key}" aria-pressed="${briefingObservations[key]}" class="condition-chip${key==='officialRead'?' confirm':''}${briefingObservations[key]?' active':''}">${esc(label)}</button>`).join('');
  const verdict=result.key==='go'?tr('Проверки не нашли явной причины менять план. Продолжай оценивать фактические условия и состояние группы.','The checks found no clear reason to change the plan. Keep assessing actual conditions and the group.'):result.key==='adjust'?tr('Уменьши амбиции, время или выбери Plan B после ручной проверки.','Reduce ambition or duration, or choose Plan B after a manual check.'):tr('Не продолжай высокий вариант с текущими сигналами. Выбирай более низкий план или пропускай выход.','Do not continue with the high route under the current signals. Choose a lower plan or skip the outing.');
  host.innerHTML=`<div class="briefing-days">${dayButtons}</div><div class="briefing-card ${result.key}"><div class="briefing-verdict"><small>${tr('VERDICT / НЕ РАЗРЕШЕНИЕ','VERDICT / NOT PERMISSION')}</small><strong>${esc(result.label)}</strong><p>${verdict}</p></div><div class="briefing-weather"><small>${tr('ВЕРХНЯЯ ТОЧКА','UPPER POINT')} / 06—20</small><div><span>${tr('Температура','Temperature')}<b>${summit?`${summit.minTemp}…${summit.maxTemp}°`:'—'}</b></span><span>${tr('Порывы','Gusts')}<b>${summit?.maxGust!=null?`${summit.maxGust} km/h`:'—'}</b></span><span>${tr('Осадки','Precipitation')}<b>${summit?.maxPrecipProb!=null?`${summit.maxPrecipProb}% · ${summit.precipMm} mm`:'—'}</b></span><span>${tr('Свет','Daylight')}<b>${summit?`${clock(summit.sunrise)}—${clock(summit.sunset)}`:'—'}</b></span></div></div><div class="briefing-reasons"><small>${tr('ПОЧЕМУ','WHY')}</small><ul>${result.reasons.length?result.reasons.map(reason=>`<li>${esc(briefingReason(reason))}</li>`).join(''):`<li>${tr('Явных ограничивающих сигналов в доступных данных нет.','No clear limiting signal appears in the available data.')}</li>`}</ul></div>${result.alternative?`<a class="briefing-alt" href="${I18N.routeHref(result.alternative.id)}"><small>${tr('PLAN B / НИЖЕ НАГРУЗКА','PLAN B / LOWER LOAD')}</small><b>${esc(result.alternative.name)}</b><span>${result.alternative.hours} h · +${result.alternative.ascent} m · ${tr('без цепей','no chains')} →</span></a>`:''}</div><div class="condition-check"><div><small>${tr('РУЧНАЯ ПРОВЕРКА','MANUAL CHECK')}</small><b>${tr('Подтверди bulletin и добавь то, что видишь','Confirm the bulletin and add what you see')}</b></div><div>${observations}</div></div><div class="briefing-sources"><span>${esc(result.caveat)}</span><a href="https://tpn.gov.pl/komunikat-turystyczny" target="_blank" rel="noopener">TPN ↗</a><a href="https://topr.pl/" target="_blank" rel="noopener">TOPR ↗</a><a href="https://lawiny.topr.pl/" target="_blank" rel="noopener">AVALANCHE ↗</a></div>`;
}
function bindMorningBriefing(){
  const host=document.querySelector('#morningBriefing');host?.addEventListener('click',event=>{const dayButton=event.target.closest('[data-briefing-day]');if(dayButton){const nextDay=Number(dayButton.dataset.briefingDay);if(nextDay!==briefingDay)briefingObservations={officialRead:false,wet:false,snow:false,lowVisibility:false,groupNotReady:false};briefingDay=nextDay;renderMorningBriefing();return}const condition=event.target.closest('[data-observation]');if(condition){const key=condition.dataset.observation;briefingObservations[key]=!briefingObservations[key];renderMorningBriefing()}});
  renderMorningBriefing();
}
async function loadWeather(){try{weatherData=await fetch(`/api/weather/${route.id}`).then(r=>r.json())}catch{weatherData={days:[]}}finally{renderMorningBriefing()}}
function renderRoutePack(){
  const host=document.querySelector('#routePack');if(!host)return;
  const items=tripStore.packingList(route),checked=tripStore.getPackState(route.id),done=items.filter(item=>checked.has(item.id)).length;
  const labels={core:tr('В рюкзак','In the pack'),wear:tr('На себя','Wear'),route:tr('Добавляет маршрут','Route adds'),morning:tr('Перед выходом','Before leaving')};
  const groups=Object.keys(labels).map(category=>{const subset=items.filter(item=>item.category===category);if(!subset.length)return '';return `<section class="pack-group"><h3>${esc(labels[category])}<span>${String(subset.length).padStart(2,'0')}</span></h3>${subset.map(item=>`<label class="pack-item${checked.has(item.id)?' checked':''}"><input type="checkbox" data-pack-item="${esc(item.id)}" ${checked.has(item.id)?'checked':''}><i></i><span><b>${esc(item.label)}${item.critical?' *':''}</b><small>${esc(item.reason)}</small></span></label>`).join('')}</section>`}).join('');
  host.innerHTML=`<div class="pack-progress"><div><small>PACKED</small><b>${done} / ${items.length}</b></div><div class="pack-progress-track"><i style="width:${items.length?done/items.length*100:0}%"></i></div><button type="button" data-reset-pack>${tr('СБРОСИТЬ','RESET')}</button></div><div class="pack-groups">${groups}</div><div class="pack-note"><b>${tr('* Критичные проверки и базовые вещи.','* Critical checks and essentials.')}</b> ${tr('Список не определяет техническое снаряжение за тебя: зимой и на сложном рельефе нужны отдельные навыки, обучение и актуальная оценка условий.','This list cannot select technical equipment for you: winter and complex terrain require specific skills, training and a current assessment of conditions.')}</div>`;
  host.querySelectorAll('[data-pack-item]').forEach(input=>input.addEventListener('change',()=>{tripStore.togglePackItem(route.id,input.dataset.packItem,input.checked);renderRoutePack()}));
  host.querySelector('[data-reset-pack]')?.addEventListener('click',()=>{tripStore.clearPackState(route.id);renderRoutePack()});
}
async function loadOfficial(){try{const d=await fetch(`/api/official?route=${route.id}`).then(r=>r.json());officialData=d;const m=d.tpn?.routeMentions||[];document.querySelector('#official').innerHTML=`<strong>${d.tpn?.ok?tr('TPN получен','TPN retrieved'):tr('TPN auto-check недоступен','TPN automatic check unavailable')}</strong><p>${EN?'Open the official bulletin and read it in full before the route.':esc(d.tpn?.note||'Открой официальный источник вручную.')}</p>${m.map(x=>`<div class="mention"><b>${esc(x.alias)}</b><br>${esc(x.snippet)}</div>`).join('')}<div style="display:flex;gap:7px;flex-wrap:wrap;margin-top:12px"><a class="btn primary" target="_blank" rel="noopener" href="${d.tpn.url}">${tr('прочитать TPN','read TPN')} ↗</a><a class="btn" target="_blank" rel="noopener" href="${d.avalanche.url}">TOPR avalanche ↗</a></div>`}catch{officialData={tpn:{ok:false}};document.querySelector('#official').innerHTML=tr('Не удалось сделать auto-check. Открой TPN вручную.','The automatic check failed. Open TPN manually.')}finally{renderMorningBriefing()}}

let poiData=null,poiKind='food';
function bindPoiTabs(){document.querySelectorAll('.poi-tab').forEach(b=>b.onclick=()=>{document.querySelectorAll('.poi-tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');poiKind=b.dataset.kind;renderPois()})}
async function loadPois(){poiData=await fetch(`/api/pois/${route.id}`).then(r=>r.json());renderPois()}
function renderPois(){if(!poiData)return;const arr=poiData[poiKind]||[];document.querySelector('#poiList').innerHTML=arr.length?arr.map(p=>`<a class="poi" target="_blank" rel="noopener" href="${poiLink(p)}"><b>${esc(p.name)}</b><span>${p.distanceKm} ${tr('км от старта','km from the start')}${p.cuisine?` · ${esc(p.cuisine)}`:''}${p.openingHours?` · ${esc(p.openingHours)}`:''}</span></a>`).join(''):`<span class="loading">${tr('В OSM рядом ничего не найдено. Это не значит, что там ничего нет.','OSM returned no nearby results. That does not mean nothing is there.')}</span>`;poiLayer.clearLayers();arr.slice(0,10).forEach(p=>L.marker([p.lat,p.lon],{icon:L.divIcon({className:'',html:'<div class="poi-marker"></div>',iconSize:[15,15],iconAnchor:[7,7]})}).addTo(poiLayer).bindPopup(p.name))}
function stayType(t){return ({hotel:'hotel',guest_house:'guest house',hostel:'hostel',apartment:'apartments',chalet:'chalet',motel:'motel'})[t]||t}
async function loadStays(){
  try{const d=await fetch(`/api/stays/${route.id}`).then(r=>r.json());const z=I18N.localizeZone(d.zone);const items=d.items||[];document.querySelector('#stayBox').innerHTML=`<div class="stay-route-box"><div class="stay-tag">${esc(z.tag||'BASE')}</div><h3>${esc(z.name)}</h3><p>${esc(z.why)}</p><div class="stay-tradeoff"><b>${tr('Компромисс','Trade-off')}:</b> ${esc(z.tradeoff)}</div><div class="stay-buttons"><a class="btn acid" target="_blank" rel="noopener" href="${z.bookingUrl}">Booking.com ↗</a><a class="btn" target="_blank" rel="noopener" href="https://www.tatrytop.pl/en">TatryTop ↗</a><a class="btn" target="_blank" rel="noopener" href="https://www.zakobooking.pl/">ZAKObooking ↗</a></div></div><div class="stay-list-title">${tr('Жильё рядом с этой базой','Accommodation near this base')}</div><div class="stay-list">${items.length?items.slice(0,6).map(p=>`<div class="stay-item"><div><b>${esc(p.name)}</b><span>${esc(stayType(p.type))} · ${p.distanceKm} ${tr('км от центра зоны','km from the centre of the area')}${p.address?` · ${esc(p.address)}`:''}</span></div><a target="_blank" rel="noopener" href="${p.bookingUrl}">Booking ↗</a></div>`).join(''):`<span class="loading">${tr('OSM не вернул жильё рядом. Используй поиск по зоне выше.','OSM returned no nearby accommodation. Use the area search above.')}</span>`}</div><div class="source-note">${tr('Это не рейтинг отелей и не live-цены Booking. Мы рекомендуем район по логистике; точки жилья берём из OpenStreetMap и открываем внешний поиск Booking.','This is not a hotel ranking or live Booking pricing. The recommended area is based on logistics; accommodation points come from OpenStreetMap and open an external Booking search.')}</div>`}catch{document.querySelector('#stayBox').innerHTML=`<p>${esc(route.stay||tr('Смотри жильё ближе к старту маршрута.','Look for accommodation closer to the trailhead.'))}</p>`}
}
async function loadTrailPois(){try{const d=await fetch(`/api/trail-pois/${route.id}`).then(r=>r.json());trailPois=d.items||[]}catch{trailPois=[]}}

/* ---------------- Live Trail Mode ---------------- */
let trailMap=null,trailRouteLayer=null,trailDoneLayer=null,trailUserMarker=null,trailAccuracyCircle=null,trailWatchId=null;
let trailLengths=[],trailTotalM=0,trailHeading=null,trailState={lastProgress:null,reachedObjective:false,returning:false,lastStatus:null,demoIndex:0};
function bindTrailLaunch(){const button=document.querySelector('#openTrailMode');if(button)button.onclick=openTrailMode}
function trailOverlayHtml(){
  const obj=route.objective||{name:route.goal||route.end,altitude:route.maxAlt};
  const homeNavigation=!EN&&HOME_BASE?`<div class="trail-nav-group"><span>GET HOME</span><a target="_blank" rel="noopener" href="${googleDirections(HOME_BASE.lat,HOME_BASE.lon,'driving')}">Google ↗</a><a target="_blank" rel="noopener" href="${appleDirections(HOME_BASE.lat,HOME_BASE.lon,'d')}">Apple ↗</a></div>`:'';
  return `<div class="trail-overlay" id="trailOverlay" aria-hidden="true"><div class="trail-topbar"><button id="closeTrailMode">← EXIT</button><div><small>LIVE TRAIL MODE</small><b>${esc(route.name)}</b></div><div class="trail-top-status"><span id="trailGpsStatus">GPS OFF</span><span id="trailCompassStatus">COMPASS OFF</span></div></div>
    <div class="trail-alert idle" id="trailAlert"><b>READY</b><span>${tr('Запусти GPS или используй DEMO для проверки интерфейса.','Start GPS or use DEMO to test the interface.')}</span></div>
    <div class="trail-dashboard"><div><small>${tr('Прогресс','Progress')}</small><b id="trailProgress">—</b><span id="trailRemaining">— ${tr('км осталось','km remaining')}</span></div><div><small>${tr('До цели','To objective')}</small><b id="trailObjective">—</b><span>${esc(obj.name)} · ${obj.altitude} ${tr('м','m')}</span></div><div><small>${tr('Ближайший POI','Nearest POI')}</small><b id="trailPoiDistance">—</b><span id="trailPoiName">${tr('загружаю точки…','loading points…')}</span></div><div><small>GPS</small><b id="trailAccuracy">—</b><span id="trailHeading">heading —</span></div></div>
    <div class="trail-map-wrap"><div id="trailMap" class="trail-map"></div><div class="trail-map-key"><span><i class="key-user"></i>${tr('ты','you')}</span><span><i class="key-done"></i>${tr('пройдено','completed')}</span><span><i class="key-route"></i>${tr('трек','track')}</span></div></div>
    <div class="trail-actions"><button class="trail-action primary" id="startGps">START GPS</button><button class="trail-action" id="startCompass">COMPASS</button><button class="trail-action" id="recenterTrail">RECENTER</button><button class="trail-action demo" id="demoTrail">DEMO +</button></div>
    <div class="trail-bottom${EN?' no-home':''}"><div class="trail-nav-group"><span>GET TO START</span><a target="_blank" rel="noopener" href="${googleDirections(route.startLat,route.startLon,'walking')}">Google ↗</a><a target="_blank" rel="noopener" href="${appleDirections(route.startLat,route.startLon,'w')}">Apple ↗</a></div>${homeNavigation}<div class="trail-caveat">${tr('Не turn-by-turn гарантия. Следуй официальной маркировке на местности. GPS в горах может ошибаться; интерфейс всегда показывает reported accuracy.','Not a turn-by-turn guarantee. Follow official trail markings. Mountain GPS can be inaccurate; the interface always shows reported accuracy.')}</div></div>
  </div>`;
}
function openTrailMode(){
  if(route.temporarilyClosed)return;
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
  if(!EN&&window.TatryMapPoints)window.TatryMapPoints.addHomeMarker(trailMap);
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
  const obj={name:(route.objective?.name||route.goal||tr('Цель','Objective')),kind:'objective',lat:route.summitLat,lon:route.summitLon};
  const finishCoords=geometryData?.geometry?.coordinates?.at(-1);const finish=finishCoords?{name:route.finish||tr('Финиш','Finish'),kind:'finish',lat:finishCoords[1],lon:finishCoords[0]}:null;
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
  document.querySelector('#trailProgress').textContent=`${Math.round(pct)}%`;document.querySelector('#trailRemaining').textContent=`${(remaining/1000).toFixed(1)} ${tr('км осталось','km remaining')}`;
  document.querySelector('#trailObjective').textContent=objectiveDist<1000?`${Math.round(objectiveDist)} ${tr('м','m')}`:`${(objectiveDist/1000).toFixed(1)} ${tr('км','km')}`;
  document.querySelector('#trailPoiDistance').textContent=poi?(poi.distanceM<1000?`${Math.round(poi.distanceM)} ${tr('м','m')}`:`${(poi.distanceM/1000).toFixed(1)} ${tr('км','km')}`):'—';document.querySelector('#trailPoiName').textContent=poi?poi.name:tr('нет POI','no POI');
  document.querySelector('#trailAccuracy').textContent=demo?'DEMO':accuracy?`±${Math.round(accuracy)} ${tr('м','m')}`:'—';
  const ll=[pos.lat,pos.lon];if(!trailUserMarker)trailUserMarker=L.marker(ll,{icon:trailUserIcon(trailHeading||0),zIndexOffset:2000}).addTo(trailMap);else{trailUserMarker.setLatLng(ll);trailUserMarker.setIcon(trailUserIcon(trailHeading||0))}
  if(accuracy){if(!trailAccuracyCircle)trailAccuracyCircle=L.circle(ll,{radius:accuracy,color:'#2979ff',weight:1,fillColor:'#2979ff',fillOpacity:.08}).addTo(trailMap);else{trailAccuracyCircle.setLatLng(ll);trailAccuracyCircle.setRadius(accuracy)}}
  updateDoneLine(nearest.progress);
  if(!demo&&accuracy>90)setTrailAlert('caution','GPS WEAK',EN?`Reported accuracy is about ±${Math.round(accuracy)} m. Do not judge an off-route position from this fix.`:`Точность около ±${Math.round(accuracy)} м. Не делай вывод об отклонении по такой позиции.`);
  else{const warn=Math.max(40,accuracy*1.35),danger=Math.max(90,accuracy*1.8);if(nearest.dist>danger)setTrailAlert('danger','OFF ROUTE',EN?`About ${Math.round(nearest.dist)} m to the track. Stop and check official markings.`:`До трека примерно ${Math.round(nearest.dist)} м. Остановись и сверяйся с официальной маркировкой.`);else if(nearest.dist>warn)setTrailAlert('caution','CHECK ROUTE',EN?`You are about ${Math.round(nearest.dist)} m from the line. Check the junction and markings.`:`Ты примерно в ${Math.round(nearest.dist)} м от линии. Проверь развилку и маркировку.`);else setTrailAlert('good',demo?'DEMO · ON ROUTE':'ON ROUTE',EN?`About ${Math.round(nearest.dist)} m to the route line${trailState.returning?' · returning':''}.`:`До линии маршрута около ${Math.round(nearest.dist)} м${trailState.returning?' · возвращение':''}.`)}
}
function startGps(){
  const status=document.querySelector('#trailGpsStatus');if(!window.isSecureContext){status.textContent='HTTPS NEEDED';setTrailAlert('caution','GPS LOCKED',tr('На iPhone локальная HTTP-ссылка по Wi‑Fi не является secure context. Для настоящего GPS задеплой сайт на HTTPS; пока используй DEMO.','A local HTTP link over Wi-Fi is not a secure context on iPhone. Real GPS requires an HTTPS deployment; use DEMO for now.'));return}
  if(!navigator.geolocation){status.textContent='NO GPS';setTrailAlert('danger','GPS UNAVAILABLE',tr('Браузер не предоставляет Geolocation API.','The browser does not provide the Geolocation API.'));return}
  if(trailWatchId!==null){navigator.geolocation.clearWatch(trailWatchId);trailWatchId=null}
  status.textContent='GPS STARTING';trailWatchId=navigator.geolocation.watchPosition(p=>{status.textContent='GPS LIVE';const c=p.coords;updateTrailLocation({lat:c.latitude,lon:c.longitude},{accuracy:c.accuracy||0});if(trailUserMarker&&!trailState.didFirstCenter){trailMap.setView(trailUserMarker.getLatLng(),17);trailState.didFirstCenter=true}},e=>{status.textContent='GPS ERROR';setTrailAlert('danger','GPS ERROR',e.message||tr('Не удалось получить геопозицию.','Could not obtain a position.'))},{enableHighAccuracy:true,maximumAge:2000,timeout:15000})
}
function orientationHandler(e){let h=null;if(Number.isFinite(e.webkitCompassHeading))h=e.webkitCompassHeading;else if(Number.isFinite(e.alpha))h=(360-e.alpha)%360;if(h===null)return;trailHeading=h;const el=document.querySelector('#trailHeading');if(el)el.textContent=`heading ${Math.round(h)}°`;const st=document.querySelector('#trailCompassStatus');if(st)st.textContent=`${Math.round(h)}°`;if(trailUserMarker)trailUserMarker.setIcon(trailUserIcon(h))}
async function startCompass(){
  const st=document.querySelector('#trailCompassStatus');if(!window.isSecureContext){st.textContent='HTTPS NEEDED';setTrailAlert('caution','COMPASS LOCKED',tr('Датчики ориентации требуют secure context. После HTTPS-публикации кнопка запросит разрешение на iPhone.','Orientation sensors require a secure context. After an HTTPS deployment the button can request permission on iPhone.'));return}
  try{if(typeof DeviceOrientationEvent!=='undefined'&&typeof DeviceOrientationEvent.requestPermission==='function'){const r=await DeviceOrientationEvent.requestPermission();if(r!=='granted')throw new Error(tr('Разрешение на компас не выдано.','Compass permission was not granted.'))}window.removeEventListener('deviceorientation',orientationHandler);window.addEventListener('deviceorientation',orientationHandler,true);st.textContent='COMPASS LIVE'}catch(e){st.textContent='COMPASS ERROR';setTrailAlert('caution','COMPASS ERROR',e.message||tr('Не удалось включить компас.','Could not start the compass.'))}
}
function demoTrail(){
  if(!geometryData?.geometry)return;const seq=[.05,.22,.44,.52,.68,.88];const frac=seq[trailState.demoIndex%seq.length];trailState.demoIndex++;let p=pointAtProgress(trailTotalM*frac);if(trailState.demoIndex%7===0)p={lat:p.lat+.0011,lon:p.lon};updateTrailLocation(p,{accuracy:8,demo:true});trailMap.setView([p.lat,p.lon],17)
}

async function boot(){
  const [data,zonesData]=await Promise.all([fetch('/api/routes').then(r=>r.json()),fetch('/api/stay-zones').then(r=>r.json())]);
  routes=I18N.localizeRoutes(data.routes);stayZones=I18N.localizeZones(zonesData.zones||[]);route=routes.find(r=>r.id===id);
  const languageSwitch=document.querySelector('#routeLanguageSwitch');if(languageSwitch)languageSwitch.href=EN?`/route/${id}`:`/en/route/${id}`;
  if(!route){document.querySelector('#routeApp').innerHTML=`<section class="route-hero"><h1>${tr('Маршрут не найден','Route not found')}</h1></section>`;return}
  if(FIELD_MAPS[route.id])FIELD_MAPS[route.id]=I18N.localizeFieldMap(FIELD_MAPS[route.id],route);
  renderBase();await Promise.allSettled([loadOfficial(),loadWeather(),loadPois(),loadStays(),loadTrailPois()]);
}
window.addEventListener('tatry:saved-routes',()=>syncSavedRoute());
window.addEventListener('tatry:trip-profile',()=>{if(!route)return;document.querySelector('.route-personal-fit')?.replaceWith((()=>{const template=document.createElement('template');template.innerHTML=personalRouteMarkup();return template.content.firstElementChild})());renderMorningBriefing()});
boot().catch(err=>{console.error(err);document.querySelector('#routeApp').innerHTML=`<section class="route-hero"><h1>${tr('Не удалось загрузить маршрут','Could not load the route')}</h1><p>${tr('Обнови страницу. Если ошибка повторяется — map library не загрузилась.','Refresh the page. If the error repeats, the map library may not have loaded.')}</p></section>`;});
