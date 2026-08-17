// src/features/catalog/hooks/useCategoryProducts.ts
import { useInfiniteQuery, InfiniteData } from '@tanstack/react-query';
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
    // SSG (`page.tsx`) тягне ці самі 18 товарів тим самим `categorySlug` —
    // на відміну від каталогу тут немає інших вимірів фільтрації, тож
    // підставляти initialData можна безумовно.
    //
    // Функція з явним `| undefined`, а не пряме значення — так само, як у
    // useCatalogProducts: без цього TS вибирає перевантаження з гарантованим
    // `data`, яке прибирає 'pending' зі status. Тут жоден код цим ще не
    // користується (споживач читає лише isLoading), але лишати тут "пастку"
    // для того, хто наступним захоче статус-чесний рендер на цій сторінці, —
    // не варто.
    initialData: (): InfiniteData<ProductsResponse> | undefined =>
      initialData ? { pages: [initialData], pageParams: [0] } : undefined,
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
