const fs = require('fs');
const path = require('path');
const vm = require('vm');
const zlib = require('zlib');

const root = path.join(__dirname, '..');
const routes = JSON.parse(fs.readFileSync(path.join(root, 'data', 'routes.json'), 'utf8'));
const photos = JSON.parse(fs.readFileSync(path.join(root, 'data', 'route-photos.json'), 'utf8'));
const tracks = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root, 'data', 'verified-tracks.json.gz')))).routes;
const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'public', 'field-maps.js'), 'utf8'), context);
const maps = context.window.TATRY_FIELD_MAPS;
const allowedLevels = new Set(['info', 'nav', 'effort', 'danger', 'summit']);
const allowedTerrain = new Set(['approach', 'effort', 'navigation', 'technical']);

function fail(message) {
  console.error(`FAIL ${message}`);
  process.exitCode = 1;
}

if (Object.keys(maps).length !== routes.length) fail(`expected ${routes.length} maps, got ${Object.keys(maps).length}`);

for (const route of routes) {
  const config = maps[route.id];
  if (!config) { fail(`${route.id}: missing Field Map`); continue; }
  if (!tracks[route.id]?.geometry?.coordinates?.length) fail(`${route.id}: missing verified geometry`);
  if (!Array.isArray(config.stops) || config.stops.length < 5) fail(`${route.id}: fewer than five stops`);
  if (!Array.isArray(config.terrain) || !config.terrain.length) fail(`${route.id}: missing terrain segments`);
  let lastRatio = -1;
  let photoStops = 0;
  for (const [index, stop] of config.stops.entries()) {
    if (!Number.isFinite(stop.ratio) || stop.ratio < 0 || stop.ratio > 1 || stop.ratio < lastRatio) fail(`${route.id}: invalid stop ratio at ${index}`);
    lastRatio = stop.ratio;
    for (const field of ['kicker', 'name', 'tag', 'meta', 'prompt', 'decision', 'body']) if (!stop[field]) fail(`${route.id}: stop ${index} missing ${field}`);
    if (!allowedLevels.has(stop.level)) fail(`${route.id}: stop ${index} has unknown level ${stop.level}`);
    if (Number.isInteger(stop.photoIndex)) {
      photoStops++;
      if (!photos[route.id]?.[stop.photoIndex]) fail(`${route.id}: stop ${index} references missing photo ${stop.photoIndex}`);
    }
  }
  if (photoStops < 2) fail(`${route.id}: expected at least two photo stops, got ${photoStops}`);
  for (const [index, segment] of config.terrain.entries()) {
    if (!Number.isFinite(segment.from) || !Number.isFinite(segment.to) || segment.from < 0 || segment.to > 1 || segment.from >= segment.to) fail(`${route.id}: terrain ${index} has invalid range`);
    if (!allowedTerrain.has(segment.kind)) fail(`${route.id}: terrain ${index} has unknown kind ${segment.kind}`);
  }
  console.log(`OK   ${route.id.padEnd(16)} ${String(config.stops.length).padStart(2)} stops  ${photoStops} photo points`);
}

if (process.exitCode) process.exit(process.exitCode);
