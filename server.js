const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { URL } = require('url');

const PORT = Number(process.env.PORT || 8787);
const ROOT = __dirname;
const PUBLIC = path.join(ROOT, 'public');
const LEAFLET_DIST = path.join(ROOT, 'node_modules', 'leaflet', 'dist');
const ROUTE_PHOTOS = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'route-photos.json'), 'utf8'));
const ROUTES = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'routes.json'), 'utf8')).map((route) => ({
  ...route,
  photos: (ROUTE_PHOTOS[route.id] || []).map((photo) => ({
    ...photo,
    src: `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(photo.file)}?width=1600`
  }))
}));
const VERIFIED_TRACKS = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(ROOT, 'data', 'verified-tracks.json.gz'))).toString('utf8'));
const ROUTE_MAP = new Map(ROUTES.map((r) => [r.id, r]));
const STAY_ZONES = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'stay-zones.json'), 'utf8'));
const STAY_ZONE_MAP = new Map(STAY_ZONES.map((z) => [z.id, z]));
const USER_AGENT = 'TatryFieldPhase3/0.5.0 (+source-backed route tracks; safety-first hiking guide)';

const cache = new Map();
function getCache(key) {
  const item = cache.get(key);
  if (!item || item.expires < Date.now()) { cache.delete(key); return null; }
  return item.value;
}
function setCache(key, value, ttlMs) { cache.set(key, { value, expires: Date.now() + ttlMs }); return value; }

function json(res, status, body, extra = {}) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...extra });
  res.end(JSON.stringify(body));
}
function text(res, status, body, contentType='text/plain; charset=utf-8', extra={}) {
  res.writeHead(status, { 'content-type': contentType, ...extra });
  res.end(body);
}
function safeRoute(id) { return ROUTE_MAP.get(id); }

async function fetchJson(url, opts = {}) {
  const response = await fetch(url, {
    ...opts,
    headers: { 'user-agent': USER_AGENT, 'accept': 'application/json', ...(opts.headers || {}) },
    signal: AbortSignal.timeout(15000)
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
}
async function fetchText(url, opts = {}) {
  const response = await fetch(url, {
    ...opts,
    headers: { 'user-agent': USER_AGENT, 'accept': 'text/html,*/*', ...(opts.headers || {}) },
    signal: AbortSignal.timeout(15000)
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.text();
}

function fallbackGeometry(route) {
  let coords = route.routingPoints.map(([lon, lat]) => [lon, lat]);
  const endpointsApart = coords.length > 1 && haversineKm(coords[0], coords.at(-1)) > 0.2;
  if (route.mode === 'out_back' || (route.mode === 'loop' && endpointsApart)) coords = coords.concat(coords.slice(0, -1).reverse());
  return { type: 'LineString', coordinates: coords };
}

function lineDistanceKm(coords) {
  return coords.slice(1).reduce((sum, point, i) => sum + haversineKm(coords[i], point), 0);
}

function validateGeometry(route, coords) {
  if (!Array.isArray(coords) || coords.length < 2) throw new Error('Route geometry has fewer than two points');
  let maxGapKm = 0;
  for (let i = 0; i < coords.length; i++) {
    const [lon, lat] = coords[i] || [];
    if (!Number.isFinite(lon) || !Number.isFinite(lat)) throw new Error(`Invalid coordinate at point ${i}`);
    if (lon < 19.68 || lon > 20.22 || lat < 49.15 || lat > 49.34) throw new Error(`Geometry leaves the Polish Tatra region at point ${i}`);
    if (i) maxGapKm = Math.max(maxGapKm, haversineKm(coords[i - 1], coords[i]));
  }
  const distanceKm = lineDistanceKm(coords);
  const ratio = distanceKm / route.km;
  if (ratio < 0.7 || ratio > 1.4) throw new Error(`Geometry distance ${distanceKm.toFixed(2)} km does not match route metric ${route.km} km`);
  if (maxGapKm > 0.75) throw new Error(`Geometry contains a suspicious ${maxGapKm.toFixed(2)} km jump`);
  return { distanceKm, maxGapKm };
}

function verifiedGeometry(route) {
  const track = VERIFIED_TRACKS.routes?.[route.id];
  if (!track?.geometry?.coordinates) return null;
  const checked = validateGeometry(route, track.geometry.coordinates);
  return {
    geometry: track.geometry,
    distanceKm: Math.round(checked.distanceKm * 100) / 100,
    source: 'Reference hiking track · mapa-turystyczna.pl / OpenStreetMap',
    sourceUrls: track.sourceUrls || [],
    approximate: false,
    verified: true,
    generatedAt: VERIFIED_TRACKS.generatedAt
  };
}

async function brouterGeometry(route) {
  const lonlats = route.routingPoints.map(([lon, lat]) => `${lon},${lat}`).join('|');
  const endpoint = `https://brouter.de/brouter?lonlats=${encodeURIComponent(lonlats)}&profile=hiking-mountain&alternativeidx=0&format=geojson`;
  const data = await fetchJson(endpoint, { headers: { referer: 'https://tatry-field.onrender.com/' } });
  const feature = data.type === 'FeatureCollection' ? data.features?.[0] : data;
  let coordinates = feature?.geometry?.coordinates;
  if (!Array.isArray(coordinates)) throw new Error('BRouter returned no route geometry');
  const endpointsApart = haversineKm(coordinates[0], coordinates.at(-1)) > 0.2;
  if (route.mode === 'out_back' || (route.mode === 'loop' && endpointsApart)) coordinates = coordinates.concat(coordinates.slice(0, -1).reverse());
  const checked = validateGeometry(route, coordinates);
  return {
    geometry: { type: 'LineString', coordinates },
    distanceKm: Math.round(checked.distanceKm * 100) / 100,
    source: 'Validated BRouter hiking-mountain fallback · OpenStreetMap',
    approximate: false,
    verified: false,
    generatedAt: new Date().toISOString()
  };
}

async function routeGeometry(route) {
  const key = `geometry:${route.id}`;
  const hit = getCache(key); if (hit) return hit;
  try {
    const track = verifiedGeometry(route);
    if (track) return setCache(key, track, 24 * 60 * 60 * 1000);
  } catch (error) {
    console.error(`Rejected bundled geometry for ${route.id}: ${error.message}`);
  }
  try {
    return setCache(key, await brouterGeometry(route), 24 * 60 * 60 * 1000);
  } catch (error) {
    return {
      geometry: fallbackGeometry(route),
      distanceKm: route.km,
      source: 'Curated waypoints fallback (reference track and router unavailable)',
      approximate: true,
      verified: false,
      error: error.message,
      generatedAt: new Date().toISOString()
    };
  }
}

function sampleLine(coords, maxPoints = 80) {
  if (!coords.length) return [];
  if (coords.length <= maxPoints) return coords;
  const out = [];
  for (let i = 0; i < maxPoints; i++) {
    const idx = Math.round(i * (coords.length - 1) / (maxPoints - 1));
    out.push(coords[idx]);
  }
  return out;
}

function haversineKm(a, b) {
  const R = 6371, rad = Math.PI / 180;
  const dLat = (b[1]-a[1])*rad, dLon=(b[0]-a[0])*rad;
  const lat1=a[1]*rad, lat2=b[1]*rad;
  const h=Math.sin(dLat/2)**2+Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;
  return 2*R*Math.asin(Math.sqrt(h));
}

async function elevationProfile(route) {
  const key = `elevation:${route.id}`;
  const hit = getCache(key); if (hit) return hit;
  const routed = await routeGeometry(route);
  const points = sampleLine(routed.geometry.coordinates, 72);
  try {
    const lat = points.map(p => p[1]).join(',');
    const lon = points.map(p => p[0]).join(',');
    const data = await fetchJson(`https://api.open-meteo.com/v1/elevation?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}`);
    const elevations = Array.isArray(data.elevation) ? data.elevation : [data.elevation];
    let dist = 0, ascent = 0;
    const profile = points.map((p, i) => {
      if (i) dist += haversineKm(points[i-1], p);
      if (i && Number.isFinite(elevations[i]) && Number.isFinite(elevations[i-1])) ascent += Math.max(0, elevations[i]-elevations[i-1]);
      return { lon:p[0], lat:p[1], km:Math.round(dist*100)/100, elevation:elevations[i] ?? null };
    });
    return setCache(key, { profile, distanceKm: Math.round(dist*100)/100, ascentM: Math.round(ascent), approximate: routed.approximate }, 24*60*60*1000);
  } catch (error) {
    return { profile: points.map((p,i)=>({lon:p[0],lat:p[1],km:i?null:0,elevation:null})), distanceKm: routed.distanceKm, ascentM: route.ascent, approximate:true, error:error.message };
  }
}

function wmoThunder(code) { return [95,96,99].includes(Number(code)); }
function daySummary(data, dayIndex) {
  if (!data?.hourly?.time?.length) return null;
  const date = data.daily?.time?.[dayIndex];
  if (!date) return null;
  const idx = data.hourly.time.map((t,i)=>[t,i]).filter(([t]) => t.startsWith(date) && Number(t.slice(11,13)) >= 6 && Number(t.slice(11,13)) <= 20).map(([,i])=>i);
  const vals = (field) => idx.map(i=>Number(data.hourly[field]?.[i])).filter(Number.isFinite);
  const temp=vals('temperature_2m'), gust=vals('wind_gusts_10m'), wind=vals('wind_speed_10m'), prob=vals('precipitation_probability'), precip=vals('precipitation');
  const codes=idx.map(i=>Number(data.hourly.weather_code?.[i])).filter(Number.isFinite);
  return {
    date,
    minTemp: temp.length ? Math.round(Math.min(...temp)) : null,
    maxTemp: temp.length ? Math.round(Math.max(...temp)) : null,
    maxWind: wind.length ? Math.round(Math.max(...wind)) : null,
    maxGust: gust.length ? Math.round(Math.max(...gust)) : null,
    maxPrecipProb: prob.length ? Math.round(Math.max(...prob)) : null,
    precipMm: precip.length ? Math.round(precip.reduce((a,b)=>a+b,0)*10)/10 : null,
    thunder: codes.some(wmoThunder),
    weatherCodes: [...new Set(codes)],
    sunrise: data.daily?.sunrise?.[dayIndex] || null,
    sunset: data.daily?.sunset?.[dayIndex] || null
  };
}

function weatherFit(route, s) {
  if (!s) return { level:'unknown', label:'Нет прогноза', reasons:['Погодный API не вернул данные.'] };
  const reasons=[];
  const high = route.exposure === 'high' || route.diff >= 4;
  if (s.thunder) reasons.push('В прогнозе есть грозовой код WMO.');
  if (s.maxGust >= 65) reasons.push(`Порывы до ${s.maxGust} км/ч.`);
  if ((s.maxPrecipProb >= 70 && s.precipMm >= 3)) reasons.push(`Вероятность осадков до ${s.maxPrecipProb}%, около ${s.precipMm} мм.`);
  if (s.minTemp !== null && s.minTemp <= 2) reasons.push(`Минимум около ${s.minTemp}°C: на высоте возможны зимние условия.`);

  if (s.thunder) return { level:'avoid', label:'Не выбирать по этому прогнозу', reasons };
  if (high && s.maxGust >= 60) return { level:'avoid', label:'Слишком ветреный профиль', reasons };
  if ((route.chains || route.theme==='scramble' || route.id==='rysy') && s.maxPrecipProb >= 65 && s.precipMm >= 2) return { level:'avoid', label:'Мокрая скала / цепи — плохая комбинация', reasons };
  if (s.maxGust >= (high ? 45 : 55) || s.maxPrecipProb >= 50 || (s.minTemp !== null && s.minTemp <= 4)) {
    if (!reasons.length) reasons.push('Есть погодные факторы, которые стоит перепроверить непосредственно перед стартом.');
    return { level:'caution', label:'Только после перепроверки условий', reasons };
  }
  return { level:'good', label:'Погодный профиль выглядит совместимым', reasons:['Это не разрешение на выход: проверь TPN/TOPR и фактические условия утром.'] };
}

async function weatherAt(lat, lon, forecastDays=3) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m,wind_gusts_10m&daily=sunrise,sunset&timezone=Europe%2FWarsaw&forecast_days=${forecastDays}`;
  return fetchJson(url);
}

async function weatherForRoute(route) {
  const key=`weather:route:${route.id}`; const hit=getCache(key); if(hit) return hit;
  try {
    const [start, summit] = await Promise.all([
      weatherAt(route.startLat, route.startLon),
      weatherAt(route.summitLat, route.summitLon)
    ]);
    const days=[0,1].map(day=>{
      const startS=daySummary(start,day), summitS=daySummary(summit,day);
      return { day, start:startS, summit:summitS, fit:weatherFit(route,summitS) };
    });
    return setCache(key,{days,source:'Open-Meteo',generatedAt:new Date().toISOString()},30*60*1000);
  } catch(error) {
    return {days:[0,1].map(day=>({day,start:null,summit:null,fit:{level:'unknown',label:'Прогноз недоступен',reasons:[error.message]}})),source:'Open-Meteo',error:error.message,generatedAt:new Date().toISOString()};
  }
}

async function bulkWeather(day=0) {
  const key=`weather:bulk:${day}`; const hit=getCache(key); if(hit) return hit;
  try {
    const lat=ROUTES.map(r=>r.summitLat).join(','), lon=ROUTES.map(r=>r.summitLon).join(',');
    const url=`https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&hourly=temperature_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m,wind_gusts_10m&daily=sunrise,sunset&timezone=Europe%2FWarsaw&forecast_days=3`;
    const raw=await fetchJson(url);
    const arr=Array.isArray(raw)?raw:[raw];
    const out={};
    ROUTES.forEach((r,i)=>{const s=daySummary(arr[i],day);out[r.id]={summary:s,fit:weatherFit(r,s)};});
    return setCache(key,{day,routes:out,source:'Open-Meteo',generatedAt:new Date().toISOString()},30*60*1000);
  } catch(error) {
    return {day,routes:Object.fromEntries(ROUTES.map(r=>[r.id,{summary:null,fit:{level:'unknown',label:'Прогноз недоступен',reasons:[error.message]}}])),source:'Open-Meteo',error:error.message,generatedAt:new Date().toISOString()};
  }
}

function htmlToText(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/\s+/g,' ').trim();
}
function snippetsForAliases(textBody, aliases) {
  const lower=textBody.toLowerCase(); const out=[];
  for(const alias of aliases){
    const idx=lower.indexOf(alias.toLowerCase());
    if(idx>=0){out.push({alias,snippet:textBody.slice(Math.max(0,idx-170),Math.min(textBody.length,idx+alias.length+240)).trim()});}
  }
  return out.slice(0,4);
}

async function officialStatus(route) {
  const key=`official:${route?.id||'all'}`; const hit=getCache(key); if(hit) return hit;
  const out={tpn:{url:'https://tpn.gov.pl/komunikat-turystyczny',ok:false},topr:{url:'https://topr.pl/',ok:false},avalanche:{url:'https://lawiny.topr.pl/',ok:false},generatedAt:new Date().toISOString()};
  try {
    const html=await fetchText(out.tpn.url); const body=htmlToText(html);
    out.tpn.ok=true; out.tpn.excerpt=body.slice(0,900);
    out.tpn.routeMentions=route?snippetsForAliases(body,route.officialAliases||[]):[];
    out.tpn.note=out.tpn.routeMentions.length?'Найдены упоминания названий, связанных с маршрутом. Прочитай оригинал целиком.':'Явного упоминания названия маршрута в извлечённом тексте не найдено. Это НЕ означает, что маршрут открыт или безопасен.';
  } catch(e){out.tpn.error=e.message;}
  try { const html=await fetchText(out.topr.url); const body=htmlToText(html); out.topr.ok=true; out.topr.excerpt=body.slice(0,500);} catch(e){out.topr.error=e.message;}
  try { const html=await fetchText(out.avalanche.url); const body=htmlToText(html); out.avalanche.ok=true; out.avalanche.excerpt=body.slice(0,650);} catch(e){out.avalanche.error=e.message;}
  return setCache(key,out,10*60*1000);
}

function elementPoint(el) {
  if (el.lat && el.lon) return [Number(el.lon),Number(el.lat)];
  if (el.center?.lat && el.center?.lon) return [Number(el.center.lon),Number(el.center.lat)];
  return null;
}
async function nearbyPois(route) {
  const key=`pois:${route.id}`; const hit=getCache(key); if(hit) return hit;
  const lat=route.startLat, lon=route.startLon;
  const q=`[out:json][timeout:18];(nwr(around:3000,${lat},${lon})[\"amenity\"~\"^(cafe|restaurant|fast_food)$\"];nwr(around:2200,${lat},${lon})[\"amenity\"=\"parking\"];node(around:1800,${lat},${lon})[\"highway\"=\"bus_stop\"];);out center tags;`;
  try {
    const data=await fetchJson(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(q)}`);
    const items=(data.elements||[]).map(el=>{
      const p=elementPoint(el); if(!p) return null;
      let kind='other'; const t=el.tags||{};
      if(['cafe','restaurant','fast_food'].includes(t.amenity)) kind='food';
      else if(t.amenity==='parking') kind='parking';
      else if(t.highway==='bus_stop') kind='transit';
      return {id:`${el.type}/${el.id}`,name:t.name||t['name:pl']||t.amenity||'Unnamed',kind,amenity:t.amenity||null,lon:p[0],lat:p[1],distanceKm:Math.round(haversineKm([lon,lat],p)*100)/100,cuisine:t.cuisine||null,openingHours:t.opening_hours||null,website:t.website||t['contact:website']||null};
    }).filter(Boolean).sort((a,b)=>a.distanceKm-b.distanceKm);
    const result={food:items.filter(x=>x.kind==='food').slice(0,12),parking:items.filter(x=>x.kind==='parking').slice(0,8),transit:items.filter(x=>x.kind==='transit').slice(0,8),source:'OpenStreetMap / Overpass API',generatedAt:new Date().toISOString()};
    return setCache(key,result,6*60*60*1000);
  } catch(error) {
    return {food:[],parking:[],transit:[],source:'OpenStreetMap / Overpass API',error:error.message,generatedAt:new Date().toISOString()};
  }
}



async function trailPois(route) {
  const key=`trail-pois:${route.id}`; const hit=getCache(key); if(hit) return hit;
  const circles=(route.routingPoints||[]).map(([lon,lat])=>`nwr(around:1800,${lat},${lon})["tourism"~"^(alpine_hut|wilderness_hut|viewpoint)$"];nwr(around:1200,${lat},${lon})["amenity"="drinking_water"];nwr(around:1200,${lat},${lon})["natural"="spring"];`).join('');
  const q=`[out:json][timeout:22];(${circles});out center tags;`;
  try {
    const data=await fetchJson(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(q)}`);
    const seen=new Set();
    const items=(data.elements||[]).map(el=>{
      const p=elementPoint(el); if(!p) return null;
      const t=el.tags||{}; const key2=`${Math.round(p[1]*1e5)}:${Math.round(p[0]*1e5)}:${t.name||t.tourism||t.amenity||t.natural||''}`;
      if(seen.has(key2)) return null; seen.add(key2);
      let kind='poi';
      if(t.tourism==='alpine_hut'||t.tourism==='wilderness_hut') kind='hut';
      else if(t.amenity==='drinking_water'||t.natural==='spring') kind='water';
      else if(t.tourism==='viewpoint') kind='viewpoint';
      const name=t.name||t['name:pl']||(kind==='hut'?'Schronisko':kind==='water'?'Woda':'Viewpoint');
      return {id:`${el.type}/${el.id}`,name,kind,lon:p[0],lat:p[1],website:t.website||t['contact:website']||null};
    }).filter(Boolean);
    return setCache(key,{items:items.slice(0,30),source:'OpenStreetMap / Overpass API',generatedAt:new Date().toISOString()},6*60*60*1000);
  } catch(error) {
    return {items:[],source:'OpenStreetMap / Overpass API',error:error.message,generatedAt:new Date().toISOString()};
  }
}

function bookingSearchUrl(query) {
  return `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(query)}`;
}

async function nearbyStays(route) {
  const zone = STAY_ZONE_MAP.get(route.stayZone) || STAY_ZONE_MAP.get('centrum-dworzec');
  const key=`stays:${zone.id}`; const hit=getCache(key); if(hit) return hit;
  const q=`[out:json][timeout:18];(nwr(around:2600,${zone.lat},${zone.lon})["tourism"~"^(hotel|guest_house|hostel|apartment|chalet|motel)$"];);out center tags;`;
  try {
    const data=await fetchJson(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(q)}`);
    const items=(data.elements||[]).map(el=>{
      const p=elementPoint(el); if(!p) return null;
      const t=el.tags||{}; const name=t.name||t['name:pl']; if(!name) return null;
      const addr=[t['addr:street'],t['addr:housenumber']].filter(Boolean).join(' ');
      const place=t['addr:city']||t['addr:place']||'';
      const type=t.tourism||'stay';
      return {
        id:`${el.type}/${el.id}`,name,type,lon:p[0],lat:p[1],
        distanceKm:Math.round(haversineKm([zone.lon,zone.lat],p)*100)/100,
        address:[addr,place].filter(Boolean).join(', '),
        website:t.website||t['contact:website']||null,
        bookingUrl:bookingSearchUrl(`${name}, ${place||zone.name}, Poland`)
      };
    }).filter(Boolean).sort((a,b)=>a.distanceKm-b.distanceKm).slice(0,10);
    return setCache(key,{zone:{...zone,bookingUrl:bookingSearchUrl(zone.bookingQuery)},items,source:'OpenStreetMap / Overpass API',generatedAt:new Date().toISOString()},6*60*60*1000);
  } catch(error) {
    return {zone:{...zone,bookingUrl:bookingSearchUrl(zone.bookingQuery)},items:[],source:'OpenStreetMap / Overpass API',error:error.message,generatedAt:new Date().toISOString()};
  }
}

function xmlEscape(s) { return String(s).replace(/[<>&'\"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;',"'":'&apos;','"':'&quot;'}[c])); }
async function gpxForRoute(route) {
  const routed=await routeGeometry(route);
  const points=routed.geometry.coordinates;
  const trkpts=points.map(([lon,lat])=>`      <trkpt lat=\"${lat}\" lon=\"${lon}\"></trkpt>`).join('\n');
  return `<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<gpx version=\"1.1\" creator=\"TATRY FIELD Phase 3\" xmlns=\"http://www.topografix.com/GPX/1/1\">\n  <metadata><name>${xmlEscape(route.name)}</name><desc>Source-backed reference track checked for distance and geometry. Follow official TPN trail markings and current safety information.</desc></metadata>\n  <trk><name>${xmlEscape(route.name)}</name><trkseg>\n${trkpts}\n  </trkseg></trk>\n</gpx>`;
}

async function handleApi(req,res,url) {
  if (url.pathname === '/api/routes') return json(res,200,{routes:ROUTES});
  if (url.pathname === '/api/stay-zones') return json(res,200,{zones:STAY_ZONES.map(z=>({...z,bookingUrl:bookingSearchUrl(z.bookingQuery)}))});
  if (url.pathname === '/api/weather-all') { const day=Math.max(0,Math.min(1,Number(url.searchParams.get('day')||0))); return json(res,200,await bulkWeather(day)); }
  if (url.pathname === '/api/official') { const route=safeRoute(url.searchParams.get('route')); return json(res,200,await officialStatus(route)); }
  const match=url.pathname.match(/^\/api\/(geometry|elevation|weather|pois|trail-pois|stays|gpx)\/([a-z0-9-]+)$/);
  if (!match) return false;
  const [,kind,id]=match; const route=safeRoute(id); if(!route){json(res,404,{error:'Unknown route'});return true;}
  if(kind==='geometry') return json(res,200,await routeGeometry(route));
  if(kind==='elevation') return json(res,200,await elevationProfile(route));
  if(kind==='weather') return json(res,200,await weatherForRoute(route));
  if(kind==='pois') return json(res,200,await nearbyPois(route));
  if(kind==='trail-pois') return json(res,200,await trailPois(route));
  if(kind==='stays') return json(res,200,await nearbyStays(route));
  if(kind==='gpx') {
    const body=await gpxForRoute(route);
    return text(res,200,body,'application/gpx+xml; charset=utf-8',{'content-disposition':`attachment; filename=\"${route.id}.gpx\"`});
  }
  return false;
}

const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.webmanifest':'application/manifest+json'};
function serveFromRoot(res,root,file){
  const normalizedRoot=path.resolve(root);
  const normalizedFile=path.resolve(file);
  if(!(normalizedFile===normalizedRoot || normalizedFile.startsWith(normalizedRoot + path.sep))) return text(res,403,'Forbidden');
  fs.readFile(normalizedFile,(err,data)=>{if(err)return text(res,404,'Not found');res.writeHead(200,{'content-type':mime[path.extname(normalizedFile)]||'application/octet-stream','cache-control':'no-cache'});res.end(data);});
}
function serveFile(res,file){ return serveFromRoot(res,PUBLIC,file); }

const server=http.createServer(async(req,res)=>{
  const url=new URL(req.url,`http://${req.headers.host||'localhost'}`);
  try {
    if(url.pathname.startsWith('/api/')) { const handled=await handleApi(req,res,url); if(handled!==false)return; return json(res,404,{error:'Unknown API route'}); }
    if(url.pathname.startsWith('/vendor/leaflet/')) { const rel=url.pathname.slice('/vendor/leaflet/'.length); return serveFromRoot(res,LEAFLET_DIST,path.join(LEAFLET_DIST,rel)); }
    if(/^\/route\/[a-z0-9-]+\/?$/.test(url.pathname)) return serveFile(res,path.join(PUBLIC,'route.html'));
    let rel=url.pathname==='/'?'/index.html':url.pathname;
    const file=path.normalize(path.join(PUBLIC,rel));
    return serveFile(res,file);
  } catch(error) { console.error(error); if(!res.headersSent) json(res,500,{error:error.message}); else res.end(); }
});

server.listen(PORT,()=>console.log(`TATRY FIELD Phase 3.0 → http://localhost:${PORT}`));
