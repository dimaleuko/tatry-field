(function(){
  'use strict';
  const lang=document.documentElement.lang==='en'?'en':'ru';
  const isEnglish=lang==='en';
  const routeCopy=window.TATRY_EN_ROUTE_COPY||{};
  const zoneCopy=window.TATRY_EN_ZONE_COPY||{};
  const tr=(ru,en)=>isEnglish?en:ru;
  const routeHref=id=>`${isEnglish?'/en':''}/route/${id}`;
  const homeHref=hash=>`${isEnglish?'/en/':'/'}${hash||''}`;

  function gearFor(route){
    const items=['1.5–2 L of water, plus a reserve','Food for the day and an emergency snack','Waterproof shell and a warm layer','Offline map, full power bank and headlamp','Small first-aid kit and personal medication'];
    if(route.hours>=8)items.push('Extra dry layer and additional food for a long return');
    if(route.chains)items.push('Durable gloves for chains and artificial aids');
    if(route.exposure==='high'||route.diff>=4)items.push('Emergency blanket, whistle and a strict turnaround time');
    return items;
  }
  function stayFor(route){
    const zone=zoneCopy[route.stayZone];
    return zone?`${route.stayZone==='bukowina-jurgow'?'Bukowina / Jurgów':route.stayZone==='koscielisko-kiry'?'Kościelisko / Kiry':route.stayZone==='bystre-kuznice'?'Bystre / Kuźnice':route.stayZone==='cyrhla-east'?'Cyrhla / Jaszczurówka':'Central Zakopane'} — ${zone.short}`:'Choose a base with a reliable early transfer to the trailhead.';
  }
  function transportFor(route){
    const start=route.start||'the trailhead';
    return `Confirm the current public transport connection from Zakopane to ${start}. Start early and check the final return service before leaving.`;
  }
  function parkingFor(route){return `If driving, verify the current parking rules and reservation requirements near ${route.start||'the trailhead'} before the trip.`}
  function bestFor(value=''){
    if(!isEnglish)return value;
    const source=String(value);
    if(/ЗАКРЫТО ДО ОТМЕНЫ/i.test(source))return 'CLOSED UNTIL FURTHER NOTICE; after reopening, only in dry, snow-free conditions';
    if(/круглый год/i.test(source))return 'Year-round when trail conditions are suitable';
    if(/апрель[–-]ноябрь/i.test(source))return `April–November${/зим/i.test(source)?'; in winter only on a safe surface':''}`;
    if(/сухой бесснежный летний день/i.test(source))return `A dry, snow-free summer day${/стабильн/i.test(source)?' with a stable forecast':''}${/TPN/i.test(source)?'; subject to current TPN notices':''}`;
    if(/сухо, без снега в желобе/i.test(source))return 'Dry, with no snow in the gully and stable visibility';
    if(/длинный сухой день/i.test(source))return 'A long dry day without snow or low cloud';
    return source.replace('май','May').replace('июнь','June').replace('июль','July').replace('август','August').replace('сентябрь','September').replace('октябрь','October').replace('зима','winter').replace('при сухих стабильных условиях','in dry, stable conditions').replace('при сухой скале','with dry rock').replace('только сухая устойчивая погода','only in dry, stable weather').replace('при сухом бесснежном склоне','with a dry, snow-free slope').replace('при бесснежной тропе и устойчивом прогнозе','with a snow-free trail and stable forecast').replace('сухо и без снега','dry and snow-free').replace('при стабильной погоде','in stable weather').replace('в грязный сезон медленнее','slower in muddy seasons');
  }
  function returnCopy(value={}){
    const labels={1:'Difficult return logistics',2:'Plan the return carefully',3:'Manageable with planning',4:'Easy, but allow extra time',5:'Very straightforward'};
    const typicalTime=String(value.typicalTime||'').replace('мин','min').replace('логистики','of logistics').replace('на машине','by car').replace('после финиша','after the finish');
    return {...value,label:labels[value.score]||'Check the return logistics',typicalTime,note:'Return time depends on traffic, queues and the current timetable. Check the last practical connection before starting.'};
  }
  function terrainLabel(label=''){
    const value=String(label).toLowerCase();
    if(/асфальт|дорог/.test(value))return 'Road / paved access';
    if(/лес|долин/.test(value))return 'Forest / valley';
    if(/озер|став/.test(value))return 'Lake / open terrain';
    if(/скал|кам|желоб|жёлоб/.test(value))return 'Rock / steep terrain';
    if(/греб|хреб/.test(value))return 'Open ridge';
    if(/лестниц/.test(value))return 'Steps / steep path';
    return 'Marked mountain trail';
  }
  function experienceFor(route,copy){
    const outBack=route.mode==='out_back';
    const terrain=route.chains?'Marked mountain trail with a chain-protected or hands-on-rock section.':route.routeKind==='height'?'Marked mountain trail with sustained ascent and exposed upper terrain.':'Marked paths, forest or valley terrain, with a non-technical objective.';
    return {
      intro:copy.why,
      city:`The planned Polish trailhead is ${route.start}. From there the route follows marked TPN trails.`,
      terrain,
      views:copy.short,
      whyStart:`${route.start} is the practical Polish starting point for this route and its transport logic.`,
      whyFinish:outBack?'The route returns along the planned Polish line to the original trailhead.':'The point-to-point finish is part of the route plan; confirm the return connection in advance.',
      flow:[`Start at ${route.start}`,'Build elevation on the marked trail',`${route.objective?.name||route.goal||route.end} — main objective`,outBack?'Return by the same Polish route':`Finish at ${route.finish||route.end}`],
      terrainMix:(route.experience?.terrainMix||[]).map(([label,value])=>[terrainLabel(label),value]),
      whyGo:{tags:[route.routeKind==='height'?'HIGH OBJECTIVE':'HIKING DAY',route.chains?'CHAINS':'NO CHAINS',route.exposure==='high'?'EXPOSED':'MARKED TRAIL'],text:copy.why},
      tradeOffs:copy.risks,
      routeStory:copy.why
    };
  }
  function safetyFor(route,notice){
    if(!notice)return notice;
    const closed=notice.status==='closed'||route.temporarilyClosed;
    return {...notice,label:closed?'TPN CLOSURE':'ADVANCED ROUTE',title:closed?`${route.name}: officially closed`:`${route.name}: conditions decide`,text:closed?'TPN currently lists part of this route as closed. Do not enter the closed section; verify the official notice before every trip.':'This is a high-consequence mountain route. Dry terrain, stable weather, relevant experience and a conservative turnaround decision are essential.',checks:closed?['Read the current TPN closure notice in full.','Do not bypass barriers or closure signs.','Choose a legal lower-risk alternative.']:['Read the current TPN and TOPR bulletins.','Check wind, precipitation, snow or ice at the upper section.','Enter technical ground only with the right experience and equipment.','Turn around if the group, timing or conditions lose their safety margin.']};
  }
  function photoFor(route,photo,index){
    const title=/[А-Яа-яЁё]/.test(photo.title||'')?`${route.name} · highlight ${index+1}`:photo.title;
    return {...photo,title,alt:`Characteristic terrain on ${route.name}`,caption:`A licensed reference image of a recognisable point or terrain type along ${route.name}.`};
  }
  function localizeRoute(route){
    if(!isEnglish)return route;
    const copy=routeCopy[route.id]||{name:route.name,short:'A curated Polish Tatra route.',why:'A route selected for its landscape, terrain and clear Polish trailhead.',risks:['Mountain weather can change quickly.','Confirm the marked trail and current closures.','Keep enough time and energy for the return.']};
    const localized={...route,...copy};
    localized.start=route.start==='Apartamenty Polana Pająkówka'?'Pająkówka':route.start;
    localized.finish=route.finish==='Apartamenty Polana Pająkówka'?'Pająkówka':route.finish;
    localized.best=bestFor(route.best||'');
    localized.objective={...route.objective,type:route.routeKind==='height'?'summit / objective':'landmark / objective'};
    localized.finish=route.finish==='дом'?localized.start:localized.finish;
    localized.returnToZakopane=returnCopy(route.returnToZakopane);
    localized.stay=stayFor(route);
    localized.transport=transportFor(route);
    localized.parking=parkingFor(route);
    localized.gear=gearFor(route);
    localized.metricNote='Time and ascent are curated planning estimates; the checked reference track may differ slightly from rounded card metrics.';
    localized.experience=experienceFor(localized,copy);
    localized.safetyNotice=safetyFor(localized,route.safetyNotice);
    if(route.closure)localized.closure={...route.closure,until:'until further notice',text:'TPN has officially closed the affected trail section in both directions. Do not enter it; read the current source notice in full.'};
    localized.photos=(route.photos||[]).map((photo,index)=>photoFor(localized,photo,index));
    return localized;
  }
  function localizeZone(zone){return !isEnglish||!zone?zone:{...zone,...(zoneCopy[zone.id]||{})}}
  function localizeRoutes(routes){return (routes||[]).map(localizeRoute)}
  function localizeZones(zones){return (zones||[]).map(localizeZone)}

  function stopName(name,route){
    if(name==='Apartamenty Polana Pająkówka')return 'Pająkówka trailhead';
    if(!/[А-Яа-яЁё]/.test(name||''))return name;
    const generic=[['Развилка спуска','Descent junction'],['Скальная тропа','Rocky summit trail'],['Цепи','Chain section'],['Финальный подход','Final approach'],['Финиш','Finish'],['Старт','Start']];
    const found=generic.find(([ru])=>name.includes(ru));
    return found?found[1]:`${route?.name||'Route'} checkpoint`;
  }
  function localizeFieldMap(config,route){
    if(!isEnglish||!config)return config;
    const prompts={danger:'TECHNICAL CHECK',nav:'NAVIGATION',effort:'PACE + WEATHER',summit:'RETURN PLAN',info:'CHECKPOINT'};
    return {...config,issue:String(config.issue||'FIELD MAP').replace('FROM HOME','WALK-OUT'),title:`${route.name}: decisions, terrain and effort.`,intro:'Tap each point to see where the surface, exposure, effort or navigation changes. Photo points stay attached to their approximate place on the route.',stops:(config.stops||[]).map((stop,index)=>{
      const isStart=index===0,isSummit=stop.level==='summit',isDanger=stop.level==='danger',isNav=stop.level==='nav';
      const decision=isStart?`Confirm the marked Polish route from ${stopName(stop.name,route)} before moving on.`:isSummit?'Return by the planned Polish route. Reaching the objective is only half of the day.':isDanger?'Check the actual surface, visibility, traffic and the group’s confidence before entering this section.':isNav?'Confirm the correct marked trail here using signs and an offline map.':'Recheck time, weather and the condition of the whole group before continuing.';
      const body=isDanger?'Wet rock, ice, congestion or poor visibility can increase the consequence of a small mistake.':isNav?'This is a useful place to slow down: an automatic choice can send the group onto a different route.':'Use this point as a deliberate pause rather than treating the route as one continuous push.';
      return {...stop,name:stopName(stop.name,route),meta:String(stop.meta||'').replaceAll('км','km').replaceAll(' м',' m'),kicker:`${String(index).padStart(2,'0')} / ${isStart?'START':isSummit?'OBJECTIVE':isDanger?'TECHNICAL':isNav?'DECISION':'CHECK'}`,tag:isSummit?'OBJECTIVE':isDanger?'HIGH CONSEQUENCE':isNav?'CHECK THE MARKS':isStart?'TRAILHEAD':'PACE CHECK',prompt:prompts[stop.level]||'CHECKPOINT',decision,body};
    }),sources:(config.sources||[]).map(([label,url])=>[/TPN/.test(label)?'TPN conditions':'route source',url])};
  }

  window.TatryI18n=Object.freeze({lang,isEnglish,tr,routeHref,homeHref,localizeRoute,localizeRoutes,localizeZone,localizeZones,localizeFieldMap});
})();
