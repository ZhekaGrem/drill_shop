// Run with Node 22.18+ (native TypeScript stripping).
import assert from 'node:assert/strict';
import { sampleMotion } from '../src/widgets/HeroVisual/motionPresets.ts';
import { animationForDesign, ANIMATION_BY_DESIGN } from '../src/shared/config/animation.ts';
import {
  ROTATION_ANCHOR_MS,
  ROTATION_SLOT_DAYS,
  ROTATION_ORDER,
  designForTime,
  nextRotationAt,
} from '../src/shared/config/design-rotation.ts';

const near = (a, b, epsilon = 1e-8) => assert.ok(Math.abs(a - b) < epsilon, `${a} != ${b}`);
for (let t = 0; t < 24; t += 0.125) {
  const a = sampleMotion('turntable', t);
  const b = sampleMotion('turntable', t + 0.125);
  near(b.y - a.y, Math.PI / 48);
  for (const key of ['x', 'z', 'lift']) near(a[key], 0);
}
for (const t of [0, 1, 2, 10, 11]) near(Math.cos(sampleMotion('showcase', t).y), 1);
for (const t of [4, 5, 6, 7, 8]) near(sampleMotion('showcase', t).y, Math.PI);
for (const t of [2, 4, 8, 10]) {
  near(sampleMotion('showcase', t + 0.0001).y, sampleMotion('showcase', t - 0.0001).y, 1e-7);
}
for (const [preset, period] of [
  ['turntable', 12],
  ['showcase', 12],
  ['pendulum', 8],
  ['float', 8],
]) {
  for (let t = 0; t < period; t += 0.125) {
    const a = sampleMotion(preset, t);
    const b = sampleMotion(preset, t + period);
    assert.ok(Object.values(a).every(Number.isFinite));
    for (const key of ['x', 'z', 'lift']) near(a[key], b[key]);
    near(Math.sin(a.y), Math.sin(b.y));
    near(Math.cos(a.y), Math.cos(b.y));
  }
}
console.log('PASS: axial rotation, print viewing pauses, smooth transitions, seamless loops');

// Exact calendar boundaries, including negative slots and full-cycle wraparound.
const slotMs = ROTATION_SLOT_DAYS * 86_400_000;
const expected = ['turntable', 'pendulum', 'float', 'showcase'];
assert.equal(ROTATION_ORDER.length, expected.length);
for (let slot = -8; slot <= 8; slot++) {
  const start = ROTATION_ANCHOR_MS + slot * slotMs;
  const index = ((slot % 4) + 4) % 4;
  for (const time of [start, start + slotMs / 2, start + slotMs - 1]) {
    assert.equal(animationForDesign(designForTime(time)), expected[index]);
    assert.equal(nextRotationAt(time), start + slotMs);
  }
  assert.notEqual(animationForDesign(designForTime(start - 1)), animationForDesign(designForTime(start)));
}
for (const preset of Object.values(ANIMATION_BY_DESIGN)) {
  assert.ok(['turntable', 'showcase', 'pendulum', 'float', 'current'].includes(preset));
}
console.log('PASS: animations follow every design slot and stay stable within it');
