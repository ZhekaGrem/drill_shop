// scripts/check-typing-demo.mjs
// Перевірки розгортання сценарію демо-набору (features/wishes/lib/typing-demo.ts)
// у кадри. Тестового раннера в проєкті нема, тому звичайний node + node:assert:
//   node scripts/check-typing-demo.mjs
import assert from 'node:assert/strict';
import { TYPING_DEMO_SCRIPT, expandTypingScript } from '../src/features/wishes/lib/typing-demo.ts';

let n = 0;
const check = (name, fn) => {
  fn();
  n += 1;
  console.log('ok -', name);
};

// Детермінований «випадок»: середина діапазону, щоб тривалості були стабільні
const frames = expandTypingScript(TYPING_DEMO_SCRIPT, () => 0.5);
const texts = frames.map((f) => f.text);
const FINAL = 'введи шоб ти хотів шоб ми зробили і ми може зробим, а шо';

check('є кадри, кожен із додатною затримкою і рядком', () => {
  assert.ok(frames.length > 100);
  for (const f of frames) {
    assert.equal(typeof f.text, 'string');
    assert.ok(f.delay > 0, `delay ${f.delay}`);
    assert.ok(['type', 'erase', 'pause'].includes(f.kind), f.kind);
  }
});

check('набір іде по одній літері', () => {
  let prev = '';
  for (const f of frames) {
    if (f.kind === 'type') {
      assert.ok(f.text.startsWith(prev), 'префікс збережено');
      assert.equal([...f.text].length, [...prev].length + 1);
    }
    prev = f.text;
  }
});

check('перша репліка обривається і стирається до порожнього', () => {
  const full = texts.indexOf('хотів би шоб ви зробили камізельку таку файну з надписом дзідзьо бог');
  assert.ok(full > 0);
  assert.ok(texts.indexOf('', full) > full, 'після репліки є порожній кадр');
});

check('«дзідз» стирається бекспейсом і дописується «океана ельзи»', () => {
  const a = texts.indexOf('кароче я б хотів шоб ви написали новий альбом для дзідз');
  const b = texts.indexOf('кароче я б хотів шоб ви написали новий альбом для ', a);
  const c = texts.indexOf('кароче я б хотів шоб ви написали новий альбом для океана ельзи', b);
  assert.ok(a > 0 && b > a && c > b, `${a} ${b} ${c}`);
  // між a і b рівно пʼять кадрів стирання (д, з, і, д, з)
  assert.equal(b - a - frames.slice(a + 1, b).filter((f) => f.kind === 'pause').length, 5);
});

check('останній кадр — фінальна репліка, і вона лишається', () => {
  assert.equal(frames[frames.length - 1].text, FINAL);
});

check('стирання швидше за набір, пауза найдовша', () => {
  const avg = (kind) => {
    const xs = frames.filter((f) => f.kind === kind).map((f) => f.delay);
    return xs.reduce((s, x) => s + x, 0) / xs.length;
  };
  assert.ok(avg('erase') < avg('type'), 'erase < type');
  assert.ok(avg('pause') > avg('type') * 5, 'pause >> type');
});

check('уся вистава триває від 15 до 45 секунд', () => {
  const total = frames.reduce((s, f) => s + f.delay, 0);
  assert.ok(total > 15_000 && total < 45_000, `total ${total}`);
});

console.log(`ok: ${n} checks`);
