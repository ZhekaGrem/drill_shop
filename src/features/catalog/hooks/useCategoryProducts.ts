// src/features/catalog/hooks/useCategoryProducts.ts
import { useQuery } from '@tanstack/react-query';
import { productsApi, ProductsResponse } from '@/features/catalog/api/products';

interface UseCategoryProductsOptions {
  categorySlug: string;
  page: number;
  limit: number;
  initialData?: ProductsResponse | null;
}

export function useCategoryProducts({ categorySlug, page, limit, initialData }: UseCategoryProductsOptions) {
  const offset = (page - 1) * limit;

  return useQuery({
    queryKey: ['category-products', categorySlug, page, limit],
    queryFn: async () => {
      return productsApi.getProductsByCategory(categorySlug, { limit, offset });
    },
    staleTime: 5 * 60 * 1000, // 5 хвилин
    placeholderData: initialData || undefined,
  });
}
