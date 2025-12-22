// src/features/catalog/hooks/useCategoryProducts.ts
import { useInfiniteQuery } from '@tanstack/react-query';
import { productsApi, ProductsResponse } from '@/features/catalog/api/products';

interface UseCategoryProductsOptions {
  categorySlug: string;
  initialData?: ProductsResponse | null;
}

const ITEMS_PER_PAGE = 18;

export function useCategoryProducts({ categorySlug, initialData }: UseCategoryProductsOptions) {
  return useInfiniteQuery<ProductsResponse>({
    queryKey: ['category-products', categorySlug],
    queryFn: async ({ pageParam = 0 }) => {
      return productsApi.getProductsByCategory(categorySlug, {
        limit: ITEMS_PER_PAGE,
        offset: pageParam as number,
      });
    },
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
    staleTime: 5 * 60 * 1000, // 5 хвилин
  });
}
