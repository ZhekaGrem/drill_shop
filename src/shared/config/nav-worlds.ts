// src/shared/config/nav-worlds.ts
// Розділи, між якими гортається хедер. Кожен приносить свою словомарку
// («є. Дріл» → «є. Олько») і свої пункти навігації.
//
// Джерело словомарок не дублюється: воно й далі одне — HIDDEN_COLLECTION_WORDMARK.
// Тут до нього додано лише те, чого в ньому нема й не має бути: куди веде
// розділ і що стоїть у його навігації.
import { HIDDEN_COLLECTION_WORDMARK } from './hidden-collections';

export interface NavWorld {
  id: string;
  /** Словомарка після «є.» */
  wordmark: string;
  /** Куди веде перемикання на цей розділ */
  href: string;
  navItems: { label: string; href: string }[];
}

/** Основна вітрина. Порядок пунктів той самий, що був у хедері до свайпу. */
const DRIL_NAV = [
  { label: 'Каталог', href: '/catalog' },
  { label: 'Про нас', href: '/about' },
  { label: 'Контакти', href: '/contact' },
];

/** Навігація розділу серії «Мистецтво з війни»: у кожного автора своя сторінка */
const seriesNav = (href: string) => [
  // «Каталог», а не «Колекція», тут був би обманом: товари прихованого
  // розділу каталог не показує (див. hidden-collections і CatalogClient)
  { label: 'Колекція', href },
  { label: 'Про нас', href: '/about' },
  { label: 'Контакти', href: '/contact' },
];

export const NAV_WORLDS: NavWorld[] = [
  { id: 'dril', wordmark: 'Дріл', href: '/', navItems: DRIL_NAV },
  {
    id: 'mystetstvo-viyny',
    wordmark: HIDDEN_COLLECTION_WORDMARK['mystetstvo-viyny'],
    // Своєї головної в розділу немає — веде на сторінку єдиного товару.
    // Зʼявиться власна сторінка розділу — міняється тільки цей рядок.
    href: '/v2/a/olko',
    navItems: seriesNav('/v2/a/olko'),
  },
  {
    id: 'mystetstvo-viyny-serik',
    wordmark: HIDDEN_COLLECTION_WORDMARK['mystetstvo-viyny-serik'],
    href: '/v2/a/privitonchyk',
    navItems: seriesNav('/v2/a/privitonchyk'),
  },
];

/** Індекс розділу за словомаркою, яку віддала мапа прихованих розділів */
export const worldIndexByWordmark = (wordmark?: string): number => {
  if (!wordmark) return 0;
  const i = NAV_WORLDS.findIndex((w) => w.wordmark === wordmark);
  return i === -1 ? 0 : i;
};
