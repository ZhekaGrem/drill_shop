// src/features/catalog/hooks/useCatalogProducts.ts
import { useQuery } from '@tanstack/react-query';
import { productsApi, ProductsResponse, ProductFilters, Pagination } from '../api/products';
import { queryDefaults } from '@/shared/config/react-query';

interface UseCatalogProductsOptions {
  filters: ProductFilters;
  pagination: Pagination;
  enabled?: boolean;
  initialData?: ProductsResponse | null;
}

export const useCatalogProducts = ({
  filters,
  pagination,
  enabled = true,
  initialData,
}: UseCatalogProductsOptions) => {
  return useQuery<ProductsResponse>({
    ...queryDefaults,
    queryKey: ['products', filters, pagination],
    queryFn: () => productsApi.getProducts(filters, pagination),
    placeholderData: initialData || undefined,
    enabled,
  });
};

// Prefetch наступної сторінки
export const usePrefetchNextPage = (currentPage: number, totalPages: number, filters: ProductFilters) => {
  const nextOffset = currentPage * 18; // FIX: Was 20, now is 18 to match the page limit

  return useQuery<ProductsResponse>({
    ...queryDefaults,
    queryKey: ['products', filters, { limit: 18, offset: nextOffset }],
    queryFn: () => productsApi.getProducts(filters, { limit: 18, offset: nextOffset }),
    enabled: currentPage < totalPages && nextOffset > 0,
  });
};
