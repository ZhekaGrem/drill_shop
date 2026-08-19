// Механіка перемикача товарів — властивість КОЛЕКЦІЇ, а не всього сайту.
//
// Причина в природі самих колекцій (заміряно, дизайн-бриф 2026-08-19):
//   • «Ніжна Оксана» — товари названі кольором принта (Червона, Зелена,
//     Жовта…), і колір справді є суттю товару. Кольоровий свотч показує рівно
//     те, що написано в назві, — працює краще за будь-яку мініатюру.
//   • «Щільний Дріл» — 16 товарів на двох кольорах тканини, різниця в графіці.
//     Свотч показував би те, чим товари схожі, тому тут компас із картками.
//
// Значення — це ідентифікатори перемикача HeroVisual, щоб місця виклику
// лишались тривіальними: switcher={switcherForCollection(col.key)}.
//
// Коли (і якщо) знадобиться керувати цим без деплою — поле переїде в
// Collection у БД, а тут лишиться тільки читання з colection.switcherStyle:
// решта коду не зміниться, бо всі звертаються через switcherForCollection().
export type CollectionSwitcher = 'dots' | 'compass';

/** Колекція → механіка. Кого немає в мапі, той отримує DEFAULT_SWITCHER */
const BY_COLLECTION: Record<string, CollectionSwitcher> = {
  'nizhna-oksana': 'dots',
};

/** Дефолт для нових колекцій: показуємо сам товар, а не його колір */
export const DEFAULT_SWITCHER: CollectionSwitcher = 'compass';

export const switcherForCollection = (slug: string | undefined): CollectionSwitcher =>
  (slug && BY_COLLECTION[slug]) || DEFAULT_SWITCHER;
