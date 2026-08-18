// Приховані розділи: колекції, які існують у БД і доступні прямим лінком,
// але не світяться у публічних списках (герої головної, «Інші колекції»,
// картки каталогу). Бекендовий heroEnabled=false тут не годиться — він
// прибирає колекцію з GET /collections цілком, і сторінка товару втрачає
// назву колекції, свотчі та перемикач.
//
// Бонус прихованого розділу: на його сторінках словомарка логотипа в хедері
// змінюється (є. Дріл → є. Олько) — розділ живе під власним «брендом».
export const HIDDEN_COLLECTION_SLUGS: readonly string[] = ['mystetstvo-viyny'];

// Словомарка хедера для прихованого розділу (дефолтна — «Дріл»)
export const HIDDEN_COLLECTION_WORDMARK: Record<string, string> = {
  'mystetstvo-viyny': 'Олько',
};

export const isHiddenCollection = (slug: string | null | undefined): boolean =>
  !!slug && HIDDEN_COLLECTION_SLUGS.includes(slug);
