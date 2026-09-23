// scripts/check-news.mjs
// Перевірки чистої логіки новин (shared/config/news.ts) і цілісності самого
// списку: id унікальні, дати валідні, найновіша зверху, парні поля разом.
// Тестового раннера в проєкті нема, тому звичайний node + node:assert:
//   node scripts/check-news.mjs
// .mjs, а не .ts: tsconfig включає **/*.ts і не дозволяє імпорт з .ts-розширенням.
import assert from 'node:assert/strict';
import { NEWS, latestNews, hasUnreadNews, formatNewsDate } from '../src/shared/config/news.ts';
import { slotCycle, slotPhaseAt } from '../src/widgets/Header/slot-cycle.ts';

let n = 0;
const check = (name, fn) => {
  fn();
  n += 1;
  console.log('ok -', name);
};

check('порожній список: непрочитаного нема', () => {
  assert.equal(latestNews([]), null);
  assert.equal(hasUnreadNews(null, []), false);
  assert.equal(hasUnreadNews('будь-що', []), false);
});

const sample = [
  { id: 'b', date: '2026-09-20', title: 'Нова', text: 'текст' },
  { id: 'a', date: '2026-09-01', title: 'Стара', text: 'текст' },
];

check('не бачив нічого — є непрочитане', () => {
  assert.equal(hasUnreadNews(null, sample), true);
});

check('бачив останню — непрочитаного нема', () => {
  assert.equal(hasUnreadNews('b', sample), false);
});

check('бачив лише стару — є непрочитане', () => {
  assert.equal(hasUnreadNews('a', sample), true);
});

check('мітка з видаленої новини — є непрочитане', () => {
  assert.equal(hasUnreadNews('видалена-новина', sample), true);
});

check('дата українською, без року', () => {
  assert.equal(formatNewsDate('2026-09-20'), '20 вересня');
  assert.equal(formatNewsDate('2026-01-01'), '1 січня');
  assert.equal(formatNewsDate('2026-12-31'), '31 грудня');
});

check('крива дата повертається як є, без падіння', () => {
  assert.equal(formatNewsDate('вчора'), 'вчора');
  assert.equal(formatNewsDate('2026-13-01'), '2026-13-01');
});

check('бойовий список: id унікальні й непорожні', () => {
  const ids = NEWS.map((i) => i.id);
  assert.equal(new Set(ids).size, ids.length, 'id повторюються');
  for (const id of ids) assert.match(id, /^[a-z0-9-]+$/, `кривий id: ${id}`);
});

check('бойовий список: дати валідні й ідуть від новіших до старіших', () => {
  for (const item of NEWS) assert.match(item.date, /^\d{4}-\d{2}-\d{2}$/, `крива дата: ${item.date}`);
  const dates = NEWS.map((i) => i.date);
  assert.deepEqual(dates, [...dates].sort().reverse(), 'найновіша новина має бути першою');
});

check('бойовий список: парні поля задані разом', () => {
  for (const item of NEWS) {
    assert.equal(Boolean(item.label) === Boolean(item.labelColor), true, `капсула без кольору: ${item.id}`);
    assert.equal(Boolean(item.href) === Boolean(item.hrefLabel), true, `посилання без напису: ${item.id}`);
    assert.ok(item.title.trim(), `порожній заголовок: ${item.id}`);
    assert.ok(item.text.trim(), `порожній текст: ${item.id}`);
  }
});

check('коло слота: без новин меню, Цибуля, чат, Дріл Мото і Галичина', () => {
  assert.deepEqual(slotCycle(false), ['menu', 'tsybulia', 'chat', 'moto', 'galychyna']);
});

check('коло слота: з новинами після Галичини повертається меню й дзвіночок', () => {
  const cycle = slotCycle(true);
  assert.deepEqual(cycle, ['menu', 'tsybulia', 'chat', 'moto', 'galychyna', 'menu', 'news']);
  assert.deepEqual(cycle.slice(0, 5), ['menu', 'tsybulia', 'chat', 'moto', 'galychyna']);
  assert.equal(cycle.at(-1), 'news');
});

check('фаза за номером тіку йде по колу і не падає на відʼємних', () => {
  assert.equal(slotPhaseAt(0, true), 'menu');
  assert.equal(slotPhaseAt(1, true), 'tsybulia');
  assert.equal(slotPhaseAt(1, false), 'tsybulia');
  assert.equal(slotPhaseAt(3, true), 'moto');
  assert.equal(slotPhaseAt(4, true), 'galychyna');
  assert.equal(slotPhaseAt(6, true), 'news');
  assert.equal(slotPhaseAt(13, true), 'news');
  // коло скоротилось (новини прибрали з конфіга), а індекс лишився великим
  assert.equal(slotPhaseAt(9, false), 'galychyna');
  assert.equal(slotPhaseAt(-1, true), 'news');
});

check('дзвіночок у колі не залежить від прочитаності', () => {
  // прочитаність міняє лише крапку; коло однакове в обох випадках
  assert.deepEqual(slotCycle(true), slotCycle(true));
  assert.ok(slotCycle(true).includes('news'));
});

console.log(`\n${n} перевірок пройдено`);
