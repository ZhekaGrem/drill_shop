// src/features/catalog/api/visible-products.ts
// Сторінка каталогу з ВИДИМИХ товарів. Лістовий /products нічого не знає про
// колекції, тож приховані розділи відсіюємо тут — але до пагінації, а не після.
// Відсів після неї вже ламав каталог: перші 18 найновіших товарів цілком
// належали прихованому розділу, сторінка лишалась порожньою, а наступну ніхто
// не просив, бо «довантажити ще» живе під списком, якого не було.
import type { Pagination, ProductsResponse } from './products';

export const CATALOG_PAGE_SIZE = 18;

/** Більше бекенд за раз не віддає: limit=300 він мовчки ріже до 100 */
const SCAN_CHUNK = 100;

type FetchChunk = (pagination: Required<Pagination>) => Promise<ProductsResponse>;

/**
 * Збирає CATALOG_PAGE_SIZE видимих товарів, починаючи з серверного `offset`.
 * Перший запит — звичайного розміру (прихованих зазвичай мало), а якщо сторінка
 * не набралась, приховані проскакуємо великими шматками.
 *
 * У meta відповіді `offset` — звідки почали, `limit` — скільки серверних рядків
 * спожито, тож наступна сторінка починається з `offset + limit`.
 */
export async function getVisibleProductsPage(
  fetchChunk: FetchChunk,
  offset: number,
  hiddenSlugs: ReadonlySet<string>
): Promise<ProductsResponse> {
  const visible: ProductsResponse['data'] = [];
  let cursor = offset;
  let chunk = await fetchChunk({ limit: CATALOG_PAGE_SIZE, offset });
  let exhausted = false;

  while (true) {
    for (const product of chunk.data) {
      if (visible.length === CATALOG_PAGE_SIZE) break;
      cursor += 1;
      if (!hiddenSlugs.has(product.slug)) visible.push(product);
    }

    exhausted = chunk.data.length === 0 || cursor >= chunk.meta.total;
    if (exhausted || visible.length === CATALOG_PAGE_SIZE) break;
    chunk = await fetchChunk({ limit: SCAN_CHUNK, offset: cursor });
  }

  return {
    ...chunk,
    data: visible,
    meta: { ...chunk.meta, offset, limit: cursor - offset, hasMore: !exhausted },
  };
}
