// src/features/catalog/hooks/useCatalogProducts.ts
import { useInfiniteQuery, InfiniteData } from '@tanstack/react-query';
import { productsApi, ProductsResponse, ProductFilters } from '../api/products';
import { queryDefaults } from '@/shared/config/react-query';

interface UseCatalogProductsOptions {
  filters: ProductFilters;
  enabled?: boolean;
  initialData?: ProductsResponse | null;
}

const ITEMS_PER_PAGE = 18;

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
    queryFn: ({ pageParam = 0 }) =>
      productsApi.getProducts(filters, { limit: ITEMS_PER_PAGE, offset: pageParam as number }),
    // Функція з явним `| undefined` у поверненні: без цього TS вибирає
    // перевантаження з гарантованим `data` (без 'pending' у status), хоча
    // тут initialData справді умовний.
    initialData: (): InfiniteData<ProductsResponse> | undefined =>
      initialData && matchesServerDefault(filters) ? { pages: [initialData], pageParams: [0] } : undefined,
    getNextPageParam: (lastPage) => {
      const currentOffset = lastPage.meta.offset;
      const currentLimit = lastPage.meta.limit;
      const total = lastPage.meta.total;

      // Якщо є ще сторінки - повертаємо наступний offset
      if (currentOffset + currentLimit < total) {
        return currentOffset + currentLimit;
      }

      // Немає більше сторінок
      return undefined;
    },
    initialPageParam: 0,
    enabled,
  });
};
