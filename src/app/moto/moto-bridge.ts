// Контракт сайту з грою «Дріл Мото» (спека 2026-09-18-drill-moto-game-design,
// секція 1). Сайт → гра — лише query-параметри iframe; гра → сайт —
// postMessage з source 'dril-moto'. Без імпортів і без React: чисті функції.

export type MotoTheme = 'light' | 'dark';

export type MotoMessage =
  | { source: 'dril-moto'; type: 'ready'; version: string }
  | { source: 'dril-moto'; type: 'exit' }
  | {
      source: 'dril-moto';
      type: 'finished';
      finishId?: string;
      league: number;
      track: number;
      timeMs: number;
      best: boolean;
    };

/** Пак треків сайту (scripts/build-moto-tracks.mjs) і простір ключів localStorage гри. */
export const MOTO_TRACKS_URL = '/moto/tracks/dril.mrg';
export const MOTO_NS = 'dril-moto';

/** Тема сайту з data-theme (ставить інлайн-скрипт layout.tsx до першого кадру); на сервері — light. */
export const readSiteTheme = (): MotoTheme =>
  typeof document !== 'undefined' && document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';

export const buildMotoSrc = (theme: MotoTheme): string =>
  `/moto/index.html?tracks=${MOTO_TRACKS_URL}&ns=${MOTO_NS}&theme=${theme}`;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isInt = (value: unknown): value is number => typeof value === 'number' && Number.isInteger(value);
const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

/** event.data → повідомлення гри або null, якщо це щось інше (розширення, чужі скрипти). */
export const parseMotoMessage = (data: unknown): MotoMessage | null => {
  if (!isRecord(data) || data.source !== 'dril-moto') return null;
  if (data.type === 'ready') {
    return {
      source: 'dril-moto',
      type: 'ready',
      version: typeof data.version === 'string' ? data.version : '',
    };
  }
  if (data.type === 'exit') return { source: 'dril-moto', type: 'exit' };
  if (data.type !== 'finished') return null;
  const { league, track, timeMs, best } = data;
  if (!isInt(league) || !isInt(track) || !isFiniteNumber(timeMs) || typeof best !== 'boolean') return null;
  const finishId =
    typeof data.finishId === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.finishId)
      ? data.finishId
      : undefined;
  return {
    source: 'dril-moto',
    type: 'finished',
    league,
    track,
    timeMs,
    best,
    ...(finishId ? { finishId } : {}),
  };
};
