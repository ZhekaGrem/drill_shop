// src/features/catalog/hooks/useCatalogProducts.ts
import { useInfiniteQuery } from '@tanstack/react-query';
import { productsApi, ProductsResponse, ProductFilters } from '../api/products';
import { queryDefaults } from '@/shared/config/react-query';

interface UseCatalogProductsOptions {
  filters: ProductFilters;
  enabled?: boolean;
  initialData?: ProductsResponse | null;
}

const ITEMS_PER_PAGE = 18;

export const useCatalogProducts = ({ filters, enabled = true, initialData }: UseCatalogProductsOptions) => {
  return useInfiniteQuery<ProductsResponse>({
    ...queryDefaults,
    queryKey: ['products', filters],
    queryFn: ({ pageParam = 0 }) =>
      productsApi.getProducts(filters, { limit: ITEMS_PER_PAGE, offset: pageParam as number }),
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
