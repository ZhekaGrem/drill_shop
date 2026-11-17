// src/features/catalog/hooks/useCatalogProducts.ts
import { useInfiniteQuery, InfiniteData } from '@tanstack/react-query';
import { productsApi, ProductsResponse, ProductFilters } from '../api/products';
import { RAW_COLLECTIONS_QUERY_KEY, fetchRawCollections, toHiddenSlugs } from '@/shared/api/collections';
import { queryDefaults } from '@/shared/config/react-query';

interface UseCatalogProductsOptions {
  filters: ProductFilters;
  enabled?: boolean;
  initialData?: ProductsResponse | null;
}

/** SSG (`src/app/catalog/page.tsx`) завжди тягне товари без фільтрів і з
 *  дефолтним сортуванням — `initialData` можна підставляти лише під точно
 *  такий самий запит. Інакше при прямому переході на `/catalog?categoryId=…`
 *  ми на мить покажемо нефільтрований SSG-список як нібито відфільтрований,
 *  а TanStack Query ще й прийме його за свіжий (staleTime 30 хв) і не
 *  перезапитає. */
const matchesServerDefault = (filters: ProductFilters) =>
  !filters.categoryIds?.length &&
  filters.priceMin === undefined &&
  filters.priceMax === undefined &&
  !filters.hasPromo &&
  !filters.search?.trim() &&
  (filters.sortBy === undefined || filters.sortBy === 'created') &&
  (filters.sortOrder === undefined || filters.sortOrder === 'desc');

export const useCatalogProducts = ({ filters, enabled = true, initialData }: UseCatalogProductsOptions) => {
  return useInfiniteQuery<ProductsResponse>({
    ...queryDefaults,
    queryKey: ['products', filters],
    // Приховані розділи відсіюємо тут, а не в рендері: сторінка, що цілком
    // складалася з прихованих товарів, лишала каталог порожнім. Склад колекцій
    // беремо зі спільного кешу — той самий запит уже роблять картки (useTurntables).
    queryFn: async ({ pageParam = 0, client }) => {
      const collections = await client.ensureQueryData({
        queryKey: RAW_COLLECTIONS_QUERY_KEY,
        queryFn: fetchRawCollections,
      });
      return productsApi.getVisibleProducts(filters, pageParam as number, toHiddenSlugs(collections));
    },
    // Функція з явним `| undefined` у поверненні: без цього TS вибирає
    // перевантаження з гарантованим `data` (без 'pending' у status), хоча
    // тут initialData справді умовний.
    initialData: (): InfiniteData<ProductsResponse> | undefined =>
      initialData && matchesServerDefault(filters) ? { pages: [initialData], pageParams: [0] } : undefined,
    // meta.limit тут — скільки серверних рядків спожила сторінка разом із
    // прихованими (див. getVisibleProductsPage), тож наступна починається одразу за ними
    getNextPageParam: ({ meta }) => (meta.hasMore ? meta.offset + meta.limit : undefined),
    initialPageParam: 0,
    enabled,
  });
};
