// src/widgets/ProductV2/useProduct.ts
// Товар за slug для v2-сторінок (демо репрезентацій). TanStack кешує по slug —
// перемикання товарів колекції в межах сторінки не рефетчить повторно.
'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { productsApi } from '@/features/catalog/api/products';

export const useProduct = (slug: string) =>
  useQuery({
    queryKey: ['v2-product', slug],
    // Порожня відповідь — теж помилка: інакше TanStack кине «data cannot be
    // undefined», а сторінка мовчки зависне в стані завантаження
    queryFn: async () => {
      const response = await productsApi.getProductBySlug(slug);
      if (!response?.data) throw new Error(`Товар «${slug}» не знайдено`);
      return response.data;
    },
    staleTime: 5 * 60_000,
    enabled: Boolean(slug),
    // Перемикання мініатюр: тримаємо попередній товар, поки їде новий —
    // панель покупки міняє дані без блимання скелетоном
    placeholderData: keepPreviousData,
  });
