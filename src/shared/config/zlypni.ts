// src/shared/config/zlypni.ts
// «Злипні» — два життя одного розділу.
//
// 1. Розділ «є. Злипні» (/zlypni), продаж з 2026-11-21: «Футболляндручки» і «Боби» з фінальних
//    комплектів дизайнерів. Живе як «є. ***»: своя сторінка і словомарка в хедері, а в каталозі
//    й на головній його товарів нема (hidden-collections.ts). Дані розділу — zlypni-merch.json,
//    колекції й товари в БД засіває scripts/zlypni/create-collection.cjs.
//
// 2. Прихована галерея /zlypni/<ключ> (widgets/ZlypniGallery): двісті дизайнів 2026-11-16, зняті
//    з продажу 2026-11-17 і показані лише з посилання, яке власник надсилає вибраним клієнтам.
//    Дані — zlypni-gallery.json, текстури й постери в public/. Репозиторій публічний, тож самого
//    ключа тут нема — лише його SHA-256. Новий ключ: згенерувати рядок, покласти сюди його хеш,
//    старе посилання перестане працювати.
import gallery from './zlypni-gallery.json';
import merch from './zlypni-merch.json';

/** Словомарка після «є.» у хедері й заголовок обох сторінок */
export const ZLYPNI_TITLE = 'Злипні';

export const ZLYPNI_HREF = '/zlypni';

/** Колекції розділу в порядку показу */
export const ZLYPNI_SECTION_SLUGS: readonly string[] = merch.collections.map((c) => c.slug);

/**
 * Колекції, які продавались 2026-11-16…17. Лишаються в hidden-collections, як і Поламав:
 * навіть застарілі дані каталогу не мають показати їх у магазині.
 */
export const ZLYPNI_RETIRED_SLUGS: readonly string[] = gallery.collections.map((c) => c.key);

/** sha256(ключ) — сторінка /zlypni/<ключ> відкривається лише з ним */
export const ZLYPNI_PREVIEW_KEY_SHA256 = '22bb2d8eb684cfc5983225ac1255c4c4a65a5732b6769a4d65ef42106ef678b4';

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
