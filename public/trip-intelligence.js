(function initTatryTrip(root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.TatryTrip = api;
})(typeof globalThis !== 'undefined' ? globalThis : window, function tatryTripFactory(root) {
  const KEYS = {
    profile: 'tatry-field:trip-profile:v1',
    plan: 'tatry-field:trip-plan:v1',
    pack: 'tatry-field:pack-checks:v1'
  };

  const DEFAULT_PROFILE = {
    configured: false,
    maxHours: 6,
    maxAscent: 800,
    chains: 'never',
    exposure: 'careful'
  };

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const number = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const unique = values => [...new Set(values.filter(Boolean))];

  function read(key, fallback) {
    try {
      if (!root.localStorage) return fallback;
      const value = JSON.parse(root.localStorage.getItem(key));
      return value == null ? fallback : value;
    } catch { return fallback; }
  }

  function write(key, value, eventName) {
    try { root.localStorage?.setItem(key, JSON.stringify(value)); } catch { /* private mode */ }
    try { root.dispatchEvent?.(new root.CustomEvent(eventName, { detail: value })); } catch { /* node */ }
    return value;
  }

  function normalizeProfile(input = {}) {
    return {
      configured: Boolean(input.configured),
      maxHours: clamp(number(input.maxHours, DEFAULT_PROFILE.maxHours), 3, 12),
      maxAscent: clamp(number(input.maxAscent, DEFAULT_PROFILE.maxAscent), 300, 1800),
      chains: ['never', 'tried', 'confident'].includes(input.chains) ? input.chains : DEFAULT_PROFILE.chains,
      exposure: ['avoid', 'careful', 'comfortable'].includes(input.exposure) ? input.exposure : DEFAULT_PROFILE.exposure
    };
  }

  function getProfile() { return normalizeProfile(read(KEYS.profile, DEFAULT_PROFILE)); }
  function setProfile(profile) { return write(KEYS.profile, normalizeProfile({ ...profile, configured: true }), 'tatry:trip-profile'); }

  function personalizedDifficulty(route, profile = getProfile()) {
    const p = normalizeProfile(profile);
    if (!p.configured) return { status: 'unknown', label: 'Заполни профиль', score: route.diff, gaps: [], note: 'Тогда сложность пересчитается под твой опыт.' };
    const gaps = [];
    let pressure = 0;
    if (route.hours > p.maxHours) {
      const delta = route.hours - p.maxHours;
      pressure += delta > 2 ? 2 : 1;
      gaps.push(`день на ${Math.round(delta * 10) / 10} ч дольше привычного`);
    }
    if (route.ascent > p.maxAscent) {
      const delta = route.ascent - p.maxAscent;
      pressure += delta > 450 ? 2 : 1;
      gaps.push(`набор на ${Math.round(delta / 50) * 50} м выше привычного`);
    }
    if (route.chains && p.chains === 'never') { pressure += 2; gaps.push('цепи без предыдущего опыта'); }
    else if (route.chains && p.chains === 'tried') { pressure += .5; gaps.push('цепи потребуют запаса времени'); }
    if (route.exposure === 'high' && p.exposure === 'avoid') { pressure += 2; gaps.push('сильная экспозиция'); }
    else if (route.exposure === 'high' && p.exposure === 'careful') { pressure += .75; gaps.push('открытый рельеф'); }
    if (route.diff >= 4 && p.maxAscent < 1000) { pressure += .5; gaps.push('высокогорная сложность'); }
    const score = clamp(Math.round(route.diff + pressure * .65), 1, 5);
    const status = pressure >= 3 ? 'beyond' : pressure >= 1 ? 'stretch' : 'fit';
    const labels = { fit: 'В твоём диапазоне', stretch: 'Амбициозно', beyond: 'Пока большой скачок' };
    return { status, label: labels[status], score, gaps: unique(gaps).slice(0, 3), pressure };
  }

  function routeLoad(route) {
    return number(route.diff, 1) * 1.25 + number(route.hours, 0) * .35 + number(route.ascent, 0) / 520 + (route.chains ? 1.2 : 0) + (route.exposure === 'high' ? 1 : 0);
  }

  function zoneRouteSet(zoneId, zones = []) {
    const zone = zones.find(item => item.id === zoneId);
    return new Set(zone?.routes || []);
  }

  function scoreRoute(route, context) {
    const fit = personalizedDifficulty(route, context.profile);
    const inZone = context.zoneRoutes.has(route.id) || route.stayZone === context.zoneId;
    const saved = context.savedIds.has(route.id);
    const logistics = number(route.logistics, 3) + number(route.returnToZakopane?.score, 3);
    let score = number(route.beauty, 3) * 3 + logistics * (context.car ? .7 : 1.7) + (inZone ? 16 : 0) + (saved ? 30 : 0);
    if (fit.status === 'fit') score += 22;
    if (fit.status === 'stretch') score += context.rhythm === 'ambitious' ? 18 : 5;
    if (fit.status === 'beyond') score -= context.rhythm === 'ambitious' ? 18 : 65;
    if (context.rhythm === 'scenic') score += number(route.beauty, 3) * 5 - number(route.crowd, 3) * 1.5;
    if (context.rhythm === 'balanced') score -= Math.abs(routeLoad(route) - 7) * 2;
    if (context.rhythm === 'ambitious') score += number(route.diff, 1) * 3 + number(route.ascent, 0) / 250;
    if (context.used.has(route.id)) score -= 1000;
    if (context.previousLoad > 8 && routeLoad(route) > 7.2) score -= 42;
    return score;
  }

  function planBFor(primary, routes, options = {}, profile = getProfile(), zones = []) {
    if (!primary) return null;
    const zoneRoutes = zoneRouteSet(options.zoneId, zones);
    const primaryLoad = routeLoad(primary);
    const candidates = routes.filter(route => route.id !== primary.id && !route.temporarilyClosed && !route.chains && route.exposure !== 'high' && route.diff <= primary.diff && route.hours <= primary.hours + .5 && routeLoad(route) < primaryLoad);
    return candidates.sort((a, b) => {
      const rank = route => {
        const fit = personalizedDifficulty(route, profile);
        return (zoneRoutes.has(route.id) || route.stayZone === options.zoneId ? 18 : 0) + number(route.beauty, 3) * 3 + number(route.logistics, 3) * 2 + (fit.status === 'fit' ? 18 : fit.status === 'stretch' ? 5 : -25) - routeLoad(route);
      };
      return rank(b) - rank(a);
    })[0] || null;
  }

  function isoDate(date, offset) {
    const base = date ? new Date(`${date}T12:00:00`) : new Date();
    base.setDate(base.getDate() + offset);
    return `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, '0')}-${String(base.getDate()).padStart(2, '0')}`;
  }

  function generateTrip(routes, options = {}, profile = getProfile(), saved = [], zones = []) {
    const normalized = {
      startDate: options.startDate || isoDate('', 1),
      days: clamp(number(options.days, 3), 2, 5),
      zoneId: options.zoneId || zones[0]?.id || '',
      car: Boolean(options.car),
      rhythm: ['balanced', 'scenic', 'ambitious'].includes(options.rhythm) ? options.rhythm : 'balanced'
    };
    const availableRoutes = routes.filter(route => !route.temporarilyClosed);
    const context = { ...normalized, profile: normalizeProfile(profile), savedIds: new Set(saved), zoneRoutes: zoneRouteSet(normalized.zoneId, zones), used: new Set(), previousLoad: 0 };
    const days = [];
    for (let index = 0; index < normalized.days; index += 1) {
      const primary = [...availableRoutes].sort((a, b) => scoreRoute(b, context) - scoreRoute(a, context))[0];
      if (!primary) break;
      const fit = personalizedDifficulty(primary, context.profile);
      days.push({ index, date: isoDate(normalized.startDate, index), primaryId: primary.id, backupId: null, fit, load: Math.round(routeLoad(primary) * 10) / 10 });
      context.used.add(primary.id);
      context.previousLoad = routeLoad(primary);
    }
    const primaryIds = new Set(days.map(day => day.primaryId));
    const backupIds = new Set();
    days.forEach(day => {
      const primary = availableRoutes.find(route => route.id === day.primaryId);
      const cleanPool = availableRoutes.filter(route => !primaryIds.has(route.id) && !backupIds.has(route.id));
      const fallbackPool = availableRoutes.filter(route => !primaryIds.has(route.id));
      const backup = planBFor(primary, cleanPool, normalized, context.profile, zones) || planBFor(primary, fallbackPool, normalized, context.profile, zones);
      day.backupId = backup?.id || null;
      if (backup) backupIds.add(backup.id);
    });
    return { ...normalized, days, createdAt: new Date().toISOString() };
  }

  function getTrip() { return read(KEYS.plan, null); }
  function setTrip(plan) { return write(KEYS.plan, plan, 'tatry:trip-plan'); }
  function clearTrip() { try { root.localStorage?.removeItem(KEYS.plan); } catch { /* private mode */ } return write(KEYS.plan, null, 'tatry:trip-plan'); }

  function packingList(route) {
    const items = [];
    const routeGear = route.gear || [];
    const gearMatch = pattern => routeGear.find(label => pattern.test(label));
    const add = (id, label, category, reason, critical = false) => {
      if (!items.some(item => item.id === id || item.label.toLowerCase() === label.toLowerCase())) items.push({ id, label, category, reason, critical });
    };
    add('offline-map', 'Телефон + offline-карта маршрута', 'core', 'Связь и интернет в горах нестабильны.', true);
    add('powerbank', 'Полный powerbank и короткий кабель', 'core', 'Навигация и холод быстро расходуют батарею.', true);
    add('water', gearMatch(/вод/i) || (route.hours >= 7 ? 'Вода на длинный день + резерв' : 'Вода в двух ёмкостях'), 'core', 'Не рассчитывай на случайный источник.', true);
    add('food', gearMatch(/ед[ау]|перекус/i) || (route.hours >= 7 ? 'Еда на день + два резервных перекуса' : 'Еда + резервный перекус'), 'core', 'Запас нужен на задержку и обратный путь.', true);
    add('headlamp', 'Налобный фонарь', 'core', 'Даже при дневном плане.', true);
    add('first-aid', 'Мини-аптечка и пластыри от мозолей', 'core', 'База для любой длины маршрута.', true);
    add('shell', 'Waterproof shell', 'wear', 'Погода наверху меняется быстрее, чем в Zakopane.', true);
    add('warm-layer', route.maxAlt >= 1800 ? 'Флис + сухой утепляющий слой' : 'Флис или тёплый слой', 'wear', 'Остановки и ветер быстро охлаждают.');
    add('sun', 'SPF, очки и головной убор', 'wear', 'Высота усиливает солнце.');
    add('waste', 'Пакет для своего мусора', 'core', 'Всё принесённое уходит обратно.');
    if (route.hours >= 8) add('dry-layer', 'Запасной сухой слой и носки', 'route', 'Большой день даёт больше шансов промокнуть или остыть.');
    if (route.ascent >= 1000) add('electrolytes', 'Дополнительная вода/электролиты', 'route', 'Большой набор высоты увеличивает расход жидкости.');
    if (route.chains) add('chain-gloves', 'Прочные перчатки для цепей', 'route', 'Защищают руки и улучшают хват.', true);
    if (route.exposure === 'high' || route.diff >= 4) {
      add('emergency', 'Emergency blanket и свисток', 'route', 'На открытом сложном рельефе нужен дополнительный запас.');
      add('paper-map', 'Бумажная карта или второй offline-девайс', 'route', 'Одна батарея не должна быть единственным планом.');
    }
    if ((route.risks || []).some(value => /камн|rock/i.test(value))) add('helmet', 'Шлем, если его требует рельеф и твои навыки', 'route', 'Маршрут отмечает риск падающих камней.');
    routeGear.forEach((label, index) => {
      if (/вод|ед[ау]|перекус|дожд|ветр|т[её]пл|утеп|налоб|power|офлайн|перчат|обув|SPF|каск|опыт/i.test(label)) return;
      add(`route-gear-${index}`, label, 'route', 'Рекомендация из карточки этого маршрута.');
    });
    add('tpn-check', 'Открыть свежий bulletin TPN', 'morning', 'Проверить закрытия, ремонт и состояние троп.', true);
    add('summit-weather', 'Проверить ветер, осадки и грозу наверху', 'morning', 'Прогноз в городе не описывает хребет.', true);
    add('turnaround', 'Назначить время разворота', 'morning', 'Решение проще принять заранее.', true);
    add('group-check', 'Проверить состояние всей группы', 'morning', 'Темп задаёт самый уставший участник.', true);
    return items;
  }

  function getPackState(routeId) { return new Set(read(KEYS.pack, {})[routeId] || []); }
  function setPackState(routeId, ids) {
    const all = read(KEYS.pack, {});
    all[routeId] = [...new Set(ids)];
    write(KEYS.pack, all, 'tatry:pack-state');
    return new Set(all[routeId]);
  }
  function togglePackItem(routeId, itemId, checked) {
    const state = getPackState(routeId);
    if (checked) state.add(itemId); else state.delete(itemId);
    return setPackState(routeId, state);
  }
  function clearPackState(routeId) { return setPackState(routeId, []); }

  function morningBriefing(route, weatherDay, official, profile = getProfile(), observations = {}, routes = [], options = {}, zones = []) {
    let severity = 0;
    const reasons = [];
    const raise = (level, reason) => { severity = Math.max(severity, level); if (reason) reasons.push(reason); };
    const fit = weatherDay?.fit;
    if (route.temporarilyClosed) raise(2, route.closure?.text || 'Маршрут официально закрыт.');
    if (!weatherDay || !fit) raise(1, 'Нет полного свежего прогноза для старта и верхней точки.');
    else if (fit.level === 'avoid') raise(2, ...(fit.reasons?.slice(0, 1) || ['Погодные условия не подходят для высокого маршрута.']));
    else if (fit.level === 'caution') (fit.reasons || ['Прогноз требует корректировки плана.']).forEach(reason => raise(1, reason));
    else if (fit.level === 'unknown') raise(1, 'Прогноз неполный — проверь его вручную.');
    const personal = personalizedDifficulty(route, profile);
    if (personal.status === 'unknown') raise(1, 'Профиль опыта не заполнен.');
    if (personal.status === 'stretch') raise(1, `Для тебя маршрут амбициозный: ${personal.gaps[0] || 'нужен запас'}.`);
    if (personal.status === 'beyond') raise(route.diff >= 4 || route.exposure === 'high' ? 2 : 1, `Маршрут заметно выше привычной нагрузки: ${personal.gaps[0] || 'большой скачок'}.`);
    if (!official?.tpn?.ok) raise(1, 'Автопроверка TPN не подтверждена — открой официальный bulletin.');
    if (official?.tpn?.routeMentions?.length) raise(1, 'TPN упоминает этот маршрут: прочитай исходное сообщение полностью.');
    if (!observations.officialRead) raise(1, 'Подтверди, что свежий bulletin TPN прочитан полностью.');
    if (observations.wet) raise(route.chains || route.exposure === 'high' ? 2 : 1, 'Мокрая скала меняет сцепление и цену ошибки.');
    if (observations.snow) raise(route.diff >= 3 || route.exposure === 'high' ? 2 : 1, 'Снег или лёд требуют зимних навыков и снаряжения.');
    if (observations.lowVisibility) raise(route.exposure === 'high' ? 2 : 1, 'Плохая видимость усложняет навигацию и оценку рельефа.');
    if (observations.groupNotReady) raise(2, 'Группа устала, плохо себя чувствует или не уверена в продолжении.');
    const key = severity >= 2 ? 'skip' : severity === 1 ? 'adjust' : 'go';
    const labels = { go: 'GO*', adjust: 'ADJUST', skip: 'SKIP HIGH ROUTE' };
    return {
      key,
      label: labels[key],
      reasons: unique(reasons).slice(0, 6),
      personal,
      alternative: key === 'go' ? null : planBFor(route, routes, options, profile, zones),
      caveat: 'Это briefing для решения, а не разрешение на выход. Последнее слово — свежие TPN/TOPR, фактические условия и состояние группы.'
    };
  }

  return {
    KEYS, DEFAULT_PROFILE, normalizeProfile, getProfile, setProfile,
    personalizedDifficulty, routeLoad, planBFor, generateTrip, getTrip, setTrip, clearTrip,
    packingList, getPackState, togglePackItem, clearPackState, morningBriefing
  };
});
