const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const points = read('public/map-points.js');
const app = read('public/app.js');
const route = read('public/route.js');
const index = read('public/index.html');
const routeHtml = read('public/route.html');
const routes = JSON.parse(read('data/routes.json'));
const tracks = require('zlib').gunzipSync(fs.readFileSync(path.join(root, 'data', 'verified-tracks.json.gz'))).toString('utf8');

assert.match(points, /Apartamenty Polana Pająkówka/);
assert.match(points, /Pająkówka 11f, 34-511 Kościelisko, Poland/);
assert.match(points, /lat:\s*49\.29932/);
assert.match(points, /lon:\s*19\.92026/);
assert.match(points, /home-map-glyph/);
assert.match(points, /GOOGLE MAPS/);
assert(index.indexOf('/map-points.js') < index.indexOf('/app.js'));
assert(routeHtml.indexOf('/map-points.js') < routeHtml.indexOf('/route.js'));
assert.match(app, /addHomeMarker\(contextLayer\)/);
assert.match(route, /addHomeMarker\(contextLayer\)/);
assert.match(route, /addHomeMarker\(fieldMapLeaflet\)/);
assert.match(route, /addHomeMarker\(trailMap\)/);
assert.match(route, /data-map-view="home"/);
assert.match(route, /data-field-home/);
assert.match(route, /От нашего дома до старта/);

const homeRouteIds = [
  'pajakowka-gubalowka-loop',
  'pajakowka-gubalowka-butorowy-loop',
  'gubalowka-ridge-dzianisz'
];
const trackData = JSON.parse(tracks).routes;
for (const id of homeRouteIds) {
  const homeRoute = routes.find(item => item.id === id);
  assert(homeRoute, `${id}: route should exist`);
  assert(Math.abs(homeRoute.startLat - 49.29932) < 0.001, `${id}: start should stay by the home base`);
  assert(Math.abs(homeRoute.startLon - 19.92026) < 0.001, `${id}: start should stay by the home base`);
  assert(trackData[id]?.geometry?.coordinates?.length > 40, `${id}: detailed map geometry should exist`);
}

const stayPosition = index.indexOf('id="stay-guide"');
const prepPosition = index.indexOf('id="prep-guide"');
const photoPosition = index.indexOf('id="photo-code"');
assert(prepPosition !== -1 && stayPosition > prepPosition && stayPosition < photoPosition, 'housing guide should sit after preparation and before photo guide');

console.log('home base: shared marker, three walk-out routes, map modes and section order OK');
