import assert from 'node:assert/strict';
import { createMotoCounter } from '../src/app/moto/moto-counter.ts';
import { parseMotoMessage } from '../src/app/moto/moto-bridge.ts';

const id = 'cd270e40-7579-4180-9fa6-0183813b8950';
const completion = { id, league: 0, track: 0, timeMs: 9240 };
const memory = new Map();
const storage = { getItem: (k) => memory.get(k) ?? null, setItem: (k, v) => memory.set(k, v) };
const reply = (total) => new Response(JSON.stringify({ total }));
let requests = [],
  offline = true;
const received = new Set();
const request = async (_url, options = {}) => {
  if (!options.body) return reply(String(received.size));
  const data = JSON.parse(options.body);
  requests.push(data);
  if (offline) throw new Error('offline');
  received.add(data.id);
  return reply(String(received.size));
};
let totals = [];
const client = createMotoCounter('/counter', (n) => totals.push(n), storage, request);
client.record(completion);
await new Promise((resolve) => setImmediate(resolve));
assert.equal(JSON.parse([...memory.values()][0]).length, 1, 'offline finish persists');
offline = false;
const reloaded = createMotoCounter('/counter', (n) => totals.push(n), storage, request);
await reloaded.flush();
assert.equal(requests[0].id, requests[1].id, 'reload retries with the same ID');
assert.equal(totals.at(-1), '1');
assert.equal(JSON.parse([...memory.values()][0]).length, 0);
reloaded.record(completion);
await new Promise((resolve) => setImmediate(resolve));
assert.equal(received.size, 1, 'duplicate delivery is idempotent');
reloaded.record({ ...completion, id: '38e7c027-3ead-41d0-a563-2d180d8dac16' });
await new Promise((resolve) => setImmediate(resolve));
assert.equal(totals.at(-1), '2', 'another finish on the same track counts');
const observer = createMotoCounter('/counter', (n) => totals.push(n), undefined, request);
await observer.refresh();
assert.equal(totals.at(-1), '2', 'another player sees the global value');

let releaseGet;
const stale = createMotoCounter(
  '/counter',
  (n) => totals.push(n),
  undefined,
  async (_url, options) => {
    if (options.method === 'POST') return reply('12');
    return new Promise((resolve) => {
      releaseGet = () => resolve(reply('9'));
    });
  }
);
const reading = stale.refresh();
stale.record(completion);
await new Promise((resolve) => setImmediate(resolve));
releaseGet();
await reading;
assert.equal(totals.at(-1), '12', 'stale reads cannot decrease the counter');
const bridge = { source: 'dril-moto', type: 'finished', league: 0, track: 0, timeMs: 9240, best: false };
assert.equal(parseMotoMessage({ ...bridge, finishId: id }).finishId, id);
assert.equal(parseMotoMessage(bridge).finishId, undefined, 'old game keeps analytics compatibility');
assert.equal(parseMotoMessage({ ...bridge, finishId: 'bad' }).finishId, undefined);
console.log(
  'ok - persistence, retries, duplicate delivery, repeat finishes, shared reads, stale responses, bridge IDs'
);
