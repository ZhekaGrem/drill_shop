// scripts/check-wish-message.mjs
// Перевірки чистої логіки роуту побажань (features/wishes/lib/wish-message.ts).
// Тестового раннера в проєкті нема, тому звичайний node + node:assert:
//   node scripts/check-wish-message.mjs
// .mjs, а не .ts: tsconfig включає **/*.ts і не дозволяє імпорт з .ts-розширенням.
import assert from 'node:assert/strict';
import { validateWish, formatWishMessage } from '../src/features/wishes/lib/wish-message.ts';

let n = 0;
const check = (name, fn) => {
  fn();
  n += 1;
  console.log('ok -', name);
};

check('порожній текст → помилка', () => {
  assert.deepEqual(validateWish({ message: '   ' }), { ok: false, error: 'Напиши хоч кілька слів' });
});

check('два символи → помилка, три → ок', () => {
  assert.equal(validateWish({ message: 'ab' }).ok, false);
  assert.equal(validateWish({ message: 'abc' }).ok, true);
});

check('1001 символ → помилка, 1000 → ок', () => {
  assert.equal(validateWish({ message: 'x'.repeat(1001) }).ok, false);
  assert.equal(validateWish({ message: 'x'.repeat(1000) }).ok, true);
});

check('текст обрізається по краях, порожній контакт → undefined', () => {
  assert.deepEqual(validateWish({ message: '  штани  ', contact: '  ' }), {
    ok: true,
    wish: { message: 'штани', contact: undefined, page: undefined },
  });
});

check('контакт обрізається до 100 символів', () => {
  const r = validateWish({ message: 'штани', contact: 'a'.repeat(150) });
  assert.equal(r.ok && r.wish.contact.length, 100);
});

check('page без / або довший за 200 ігнорується, коректний лишається', () => {
  assert.equal(validateWish({ message: 'штани', page: 'http://x' }).wish.page, undefined);
  assert.equal(validateWish({ message: 'штани', page: '/' + 'a'.repeat(200) }).wish.page, undefined);
  assert.equal(
    validateWish({ message: 'штани', page: '/' + 'a'.repeat(199) }).wish.page,
    '/' + 'a'.repeat(199)
  );
  assert.equal(validateWish({ message: 'штани', page: '/catalog' }).wish.page, '/catalog');
});

check('не-рядки і порожнє тіло не валять', () => {
  assert.equal(validateWish({ message: 42 }).ok, false);
  assert.equal(validateWish(null).ok, false);
  const r = validateWish({ message: 'штани', contact: 7, page: 9 });
  assert.equal(r.ok, true);
  assert.equal(r.ok && r.wish.contact, undefined);
  assert.equal(r.ok && r.wish.page, undefined);
});

check('переноси рядків у контакті й сторінці згортаються в пробіл', () => {
  const r = validateWish({ message: 'штани', contact: 'a\nb', page: '/x\ny' });
  assert.equal(r.ok && r.wish.contact, 'a b');
  assert.equal(r.ok && r.wish.page, '/x y');
});

check('формат повідомлення з контактом і сторінкою', () => {
  const text = formatWishMessage(
    { message: 'штани *_[]()', contact: '@nick', page: '/catalog' },
    'https://www.ye-dril.com',
    new Date('2026-09-17T12:00:00Z')
  );
  assert.equal(
    text,
    [
      '#побажання',
      'Побажання з сайту',
      '',
      'штани *_[]()',
      '',
      'Контакт: @nick',
      'Сторінка: https://www.ye-dril.com/catalog',
      'Час: 17.09.2026, 15:00:00',
    ].join('\n')
  );
});

check('формат без контакту і без сторінки', () => {
  const text = formatWishMessage(
    { message: 'штани' },
    'https://www.ye-dril.com',
    new Date('2026-09-17T12:00:00Z')
  );
  assert.equal(text.includes('Контакт: не залишено'), true);
  assert.equal(text.includes('Сторінка:'), false);
});

console.log(`ok: ${n} checks`);
