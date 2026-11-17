// src/shared/config/zlypni.ts
// «Злипні»: сто футболок «Футболярчики» і сто худі «Бобаночки», кожна у 3D.
//
// З 2026-11-17 (рішення власника) це не розділ магазину, а прихована вітрина без продажу:
// у хедері й навігації її нема, товари з БД прибрані, а дизайни показує галерея
// (widgets/ZlypniGallery) з даних у репозиторії — zlypni-gallery.json, текстури й постери в public/.
//
// Галерея відкривається за довгим посиланням /zlypni/<ключ>, яке власник надсилає вибраним
// клієнтам. Репозиторій публічний, тож самого ключа тут нема — лише його SHA-256. Новий ключ:
// згенерувати рядок, покласти сюди його хеш, старе посилання перестане працювати.
import gallery from './zlypni-gallery.json';

export const ZLYPNI_TITLE = 'Злипні';

/** sha256(ключ) — сторінка /zlypni/<ключ> відкривається лише з ним */
export const ZLYPNI_PREVIEW_KEY_SHA256 = '22bb2d8eb684cfc5983225ac1255c4c4a65a5732b6769a4d65ef42106ef678b4';

/**
 * Колекції, які жили в БД до 2026-11-17. Лишаються в hidden-collections, як і Поламав:
 * навіть застарілі дані каталогу не мають показати їх у магазині.
 */
export const ZLYPNI_COLLECTION_SLUGS: readonly string[] = gallery.collections.map((c) => c.key);

export interface ZlypniDesign {
  key: string;
  name: string;
  /** Розгортка для 3D-сцени */
  texture: string;
  /** Знімок 3D-моделі для мініатюр і сітки */
  poster: string;
}

export interface ZlypniCollection {
  key: string;
  title: string;
  /** Своя 3D-модель (худі); без неї — дефолтна футболка сцени */
  modelUrl?: string;
  designs: ZlypniDesign[];
}

export const ZLYPNI_COLLECTIONS: ZlypniCollection[] = gallery.collections;
