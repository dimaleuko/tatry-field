const assert = require('node:assert/strict');
const routes = require('../data/routes.json');
const zones = require('../data/stay-zones.json');
const trip = require('../public/trip-intelligence.js');

const profile = {
  configured: true,
  maxHours: 8,
  maxAscent: 1100,
  chains: 'tried',
  exposure: 'careful'
};

for (const route of routes) {
  const fit = trip.personalizedDifficulty(route, profile);
  assert.ok(['fit', 'stretch', 'beyond'].includes(fit.status), `${route.id}: missing personalized state`);
  assert.ok(fit.score >= 1 && fit.score <= 5, `${route.id}: personalized score outside scale`);
  const items = trip.packingList(route);
  assert.ok(items.length >= 12, `${route.id}: route pack is too sparse`);
  assert.equal(new Set(items.map(item => item.id)).size, items.length, `${route.id}: duplicate pack ids`);
}

const plan = trip.generateTrip(routes, {
  startDate: '2026-09-01',
  days: 5,
  zoneId: 'bystre-kuznice',
  car: false,
  rhythm: 'balanced'
}, profile, ['giewont', 'kasprowy'], zones);

assert.equal(plan.days.length, 5, 'planner should build five active days');
const primaryIds = plan.days.map(day => day.primaryId);
assert.equal(new Set(primaryIds).size, primaryIds.length, 'primary routes should not repeat');
assert.equal(primaryIds.includes('kozia-przelecz'), false, 'closed route must not enter an automatic trip plan');
for (const day of plan.days) {
  const primary = routes.find(route => route.id === day.primaryId);
  const backup = routes.find(route => route.id === day.backupId);
  assert.ok(primary, `day ${day.index}: missing primary`);
  if (!backup) continue;
  assert.notEqual(primary.id, backup.id, `day ${day.index}: Plan B duplicates primary`);
  assert.equal(primaryIds.includes(backup.id), false, `day ${day.index}: Plan B duplicates another primary day`);
  assert.ok(backup.diff <= primary.diff, `day ${day.index}: Plan B has higher difficulty`);
  assert.ok(trip.routeLoad(backup) < trip.routeLoad(primary), `day ${day.index}: Plan B has higher load`);
  assert.equal(Boolean(backup.chains), false, `day ${day.index}: Plan B should avoid chains`);
  assert.notEqual(backup.exposure, 'high', `day ${day.index}: Plan B should avoid high exposure`);
}

const giewont = routes.find(route => route.id === 'giewont');
const kozia = routes.find(route => route.id === 'kozia-przelecz');
const official = { tpn: { ok: true, routeMentions: [] } };
const goodDay = { fit: { level: 'good', reasons: [] }, summit: { minTemp: 8, maxTemp: 14, maxGust: 24, maxPrecipProb: 10, precipMm: 0 } };
const dangerDay = { fit: { level: 'avoid', reasons: ['Грозовой код в прогнозе.'] }, summit: {} };
assert.notEqual(trip.morningBriefing(giewont, dangerDay, official, profile, {}, routes, {}, zones).key, 'go', 'avoid forecast must never return GO');
assert.equal(trip.morningBriefing(giewont, goodDay, official, profile, { wet: true }, routes, {}, zones).key, 'skip', 'wet chains should skip the high route');
assert.notEqual(trip.morningBriefing(giewont, goodDay, { tpn: { ok: false } }, profile, {}, routes, {}, zones).key, 'go', 'missing official check must never return GO');
const easy = routes.find(route => route.id === 'morskie-oko');
assert.notEqual(trip.morningBriefing(easy, goodDay, official, profile, {}, routes, {}, zones).key, 'go', 'unread official bulletin must never return GO');
assert.equal(trip.morningBriefing(easy, goodDay, official, profile, { officialRead: true }, routes, {}, zones).key, 'go', 'compatible easy route may return GO only after manual TPN confirmation');
assert.equal(trip.morningBriefing(kozia, goodDay, official, profile, { officialRead: true }, routes, {}, zones).key, 'skip', 'closed route must always return SKIP');

console.log(`trip intelligence: ${routes.length} route profiles, ${plan.days.length} trip days, Plan B and briefing invariants OK`);
