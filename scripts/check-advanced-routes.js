const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const routes = require('../data/routes.json');
const photos = require('../data/route-photos.json');
const ids = ['zawrat', 'kozia-przelecz', 'kobylarzowy-zleb', 'krzyzne', 'przelecz-pod-chlopkiem'];
const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'public', 'field-maps.js'), 'utf8'), context);

for (const id of ids) {
  const route = routes.find(item => item.id === id);
  assert.ok(route, `${id}: missing route`);
  assert.equal(route.routeKind, 'height', `${id}: must be a height route`);
  assert.equal(route.beginner, false, `${id}: must not be marked beginner`);
  assert.ok(route.safetyNotice?.title && route.safetyNotice?.text, `${id}: missing prominent safety notice`);
  assert.ok(route.safetyNotice?.checks?.length >= 3, `${id}: safety notice needs at least three checks`);
  assert.match(route.safetyNotice.sourceUrl || '', /^https:\/\/tpn\.gov\.pl\//, `${id}: safety notice must link to TPN`);
  assert.ok(route.risks?.length >= 4, `${id}: risk list is too sparse`);
  assert.ok(route.gear?.length >= 6, `${id}: gear list is too sparse`);
  assert.equal(photos[id]?.length, 2, `${id}: requires two licensed route photos`);
  assert.ok(context.window.TATRY_FIELD_MAPS[id]?.stops?.length >= 7, `${id}: Field Map needs at least seven decision points`);
}

const closed = routes.find(item => item.id === 'kozia-przelecz');
assert.equal(closed.temporarilyClosed, true, 'Kozia Przełęcz must remain excluded while TPN closure is active');
assert.match(closed.closure?.sourceUrl || '', /tpn\.gov\.pl/, 'Kozia closure must cite TPN');

console.log(`advanced routes: ${ids.length} safety-gated routes, licensed photos and Field Maps OK`);
