const I18N=window.TatryI18n||{isEnglish:false,tr:(ru)=>ru,routeHref:id=>`/route/${id}`,localizeRoutes:value=>value,localizeZones:value=>value};
const EN=I18N.isEnglish;
const tr=I18N.tr;
const LEVELS=EN?{1:'WELLNESS CORE',2:'MY SALOMONS, WHERE THEY BELONG',3:'KNEES ARE NOTICING',4:'DON’T LOOK DOWN IN ANGER',5:'CALL THE HELICOPTER'}:{1:'WELLNESS CORE',2:'МОИ SALOMON ТАМ, ГДЕ ИМ МЕСТО',3:'КОЛЕНИ ПОБАЛИВАЮТ',4:'DON’T LOOK DOWN IN ANGER',5:'ВЫЗЫВАЙТЕ ВЕРТОЛЁТ'};
const TOPO_URL='https://tile.opentopomap.org/{z}/{x}/{y}.png';
const TOPO_ATTR='Map data © OpenStreetMap contributors · Map style © OpenTopoMap (CC-BY-SA)';
const HOME_BASE=window.TatryMapPoints?.home||null;
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
const tripStore=window.TatryTrip;
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
  if(!EN&&window.TatryMapPoints)window.TatryMapPoints.addHomeMarker(contextLayer);
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
function fmtCrowd(v){return v==='low'?tr('низко','low'):v==='med'?tr('средне','medium'):tr('много','high')}
function returnClass(score){return score>=5?'excellent':score>=4?'good':'caution'}
function kindLabel(r){return r.routeKind==='height'?tr('ЦЕЛЬ: ВЫСОТА','SUMMIT / ALTITUDE'):tr('ПРОСТО ХАЙК','HIKING DAY')}
function routeStatusMarkup(route){
  if(route.temporarilyClosed)return `<span class="route-status closed">${tr('TPN: ЗАКРЫТО ДО ОТМЕНЫ','TPN: CLOSED UNTIL FURTHER NOTICE')}</span>`;
  if(route.safetyNotice)return `<span class="route-status expert">${tr('EXPERT / УСЛОВИЯ РЕШАЮТ','ADVANCED / CONDITIONS DECIDE')}</span>`;
  return '';
}
function routePhotoPair(photos=[]){
  const pair=photos.slice(0,2);
  if(!pair.length)return '';
  return `<div class="route-photo-pair" aria-label="${tr('Фотографии маршрута','Route photos')}">${pair.map((photo,i)=>`<div class="route-card-photo ${i===0?'primary':'secondary'}"><img loading="lazy" decoding="async" referrerpolicy="no-referrer" src="${esc(photo.src)}" alt="${esc(photo.alt)}"><span>${esc(photo.title)}</span></div>`).join('')}</div>`;
}
function personalFitMarkup(route){
  const fit=tripStore.personalizedDifficulty(route);
  return `<div class="personal-fit ${fit.status}"><span>${tr('ДЛЯ ТЕБЯ','FOR YOU')}</span><b>${fit.status==='unknown'?'—':`${fit.score}/5`} · ${esc(fit.label)}</b><small>${fit.gaps.length?esc(fit.gaps[0]):esc(fit.note||tr('Параметры совпадают с привычной нагрузкой.','The route fits your usual range.'))}</small></div>`;
}
function routeCard(r,i,savedSet=new Set()){
  const objective=r.objective||{name:r.goal||r.end,altitude:r.maxAlt};
  const ret=r.returnToZakopane||{};
  const isSaved=savedSet.has(r.id);
  return `<article class="route-card${isSaved?' saved':''}" data-id="${r.id}">
    <a class="route-card-link" href="${I18N.routeHref(r.id)}">
      <div class="route-head"><div><div class="route-number">${String(i+1).padStart(2,'0')} / ${String(routes.length).padStart(2,'0')}</div><h2 class="route-title">${esc(r.name)}</h2><div class="route-short">${esc(r.short)}</div></div><div class="trail-ready-pill${r.temporarilyClosed?' closed':''}">${r.temporarilyClosed?'CLOSED BY TPN':'TRAIL MODE →'}</div></div>
      ${routePhotoPair(r.photos)}
      <div class="route-flags">${routeStatusMarkup(r)}<span class="route-kind ${r.routeKind}">${kindLabel(r)}</span><span class="objective-chip">${esc(objective.name)} · ${objective.altitude} ${tr('м','m')}</span><span class="return-chip ${returnClass(ret.score)}">↩ Zakopane ${ret.score||'—'}/5</span></div>
      <div class="metrics"><div class="metric"><small>${tr('Время','Time')}</small><b>${r.hours} ${tr('ч','h')}</b></div><div class="metric"><small>${tr('Дистанция','Distance')}</small><b>${r.km} ${tr('км','km')}</b></div><div class="metric"><small>${tr('Набор','Ascent')}</small><b>+${r.ascent} ${tr('м','m')}</b></div><div class="metric"><small>${tr('Уровень','Level')}</small><b>${r.diff}/5</b></div><div class="metric"><small>${tr('Цепи','Chains')}</small><b>${r.chains?tr('да','yes'):tr('нет','no')}</b></div><div class="metric"><small>${tr('Толпы','Crowds')}</small><b>${fmtCrowd(r.crowd)}</b></div></div>${personalFitMarkup(r)}
      <div class="tags"><span class="tag">${LEVELS[r.diff]}</span>${r.tags.map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div>
    </a>
    <button type="button" class="route-save-btn${isSaved?' saved':''}" data-save-route="${r.id}" aria-pressed="${isSaved}" aria-label="${isSaved?tr('Убрать из сохранённых','Remove from saved routes'):tr('Сохранить для сравнения','Save for comparison')}: ${esc(r.name)}">${isSaved?tr('СОХРАНЕНО ✓','SAVED ✓'):tr('СОХРАНИТЬ +','SAVE +')}</button>
  </article>`;
}
function render(){
  const list=routes.filter(visible);
  const selected=new Set(savedStore?.get()||[]);
  $('#count').textContent=`${list.length} / ${routes.length}`;
  $('#routeList').innerHTML=list.length?list.map((route,index)=>routeCard(route,index,selected)).join(''):`<div class="empty">${tr('Ничего не подходит. Сбрось один фильтр — горы не обязаны проходить кастинг.','No route matches. Remove one filter — the mountains do not need to pass an audition.')}</div>`;
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
    if(!result.ok)showCompareNotice(tr('Максимум — три маршрута. Убери один, чтобы добавить другой.','The limit is three routes. Remove one before adding another.'));
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
    button.setAttribute('aria-label',`${isSaved?tr('Убрать из сохранённых','Remove from saved routes'):tr('Сохранить для сравнения','Save for comparison')}: ${route?.name||tr('маршрут','route')}`);
    button.textContent=isSaved?tr('СОХРАНЕНО ✓','SAVED ✓'):tr('СОХРАНИТЬ +','SAVE +');
    button.closest('.route-card')?.classList.toggle('saved',isSaved);
  });
  const tray=$('#compareTray');
  if(!tray)return;
  tray.hidden=!ids.length;
  document.body.classList.toggle('has-compare-tray',Boolean(ids.length));
  $('#compareTrayCount').textContent=`${ids.length} / ${savedStore.max}`;
  $('#compareTrayHint').textContent=ids.length<2?tr('Сохрани ещё один маршрут','Save one more route'):ids.length<savedStore.max?tr('Можно добавить ещё один','You can add one more'):tr('Три маршрута — максимум','Three routes is the limit');
  $('#compareTrayRoutes').innerHTML=savedRoutes().map(route=>`<button type="button" class="compare-route-chip" data-remove-saved="${route.id}" aria-label="${tr('Убрать','Remove')} ${esc(route.name)}">${esc(route.name)} <span>×</span></button>`).join('');
  $('#openCompare').disabled=ids.length<2;
  $('#openCompare').textContent=ids.length>=2?`${tr('Сравнить','Compare')} ${ids.length}`:tr('Сравнить','Compare');
  const voteButton=$('#openGroupVote');if(voteButton)voteButton.disabled=ids.length<2;
  window.TatryGroupVote?.refreshShortlist();
  if($('#compareOverlay')?.classList.contains('open'))renderCompareContent();
}
function compareRows(){
  return [
    [tr('Формат','Format'),route=>kindLabel(route)],
    [tr('Время','Time'),route=>`${route.hours} ${tr('ч','h')}`],
    [tr('Дистанция','Distance'),route=>`${route.km} ${tr('км','km')}`],
    [tr('Набор','Ascent'),route=>`+${route.ascent} ${tr('м','m')}`],
    [tr('Макс. высота','Max altitude'),route=>`${route.maxAlt} ${tr('м','m')}`],
    [tr('Сложность','Difficulty'),route=>`${route.diff}/5 · ${LEVELS[route.diff]}`],
    [tr('Для тебя','For you'),route=>{const fit=tripStore.personalizedDifficulty(route);return fit.status==='unknown'?tr('Заполни профиль','Complete the profile'):`${fit.score}/5 · ${fit.label}${fit.gaps[0]?` · ${fit.gaps[0]}`:''}`}],
    [tr('Цепи','Chains'),route=>route.chains?tr('Да','Yes'):tr('Нет','No')],
    [tr('Толпы','Crowds'),route=>fmtCrowd(route.crowd)],
    [tr('Статус','Status'),route=>route.temporarilyClosed?tr('TPN: закрыто до отмены','TPN: closed until further notice'):route.safetyNotice?tr('Экспертный маршрут · только по условиям','Advanced route · conditions decide'):tr('Проверь свежий TPN','Check the current TPN bulletin')],
    [tr('Старт','Start'),route=>route.start],
    [tr('Главная цель','Main objective'),route=>`${route.objective?.name||route.goal||route.end} · ${route.objective?.altitude||route.maxAlt} ${tr('м','m')}`],
    [tr('Обратно в Zakopane','Return to Zakopane'),route=>`${route.returnToZakopane?.score||'—'}/5 · ${route.returnToZakopane?.label||''}${route.returnToZakopane?.typicalTime?` · ${route.returnToZakopane.typicalTime}`:''}`],
    [tr('Почему идти','Why go'),route=>route.experience?.whyGo?.text||route.why],
    [tr('Главный компромисс','Main trade-off'),route=>route.experience?.tradeOffs?.[0]||route.risks?.[0]||'—'],
    [tr('Где жить','Where to stay'),route=>route.stay||'—']
  ];
}
function renderCompareContent(){
  const selected=savedRoutes();
  const content=$('#compareContent');
  if(!content)return;
  if(selected.length<2){content.innerHTML=`<div class="compare-empty">${tr('Для сравнения нужны хотя бы два маршрута.','At least two routes are needed for comparison.')}</div>`;return}
  const heads=selected.map((route,index)=>`<div class="compare-route-head"><span>${String(index+1).padStart(2,'0')}</span><h3>${esc(route.name)}</h3><button type="button" data-compare-remove="${route.id}">${tr('Убрать','Remove')}</button><a href="${I18N.routeHref(route.id)}">${tr('Открыть маршрут →','Open route →')}</a></div>`).join('');
  const rows=compareRows().map(([label,value])=>`<div class="compare-row"><div class="compare-label">${esc(label)}</div>${selected.map(route=>`<div class="compare-value">${esc(value(route))}</div>`).join('')}</div>`).join('');
  content.innerHTML=`<div class="compare-table" style="--compare-count:${selected.length}"><div class="compare-row compare-route-row"><div class="compare-label">${tr('Маршруты','Routes')}</div>${heads}</div>${rows}</div>`;
}
function openCompare(){
  if(savedRoutes().length<2){showCompareNotice(tr('Сохрани хотя бы два маршрута для сравнения.','Save at least two routes to compare them.'));return}
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
  if(list.length){const bounds=L.latLngBounds(list.map(r=>[r.startLat,r.startLon]));if(!EN&&HOME_BASE)bounds.extend([HOME_BASE.lat,HOME_BASE.lon]);if(bounds.isValid())map.fitBounds(bounds.pad(.15),{animate:false,maxZoom:11})}
}
function removePreviewLayers(){
  if(activeOutline){map.removeLayer(activeOutline);activeOutline=null}
  if(activeLine){map.removeLayer(activeLine);activeLine=null}
}
function fitOverview(){
  const list=routes.filter(visible);
  if(!list.length)return;
  const bounds=L.latLngBounds(list.map(r=>[r.startLat,r.startLon]));
  if(!EN&&HOME_BASE)bounds.extend([HOME_BASE.lat,HOME_BASE.lon]);
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
    const b=activeLine.getBounds();if(!EN&&HOME_BASE)b.extend([HOME_BASE.lat,HOME_BASE.lon]);map.fitBounds(b.pad(.13),{maxZoom:12});
  }catch{}
}

function stayCard(z){
  const routeNames=(z.routes||[]).map(id=>routes.find(r=>r.id===id)?.name).filter(Boolean).slice(0,4);
  return `<article class="stay-card">
    <div class="stay-tag">${esc(z.tag||'BASE')}</div><h3>${esc(z.name)}</h3><p class="stay-short">${esc(z.short)}</p>
    <div class="stay-copy"><b>${tr('Лучше всего:','Best for:')}</b> ${esc(z.bestFor)}</div>
    <div class="stay-copy muted"><b>${tr('Компромисс:','Trade-off:')}</b> ${esc(z.tradeoff)}</div>
    ${routeNames.length?`<div class="stay-route-list">${routeNames.map(n=>`<span>${esc(n)}</span>`).join('')}</div>`:''}
    <a class="btn" target="_blank" rel="noopener" href="${z.bookingUrl}">${tr('Искать жильё ↗','Search accommodation ↗')}</a>
  </article>`;
}
function renderStayZones(){if($('#stayZones'))$('#stayZones').innerHTML=stayZones.map(stayCard).join('')}
function localIso(offset=0){const d=new Date();d.setDate(d.getDate()+offset);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function tripDateLabel(value){try{return new Intl.DateTimeFormat(EN?'en-GB':'ru-RU',{weekday:'short',day:'numeric',month:'short'}).format(new Date(`${value}T12:00:00`))}catch{return value}}
function profileFromForm(){
  const form=$('#tripProfileForm');
  return {configured:true,maxHours:Number(form.elements.maxHours.value),maxAscent:Number(form.elements.maxAscent.value),chains:form.elements.chains.value,exposure:form.elements.exposure.value};
}
function fillProfileForm(){
  const form=$('#tripProfileForm'),profile=tripStore.getProfile();if(!form)return;
  form.elements.maxHours.value=String(profile.maxHours);form.elements.maxAscent.value=String(profile.maxAscent);form.elements.chains.value=profile.chains;form.elements.exposure.value=profile.exposure;
  $('#tripProfileStatus').textContent=profile.configured?tr('Профиль сохранён. Карточки уже пересчитаны.','Profile saved. Route cards are already personalised.'):tr('Пока используем осторожные значения по умолчанию.','Conservative defaults are currently in use.');
}
function populateTripZones(){
  const select=$('#tripZoneSelect');if(!select)return;
  select.innerHTML=stayZones.map(zone=>`<option value="${esc(zone.id)}">${esc(zone.name)}</option>`).join('');
}
function updateTripSavedHint(){const hint=$('#tripSavedHint');if(hint)hint.textContent=`${tr('Сохранённые маршруты в приоритете','Saved routes prioritised')}: ${savedStore?.get().length||0}`}
function tripRouteMeta(route){return `${route.hours} ${tr('ч','h')} · ${route.km} ${tr('км','km')} · +${route.ascent} ${tr('м','m')} · ${route.chains?tr('цепи','chains'):tr('без цепей','no chains')}`}
function activeDaysLabel(count){return EN?`${count} active ${count===1?'day':'days'}`:count===2||count===3||count===4?`${count} активных дня`:`${count} активных дней`}
function renderTripPlan(plan=tripStore.getTrip()){
  const host=$('#tripPlan');if(!host)return;
  if(!plan?.days?.length){host.innerHTML=`<div class="trip-plan-empty"><span>03 / YOUR DAYS</span><b>${tr('Заполни профиль и нажми «Собрать поездку».','Complete the profile and select “Build the trip”.')}</b><p>${tr('Plan B здесь означает менее сложный и менее экспонированный маршрут. Это не погодная рекомендация заранее.','Plan B means a less exposed and less demanding route. It is not a weather forecast made in advance.')}</p></div>`;return}
  const zone=stayZones.find(item=>item.id===plan.zoneId);
  const rhythm=(EN?{balanced:'balanced effort',scenic:'maximum scenery',ambitious:'ambitious'}:{balanced:'баланс нагрузки',scenic:'максимум видов',ambitious:'амбициозно'})[plan.rhythm]||plan.rhythm;
  const cards=plan.days.map((day,index)=>{
    const primary=routes.find(route=>route.id===day.primaryId),backup=routes.find(route=>route.id===day.backupId);if(!primary)return '';
    const fit=tripStore.personalizedDifficulty(primary);
    return `<article class="trip-day-card"><div class="trip-day-index"><span>DAY ${String(index+1).padStart(2,'0')}</span><b>${esc(tripDateLabel(day.date))}</b></div><div class="trip-primary"><small>${tr('PRIMARY / ПРИ ХОРОШИХ УСЛОВИЯХ','PRIMARY / IN GOOD CONDITIONS')}</small><h3><a href="${I18N.routeHref(primary.id)}">${esc(primary.name)} →</a></h3><p>${esc(tripRouteMeta(primary))}</p><div class="trip-fit ${fit.status}">${fit.score}/5 ${tr('для тебя','for you')} · ${esc(fit.label)}</div></div><div class="trip-backup"><small>${tr('PLAN B / НИЖЕ РИСК И НАГРУЗКА','PLAN B / LOWER RISK AND EFFORT')}</small>${backup?`<h4><a href="${I18N.routeHref(backup.id)}">${esc(backup.name)} →</a></h4><p>${esc(tripRouteMeta(backup))}</p>`:`<h4>${tr('Свободный / восстановительный день','Free / recovery day')}</h4><p>${tr('Подходящий более лёгкий дубль не найден.','No suitable lower-effort alternative was found.')}</p>`}</div></article>`;
  }).join('');
  host.innerHTML=`<header class="trip-plan-head"><div><span>03 / YOUR DAYS</span><h3>${activeDaysLabel(plan.days.length)} · ${esc(zone?.name||tr('база не выбрана','base not selected'))}</h3><p>${esc(rhythm)} · ${plan.car?tr('с машиной','with a car'):tr('без машины','without a car')} · ${tr('план не использует ранний прогноз','the plan does not rely on an early forecast')}</p></div><button type="button" data-clear-trip>${tr('ОЧИСТИТЬ','CLEAR')}</button></header><div class="trip-days">${cards}</div><footer class="trip-plan-note"><b>${tr('Почему Plan B не равен прогнозу:','Why Plan B is not a forecast:')}</b> ${tr('он заранее уменьшает сложность, экспозицию и нагрузку. Утром всё равно открой конкретный маршрут — там briefing пересчитает решение по свежей погоде, TPN и фактическим условиям.','it lowers difficulty, exposure and effort in advance. Open the chosen route again on the morning: its briefing uses fresh weather, TPN information and observed conditions.')}</footer>`;
}
function initTripStudio(){
  fillProfileForm();populateTripZones();updateTripSavedHint();
  const builder=$('#tripBuilderForm');builder.elements.startDate.min=localIso(0);builder.elements.startDate.value=tripStore.getTrip()?.startDate||localIso(1);
  if(tripStore.getTrip()){const plan=tripStore.getTrip();builder.elements.days.value=String(plan.days.length);builder.elements.zoneId.value=plan.zoneId;builder.elements.rhythm.value=plan.rhythm;builder.elements.car.checked=Boolean(plan.car)}
  renderTripPlan();
  $('#tripProfileForm').addEventListener('submit',event=>{event.preventDefault();tripStore.setProfile(profileFromForm());$('#tripProfileStatus').textContent=tr('Сохранено. Все маршруты пересчитаны под этот диапазон.','Saved. Every route has been recalculated for this range.');render();renderTripPlan()});
  builder.addEventListener('submit',event=>{event.preventDefault();let profile=tripStore.getProfile();if(!profile.configured){profile=tripStore.setProfile(profileFromForm());$('#tripProfileStatus').textContent=tr('Профиль сохранён вместе с поездкой.','The profile was saved with the trip.')}const plan=tripStore.generateTrip(routes,{startDate:builder.elements.startDate.value,days:Number(builder.elements.days.value),zoneId:builder.elements.zoneId.value,rhythm:builder.elements.rhythm.value,car:builder.elements.car.checked},profile,savedStore?.get()||[],stayZones);tripStore.setTrip(plan);render();renderTripPlan(plan);hostScroll()});
  $('#tripPlan').addEventListener('click',event=>{if(event.target.closest('[data-clear-trip]')){tripStore.clearTrip();renderTripPlan(null)}});
}
function hostScroll(){const plan=$('#tripPlan');if(plan&&window.matchMedia('(max-width: 760px)').matches)plan.scrollIntoView({behavior:'smooth',block:'start'})}
async function loadOfficial(){try{const d=await fetch('/api/official').then(r=>r.json());$('#officialState').textContent=d.tpn?.ok?'TPN online':'link only';$('#officialText').textContent=d.tpn?.ok?tr('TPN отвечает. Проверяй официальный текст ближе к дате и ещё раз утром перед стартом.','TPN is responding. Read the official text near the trip date and again on the morning of the route.'):tr('Не удалось прочитать TPN автоматически — используй официальный линк.','The TPN bulletin could not be read automatically — use the official link.')}catch{$('#officialState').textContent='link only'}}
async function boot(){
  initMap();
  const [rd,sd]=await Promise.all([fetch('/api/routes').then(r=>r.json()),fetch('/api/stay-zones').then(r=>r.json())]);
  routes=I18N.localizeRoutes(rd.routes);stayZones=I18N.localizeZones(sd.zones||[]);renderStayZones();render();initTripStudio();window.TatryGroupVote?.init({routes,savedStore});
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
window.addEventListener('tatry:saved-routes',()=>{syncSavedUi();updateTripSavedHint()});
window.addEventListener('tatry:trip-profile',()=>{if(routes.length)render()});
boot().catch(err=>{console.error(err);const el=document.querySelector('#routeList');if(el)el.innerHTML=`<div class="empty"><b>${tr('Не удалось запустить карту.','The map could not start.')}</b><br>${tr('Обнови страницу. Если ошибка повторяется — map library не загрузилась.','Refresh the page. If the error repeats, the map library did not load.')}</div>`;});
