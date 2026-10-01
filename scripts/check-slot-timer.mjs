import assert from 'node:assert/strict';
import { createSlotTimer, MAX_SLOT_TIMEOUT_MS } from '../src/widgets/Header/slot-timer.ts';
import { slotCycle } from '../src/widgets/Header/slot-cycle.ts';

function setup(count) {
  let now = 0;
  let id = 0;
  const jobs = new Map();
  const events = [];
  const clock = {
    now: () => now,
    schedule(callback, delay) {
      assert.ok(delay >= 0 && delay <= MAX_SLOT_TIMEOUT_MS, `invalid delay ${delay}`);
      const key = ++id;
      jobs.set(key, { at: now + delay, callback });
      assert.equal(jobs.size, 1, 'only one timer may run');
      return key;
    },
    cancel: (key) => jobs.delete(key),
  };
  const advance = (ms) => {
    const end = now + ms;
    while (jobs.size) {
      const [key, job] = [...jobs].sort((a, b) => a[1].at - b[1].at)[0];
      if (job.at > end) break;
      now = job.at;
      jobs.delete(key);
      job.callback();
    }
    now = end;
  };
  const timer = createSlotTimer(count, (index) => events.push({ index, at: now }), clock);
  timer.start();
  return { timer, events, jobs, advance, now: () => now };
}

for (const hasNews of [false, true]) {
  const count = slotCycle(hasNews).length;
  const { timer, events, advance } = setup(count);
  let elapsed = 0;
  for (const seconds of [1, 1, 2, 3, 5, 8, 13]) {
    for (let phase = 0; phase < count; phase++) {
      const before = events.length;
      advance(seconds * 1000 - 1);
      assert.equal(events.length, before, 'phase must not change early');
      advance(1);
      elapsed += seconds * 1000;
      assert.deepEqual(events.at(-1), { index: (phase + 1) % count, at: elapsed });
    }
  }
  timer.dispose();
  console.log(`ok - full Fibonacci rounds ${hasNews ? 'with' : 'without'} news`);
}

{
  const { timer, events, advance } = setup(3);
  advance(300);
  timer.hold('pointer', true);
  advance(2000);
  timer.hold('focus', true);
  timer.hold('pointer', false);
  advance(2000);
  assert.equal(events.length, 0);
  timer.hold('focus', false);
  advance(699);
  assert.equal(events.length, 0);
  advance(1);
  assert.deepEqual(events.at(-1), { index: 1, at: 5000 });
  timer.dispose();
  console.log('ok - overlapping hover and focus preserve remaining time');
}

{
  const { timer, events, advance } = setup(3);
  advance(6500); // Third round: first phase has 1500ms left.
  timer.hold('panel', true);
  timer.hold('hidden', true);
  timer.hold('touch', true);
  advance(10000);
  timer.hold('panel', false);
  timer.hold('touch', false);
  advance(10000);
  assert.equal(events.length, 6);
  timer.hold('hidden', false);
  advance(1499);
  assert.equal(events.length, 6);
  advance(1);
  assert.deepEqual(events.at(-1), { index: 1, at: 28000 });
  timer.dispose();
  console.log('ok - panel, hidden tab and touch pause without resetting Fibonacci');
}

{
  const { timer, events, advance, jobs } = setup(3);
  advance(6500);
  timer.setPhaseCount(2);
  advance(1999);
  assert.equal(events.length, 6);
  advance(1);
  assert.equal(events.at(-1).index, 1);
  advance(2000);
  assert.equal(events.at(-1).index, 0);
  const before = events.length;
  advance(2999);
  assert.equal(events.length, before);
  advance(1);
  assert.equal(events.at(-1).index, 1);
  timer.setPhaseCount(0);
  assert.equal(jobs.size, 0);
  advance(10000);
  timer.setPhaseCount(2);
  advance(2999);
  assert.equal(events.length, before + 1);
  advance(1);
  assert.equal(events.at(-1).index, 1);
  timer.dispose();
  assert.equal(jobs.size, 0);
  console.log('ok - changing phase list retains duration, empty list stops');
}

{
  const { timer, events, advance, jobs, now } = setup(1);
  let current = 1;
  let next = 1;
  while (current * 1000 <= MAX_SLOT_TIMEOUT_MS) {
    advance(current * 1000);
    [current, next] = [next, current + next];
  }
  const before = events.length;
  const started = now();
  advance(MAX_SLOT_TIMEOUT_MS);
  assert.equal(events.length, before, 'first timer chunk must not advance the phase');
  assert.equal(jobs.size, 1);
  advance(current * 1000 - MAX_SLOT_TIMEOUT_MS);
  assert.equal(events.length, before + 1);
  assert.equal(events.at(-1).at, started + current * 1000);
  timer.dispose();
  console.log('ok - long Fibonacci delays use chunks without overflow or a duration cap');
}

{
  const { timer, events, advance, jobs } = setup(3);
  timer.start();
  timer.start();
  assert.equal(jobs.size, 1);
  advance(400);
  timer.dispose();
  timer.hold('focus', false);
  timer.start();
  advance(10000);
  assert.equal(events.length, 0);
  assert.equal(jobs.size, 0);
  const fresh = setup(3);
  fresh.advance(1000);
  assert.equal(fresh.events.length, 1);
  fresh.timer.dispose();
  console.log('ok - repeated start, disposal and fresh mount do not leak timers');
}
