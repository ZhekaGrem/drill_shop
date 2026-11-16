// src/shared/config/zlypni.ts
// Розділ «є. Злипні»: сто футболок «Футболярчики» і сто худі «Бобаночки», кожна у 3D.
// Живе як «є. ***»: своя сторінка /zlypni і своя словомарка в хедері, а в загальному
// каталозі й на головній його товарів нема (hidden-collections.ts).
//
// Колекції й товари створює scripts/zlypni (з розгорток дизайнерів), тут — лише те, що
// потрібно фронту, щоб знайти свої колекції у GET /collections.

/** Словомарка після «є.» у хедері */
export const ZLYPNI_WORDMARK = 'Злипні';

export const ZLYPNI_HREF = '/zlypni';

/** Колекції розділу в порядку показу */
export const ZLYPNI_COLLECTION_SLUGS: readonly string[] = ['zlypni-futboliarchyky', 'zlypni-bobanochky'];

/**
 * Чи відкритий розділ. Поки дизайни не завантажені, хедер не показує «є. Злипні», а сторінка
 * пише «скоро» — код можна деплоїти заздалегідь. Запуск — одна зміна: true.
 */
export const ZLYPNI_LIVE = true;
