const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const CODE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
const DEFAULT_TTL_MS = 60 * 24 * 60 * 60 * 1000;

function cleanText(value, maxLength) {
  return String(value || '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function voterKey(name) {
  return cleanText(name, 32).toLocaleLowerCase('ru-RU');
}

function createCode(existing) {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const bytes = crypto.randomBytes(7);
    let code = '';
    for (const byte of bytes) code += CODE_ALPHABET[byte % CODE_ALPHABET.length];
    if (!existing.has(code)) return code;
  }
  throw new Error('Could not allocate a vote code');
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createGroupVoteStore({ filePath, validRouteIds, now = () => Date.now(), ttlMs = DEFAULT_TTL_MS }) {
  const allowed = new Set(validRouteIds || []);
  const polls = new Map();

  function load() {
    if (!filePath || !fs.existsSync(filePath)) return;
    try {
      const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      for (const poll of Object.values(parsed.polls || {})) {
        if (!poll?.id || !Array.isArray(poll.routeIds) || poll.routeIds.some((id) => !allowed.has(id))) continue;
        if (Date.parse(poll.expiresAt) <= now()) continue;
        polls.set(poll.id, poll);
      }
    } catch (error) {
      console.error(`Could not load group votes: ${error.message}`);
    }
  }

  function prune() {
    let changed = false;
    for (const [id, poll] of polls) {
      if (Date.parse(poll.expiresAt) <= now()) { polls.delete(id); changed = true; }
    }
    return changed;
  }

  function persist() {
    if (!filePath) return;
    prune();
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    const tempPath = `${filePath}.${process.pid}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify({ version: 1, polls: Object.fromEntries(polls) }, null, 2));
    fs.renameSync(tempPath, filePath);
  }

  function create({ routeIds, title }) {
    const unique = [...new Set(Array.isArray(routeIds) ? routeIds : [])];
    if (unique.length < 2 || unique.length > 3) throw Object.assign(new Error('Choose two or three routes'), { status: 400 });
    if (unique.some((id) => !allowed.has(id))) throw Object.assign(new Error('Unknown route in shortlist'), { status: 400 });
    const id = createCode(polls);
    const createdAt = new Date(now()).toISOString();
    const poll = {
      id,
      title: cleanText(title, 70) || 'Какой маршрут выбираем?',
      routeIds: unique,
      votes: {},
      createdAt,
      updatedAt: createdAt,
      expiresAt: new Date(now() + ttlMs).toISOString()
    };
    polls.set(id, poll);
    persist();
    return clone(poll);
  }

  function get(code) {
    const id = String(code || '').toUpperCase();
    const poll = polls.get(id);
    if (!poll || Date.parse(poll.expiresAt) <= now()) {
      if (poll) { polls.delete(id); persist(); }
      return null;
    }
    return clone(poll);
  }

  function vote(code, { name, routeId }) {
    const id = String(code || '').toUpperCase();
    const poll = polls.get(id);
    if (!poll || Date.parse(poll.expiresAt) <= now()) throw Object.assign(new Error('Vote not found or expired'), { status: 404 });
    const displayName = cleanText(name, 32);
    const key = voterKey(displayName);
    if (displayName.length < 2) throw Object.assign(new Error('Enter a name'), { status: 400 });
    if (!poll.routeIds.includes(routeId)) throw Object.assign(new Error('Route is not in this vote'), { status: 400 });
    const updatedAt = new Date(now()).toISOString();
    poll.votes[key] = { name: displayName, routeId, updatedAt };
    poll.updatedAt = updatedAt;
    persist();
    return clone(poll);
  }

  load();
  return { create, get, vote, persist, size: () => polls.size };
}

module.exports = { createGroupVoteStore, cleanText, voterKey };
