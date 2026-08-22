// src/shared/config/home-collections.ts
// Порядок героїв на головній. Бекенд віддає колекції у своєму порядку
// (nizhna-oksana → shchilnyi-dril → honorove-varyatstvo), а власник хоче
// інший — тож черга задається тут, слагами.
//
// Прихованих розділів у списку НЕМАЄ і бути не має. «Олько Вуйна»
// коротко стояло тут першим героєм (2026-08-21), але власник прибрав його з
// головної: єдиний вхід у розділ — свайп навбару на «є. Олько»
// (config/nav-worlds.ts). Фільтр головної лишився простим: приховане на неї
// не потрапляє взагалі.

/** Черга колекцій на головній. Рішення власника, 2026-08-22. */
export const HOME_COLLECTION_ORDER: readonly string[] = [
  'nizhna-oksana', // Ніжна Оксана
  'honorove-varyatstvo', // Гонорове вар'ятство
  'shchilnyi-dril', // Щільний Дріл — остання
];

/**
 * Сортує колекції за списком вище. Ті, яких у списку немає, ідуть у кінець
 * у порядку бекенда — нову колекцію додадуть в адмінці без деплою, і вона
 * має зʼявитись на головній, хай і останньою, а не зникнути.
 * Array.prototype.sort стабільний, тож їхній взаємний порядок збережеться.
 */
export const orderForHome = <T extends { key: string }>(collections: T[]): T[] => {
  const rank = (c: T) => {
    const i = HOME_COLLECTION_ORDER.indexOf(c.key);
    return i === -1 ? HOME_COLLECTION_ORDER.length : i;
  };
  return [...collections].sort((a, b) => rank(a) - rank(b));
};
