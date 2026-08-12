const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { createGroupVoteStore } = require('../lib/group-votes');

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tatry-vote-'));
const filePath = path.join(dir, 'votes.json');
let clock = Date.parse('2026-08-12T09:00:00Z');
const options = { filePath, validRouteIds: ['giewont', 'rysy', 'nosal'], now: () => clock, ttlMs: 1000 };

const store = createGroupVoteStore(options);
const poll = store.create({ routeIds: ['giewont', 'rysy'], title: '  Weekend   summit  ' });
assert.match(poll.id, /^[A-Z2-9]{7}$/);
assert.strictEqual(poll.title, 'Weekend summit');
assert.throws(() => store.create({ routeIds: ['giewont'] }), /two or three/);

store.vote(poll.id, { name: 'Дима', routeId: 'giewont' });
store.vote(poll.id, { name: '  дИМА ', routeId: 'rysy' });
let loaded = createGroupVoteStore(options).get(poll.id);
assert.strictEqual(Object.keys(loaded.votes).length, 1, 'same visible name should update one vote');
assert.strictEqual(Object.values(loaded.votes)[0].routeId, 'rysy');

clock += 1001;
loaded = createGroupVoteStore(options).get(poll.id);
assert.strictEqual(loaded, null, 'expired vote should not load');

if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
fs.rmdirSync(dir);
console.log('group voting: create, update, persistence and expiry invariants OK');
