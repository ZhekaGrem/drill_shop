// src/shared/utils/telegram-handle.ts
// Telegram-нікнейм клієнта у формі замовлення. Дзеркало бекендового
// src/shared/utils/telegram-handle.ts (drill-shop-backend): правила й тексти
// помилок однакові, щоб форма і сервер говорили тими самими словами.

export const TELEGRAM_HANDLE_ERRORS = {
  REQUIRED: 'Вкажіть ваш нікнейм у Telegram',
  CHARS: 'Нікнейм може містити лише латинські літери, цифри та «_»',
  FIRST_CHAR: 'Нікнейм має починатися з латинської літери',
  LENGTH: 'Нікнейм — від 4 до 32 символів після «@»',
} as const;

// Посилання на профіль (t.me/name, telegram.me/name) зводимо до нікнейма —
// люди часто вставляють саме його.
const PROFILE_LINK = /^(?:https?:\/\/)?(?:www\.)?(?:t|telegram)\.me\/(?=.)/i;

/**
 * Будь-який ввід → «@нікнейм»: рівно один «@» і завжди першим; порожнє → ''.
 * «@» прибираємо ДО посилання: у полі вже стоїть «@», тож вставлене
 * посилання приходить як «@https://t.me/name».
 */
export const normalizeTelegramHandle = (raw: string): string => {
  const compact = raw.replace(/\s+/g, '');
  if (compact === '') return '';
  return `@${compact.replace(/@/g, '').replace(PROFILE_LINK, '')}`;
};

/**
 * Помилка для вже нормалізованого значення або null. Звичайні нікнейми мають
 * 5–32 символи, колекційні з Fragment — від 4, тож нижня межа 4: краще
 * пропустити рідкісний короткий, ніж не дати людині оформити замовлення.
 */
export const getTelegramHandleError = (value: string): string | null => {
  const handle = value.replace(/^@/, '');
  if (handle === '') return TELEGRAM_HANDLE_ERRORS.REQUIRED;
  if (!/^[A-Za-z0-9_]+$/.test(handle)) return TELEGRAM_HANDLE_ERRORS.CHARS;
  if (!/^[A-Za-z]/.test(handle)) return TELEGRAM_HANDLE_ERRORS.FIRST_CHAR;
  if (handle.length < 4 || handle.length > 32) return TELEGRAM_HANDLE_ERRORS.LENGTH;
  return null;
};
