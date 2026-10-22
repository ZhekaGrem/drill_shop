// src/shared/config/site-closed.ts
// «Сайт закрито» — один перемикач, як DEV_MODE.
//
//   SITE_CLOSED = true  → middleware замість будь-якої сторінки магазину віддає вікно Windows 98 «Сайт закрито»
//                         (shared/utils/site-closed-page.ts) зі статусом 503 і Retry-After: пошуковики бачать
//                         тимчасову перерву, а не новий вміст сторінок.
//   SITE_CLOSED = false → магазин працює як звичайно.
//
// Локально табличку не видно, щоб працювати над дизайном: у `next dev` завжди, а в локальній продакшн-збірці
// (`next build && next start`) — коли в .env.local стоїть SITE_OPEN_LOCALLY=1. На Vercel цієї змінної немає, тож
// продакшн закритий, поки тут true, і цей файл безпечно пушити.
//
// Відкритими лишаються адмінка й вхід — команда далі працює із замовленнями. API (/api/*) і статика й так поза
// middleware (його matcher), тож платіжні колбеки не зачіпаються.
// Перемикати тут, одним рядком:
const CLOSED = false;

export const SITE_CLOSED =
  CLOSED && process.env.NODE_ENV === 'production' && process.env.SITE_OPEN_LOCALLY !== '1';

/** Префікси шляхів, що працюють і під час закриття */
export const SITE_CLOSED_OPEN_PATHS = ['/admin', '/login', '/auth'];

export const isOpenWhileClosed = (pathname: string): boolean =>
  SITE_CLOSED_OPEN_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
