const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const englishHome = read('public/index.en.html');
const englishRoute = read('public/route.en.html');
const russianHome = read('public/index.html');
const russianRoute = read('public/route.html');
const app = read('public/app.js');
const routeApp = read('public/route.js');
const server = read('server.js');
const routeData = JSON.parse(read('data/routes.json'));

assert.match(englishHome, /<html lang="en">/);
assert.match(englishRoute, /<html lang="en">/);
assert.doesNotMatch(englishHome, /id="(?:chill-time|photo-code)"/);
assert.doesNotMatch(englishHome, /map-points\.js|Pająkówka 11f|НАШ ДОМ/);
assert.doesNotMatch(englishRoute, /map-points\.js|Pająkówka 11f|НАШ ДОМ/);
assert.match(russianHome, /class="lang-switch" href="\/en\/"/);
assert.match(russianRoute, /id="routeLanguageSwitch"/);
assert(server.includes("path.join(PUBLIC,'route.en.html')"));
assert.match(server, /url\.pathname==='\/en'/);
assert.match(app, /if\(!EN&&window\.TatryMapPoints\)window\.TatryMapPoints\.addHomeMarker/);
assert.match(routeApp, /const straight=!EN&&HOME_BASE/);
assert.match(routeApp, /const homeNavigation=!EN&&HOME_BASE/);
assert.match(routeApp, /if\(!EN&&window\.TatryMapPoints\)window\.TatryMapPoints\.addHomeMarker\(trailMap\)/);

const context = { window: {}, document: { documentElement: { lang: 'en' } } };
context.window.window = context.window;
context.window.document = context.document;
vm.createContext(context);
vm.runInContext(read('public/locale-en-data.js'), context);
vm.runInContext(read('public/locale.js'), context);
vm.runInContext(read('public/field-maps.js'), context);

const i18n = context.window.TatryI18n;
const englishRoutes = i18n.localizeRoutes(routeData);
assert.equal(englishRoutes.length, 29);
assert.equal(Object.keys(context.window.TATRY_EN_ROUTE_COPY).length, routeData.length);
for (const route of englishRoutes) {
  assert.doesNotMatch(JSON.stringify(route), /[А-Яа-яЁё]/, `${route.id}: English route data contains Cyrillic`);
  assert.notEqual(route.start, 'Apartamenty Polana Pająkówka', `${route.id}: accommodation identity should not be an English trailhead`);
  const fieldMap = i18n.localizeFieldMap(context.window.TATRY_FIELD_MAPS[route.id], route);
  assert(fieldMap, `${route.id}: English Field Map should exist`);
  assert.doesNotMatch(JSON.stringify(fieldMap), /[А-Яа-яЁё]|Apartamenty Polana Pająkówka|FROM HOME/, `${route.id}: English Field Map contains private or untranslated copy`);
}

console.log('English version: 29 localized routes, clean route shells, no Chill Time, Photo Code or private home UI');
