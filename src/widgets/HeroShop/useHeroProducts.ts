// src/widgets/HeroShop/useHeroProducts.ts
// Товари героя-магазину: всі одразу однією пачкою запитів — перемикання
// дизайнів далі миттєве, без спінера на кожен клік. TanStack кешує по slug.
'use client';

import { useQueries } from '@tanstack/react-query';
import { productsApi } from '@/features/catalog/api/products';
import type { Product } from '@/shared/types';
import { HERO3_SLUGS } from './config';
import type { Hero3Key } from './config';

const ENTRIES = Object.entries(HERO3_SLUGS) as [Hero3Key, string][];

export const useHeroProducts = () => {
  const results = useQueries({
    queries: ENTRIES.map(([, slug]) => ({
      queryKey: ['hero3-product', slug],
      queryFn: () => productsApi.getProductBySlug(slug).then((r) => r.data),
      staleTime: 5 * 60_000,
      retry: 1,
    })),
  });

  const byKey: Partial<Record<Hero3Key, Product>> = {};
  ENTRIES.forEach(([key], i) => {
    const data = results[i].data as Product | undefined;
    if (data) byKey[key] = data;
  });
  return byKey;
};
