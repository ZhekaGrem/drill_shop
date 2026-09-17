// src/features/wishes/lib/wish-message.ts
// Чиста логіка роуту /api/telegram/wishes: перевірка тіла запиту і текст
// повідомлення в адмін-чат. Без імпортів — це дає прогнати її звичайним
// `node scripts/check-wish-message.mjs` (тестового раннера в проєкті нема).
// Honeypot тут не перевіряється: це справа роуту, бо на нього відповідь
// «успіх», а не помилка.

export const WISH_MESSAGE_MIN = 3;
export const WISH_MESSAGE_MAX = 1000;
export const WISH_CONTACT_MAX = 100;
export const WISH_PAGE_MAX = 200;

export interface WishInput {
  message: string;
  contact?: string;
  page?: string;
}

export type WishValidation = { ok: true; wish: WishInput } | { ok: false; error: string };

const asString = (value: unknown): string => (typeof value === 'string' ? value : '');

/** Тіло запиту (будь-що з request.json()) → перевірене побажання або помилка 400. */
export const validateWish = (body: unknown): WishValidation => {
  const raw = (body ?? {}) as Record<string, unknown>;
  const message = asString(raw.message).trim();
  if (message.length < WISH_MESSAGE_MIN || message.length > WISH_MESSAGE_MAX) {
    return { ok: false, error: 'Напиши хоч кілька слів' };
  }
  const contact = asString(raw.contact).trim().slice(0, WISH_CONTACT_MAX);
  const page = asString(raw.page);
  const pageOk = page.startsWith('/') && page.length <= WISH_PAGE_MAX;
  return { ok: true, wish: { message, contact: contact || undefined, page: pageOk ? page : undefined } };
};

/** Плоский текст для sendMessage без parse_mode: зірочки й підкреслення
 *  користувача лишаються символами, а не розміткою. */
export const formatWishMessage = (wish: WishInput, siteUrl: string, now: Date): string => {
  const lines = [
    '#побажання',
    'Побажання з сайту',
    '',
    wish.message,
    '',
    `Контакт: ${wish.contact ?? 'не залишено'}`,
  ];
  if (wish.page) lines.push(`Сторінка: ${siteUrl}${wish.page}`);
  lines.push(`Час: ${now.toLocaleString('uk-UA', { timeZone: 'Europe/Kyiv' })}`);
  return lines.join('\n');
};
