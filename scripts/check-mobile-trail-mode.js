const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const route = read('public/route.js');
const styles = read('public/styles.css');

assert.match(route, /id="trailGpsStatus"[^>]+>START GPS<\/button>/, 'the visible GPS status must be a button');
assert.match(route, /id="trailCompassStatus"[^>]+>START COMPASS<\/button>/, 'the visible compass status must be a button');
assert.match(route, /querySelector\('#trailGpsStatus'\)\.onclick=startGps/, 'the top GPS button must start GPS');
assert.match(route, /querySelector\('#trailCompassStatus'\)\.onclick=startCompass/, 'the top compass button must start the compass');
assert.match(route, /navigator\.geolocation\.getCurrentPosition/, 'GPS must request an initial fix from the user gesture');
assert.match(route, /navigator\.geolocation\.watchPosition/, 'GPS must continue tracking after the initial fix');
assert.match(route, /error\?\.code===1/, 'permission denial must have dedicated guidance');
assert.match(route, /Safari Websites/, 'iPhone permission guidance must be present');
assert.match(route, /function stopTrailSensors/, 'closing Trail Mode must stop mobile sensors');
assert.match(styles, /height:100dvh/, 'Trail Mode must use the iOS dynamic viewport');
assert.match(styles, /\.trail-sensor-action\{display:none\}/, 'duplicated sensor row must not consume mobile map space');
assert.match(styles, /\.trail-sensor-status\{min-height:44px/, 'mobile sensor controls must have a touch-sized target');

console.log('mobile Trail Mode: tappable sensors, iPhone permission recovery and stable viewport OK');
