// src/features/catalog/hooks/useProductSearch.ts
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productsApi, SearchProductsResponse } from '../api/products';

interface UseProductSearchOptions {
  /** Затримка перед запитом в мс */
  debounceMs?: number;
  /** Мінімальна довжина запиту для пошуку */
  minLength?: number;
  /** Чи увімкнено пошук */
  enabled?: boolean;
}

/**
 * Hook для пошуку товарів з debounce
 * Використовується для autocomplete dropdown в хедері
 */
export const useProductSearch = (
  query: string,
  { debounceMs = 400, minLength = 2, enabled = true }: UseProductSearchOptions = {}
) => {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // Debounce логіка
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // Перевіряємо чи потрібно робити запит
  const shouldSearch = enabled && debouncedQuery.trim().length >= minLength;

  return useQuery<SearchProductsResponse>({
    queryKey: ['product-search', debouncedQuery],
    queryFn: () => productsApi.searchProducts(debouncedQuery),
    enabled: shouldSearch,
    staleTime: 5 * 60 * 1000, // 5 хвилин
    gcTime: 10 * 60 * 1000, // 10 хвилин
    retry: false, // Не повторювати при помилці пошуку
  });
};
