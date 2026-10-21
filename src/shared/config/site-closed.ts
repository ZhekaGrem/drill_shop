// src/shared/config/site-closed.ts
// «Сайт закрито» — один перемикач, як DEV_MODE.
//
//   SITE_CLOSED = true  → middleware замість будь-якої сторінки магазину віддає вікно Windows 98 «Сайт закрито»
//                         (shared/utils/site-closed-page.ts) зі статусом 503 і Retry-After: пошуковики бачать
//                         тимчасову перерву, а не новий вміст сторінок.
//   SITE_CLOSED = false → магазин працює як звичайно.
//
// Відкритими лишаються адмінка й вхід — команда далі працює із замовленнями. API (/api/*) і статика й так поза
// middleware (його matcher), тож платіжні колбеки не зачіпаються.
// Перемикати тут, одним рядком:
export const SITE_CLOSED = true;

/** Префікси шляхів, що працюють і під час закриття */
export const SITE_CLOSED_OPEN_PATHS = ['/admin', '/login', '/auth'];

export const isOpenWhileClosed = (pathname: string): boolean =>
  SITE_CLOSED_OPEN_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
