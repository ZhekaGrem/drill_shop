// src/features/catalog/hooks/useCatalogFilters.ts - FIXED WITH categoryIds ARRAY
import { create } from 'zustand';
import { ProductFilters, Pagination } from '@/features/catalog/api/products';

/** Мінімальний інтерфейс, який реально потрібен від router — так стор не тягне
 *  залежність на конкретний тип з `next/navigation`. */
interface UrlNavigator {
  push: (href: string) => void;
}

interface CatalogFiltersState {
  filters: ProductFilters & { categoryIds?: string[] }; // Додали categoryIds

  setFilter: (key: keyof ProductFilters, value: any) => void;
  toggleCategoryId: (categoryId: string) => void; // НОВИЙ метод
  setFilters: (filters: Partial<ProductFilters>) => void;
  clearFilters: () => void;

  getUrlParams: () => URLSearchParams;
  setFromUrlParams: (params: URLSearchParams) => void;
  getApiParams: () => Record<string, any>;
  /** basePath — префікс маршруту («/telegram» для Mini App), щоб пуш не виносив
   *  користувача з `/telegram/catalog` на звичайний `/catalog`. */
  updateUrl: (router: UrlNavigator, basePath?: string) => void;
}

const defaultFilters: ProductFilters = {};

export const useCatalogFilters = create<CatalogFiltersState>((set, get) => ({
  filters: { ...defaultFilters },

  setFilter: (key, value) => {
    set((state) => {
      const newFilters = { ...state.filters };
      if (value === undefined || value === null || value === '') {
        delete newFilters[key];
      } else {
        newFilters[key] = value;
      }
      return { filters: newFilters };
    });
  },

  // НОВИЙ метод для toggle категорій
  toggleCategoryId: (categoryId: string) => {
    set((state) => {
      const currentIds = state.filters.categoryIds || [];
      let newIds: string[];

      if (currentIds.includes(categoryId)) {
        // Видаляємо якщо вже є
        newIds = currentIds.filter((id) => id !== categoryId);
      } else {
        // Додаємо якщо немає
        newIds = [...currentIds, categoryId];
      }

      return {
        filters: {
          ...state.filters,
          categoryIds: newIds.length > 0 ? newIds : undefined,
          categorySlug: undefined, // Видаляємо старий параметр
        },
      };
    });
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));

    const { filters } = get();
    sessionStorage.setItem('catalog-filters', JSON.stringify(filters));
  },

  clearFilters: () => {
    set({
      filters: { ...defaultFilters },
    });

    sessionStorage.removeItem('catalog-filters');
  },

  // ОНОВЛЕНО: Відправляємо categoryIds
  getApiParams: () => {
    const { filters } = get();
    const apiParams: Record<string, any> = {};

    if (filters.search?.trim()) apiParams.search = filters.search.trim();

    // FIXED: Відправляємо categoryIds як масив
    if (filters.categoryIds && filters.categoryIds.length > 0) {
      apiParams.categoryIds = filters.categoryIds;
    }

    if (filters.sortBy) apiParams.sortBy = filters.sortBy;
    if (filters.sortOrder) apiParams.sortOrder = filters.sortOrder;
    if (filters.priceMin !== undefined) apiParams.priceMin = filters.priceMin;
    if (filters.priceMax !== undefined) apiParams.priceMax = filters.priceMax;
    if (filters.hasPromo !== undefined) apiParams.hasPromo = filters.hasPromo;

    return apiParams;
  },

  getUrlParams: () => {
    const { filters } = get();
    const params = new URLSearchParams();

    if (filters.search?.trim()) params.set('search', filters.search.trim());

    // FIXED: categoryIds в URL як масив
    if (filters.categoryIds && filters.categoryIds.length > 0) {
      filters.categoryIds.forEach((id) => params.append('categoryId', id));
    }

    if (filters.sortBy) params.set('sort', filters.sortBy);
    if (filters.sortOrder) params.set('order', filters.sortOrder);
    if (filters.priceMin !== undefined) params.set('priceMin', filters.priceMin.toString());
    if (filters.priceMax !== undefined) params.set('priceMax', filters.priceMax.toString());
    if (filters.hasPromo !== undefined) params.set('promo', filters.hasPromo.toString());

    return params;
  },

  setFromUrlParams: (params) => {
    // Злиття, а не заміна: URL — джерело правди для полів, якими він керує
    // (search, categoryIds, ціна, сортування, promo), тому присутній параметр
    // завжди перезаписує, а відсутній — знімає фільтр. Це принципово для
    // кнопки «назад»: попередній запис в історії має право прибрати фільтр,
    // якого там немає, інакше «назад» ніколи нічого не скидає.
    //
    // Але саму `filters` не замінюємо цілком (`set({ filters })`) — зливаємо
    // з поточним станом (`set(state => ...)`), щоб поля, яких у URL-словнику
    // взагалі немає (categorySlug, limit), не губились щоразу, коли хтось
    // (наприклад, пошук у хедері) пушить URL лише з одним параметром.
    const categoryIds = params.getAll('categoryId');

    // Сміттєве значення (?promo=xyz) не має ставати "вимкнено" (false) — це
    // теж активний фільтр за countActiveFilters і потрапляє назад в URL як
    // `promo=false`. Сміття читається як відсутність параметра.
    const promoParam = params.get('promo');
    const hasPromo = promoParam === 'true' ? true : promoParam === 'false' ? false : undefined;

    set((state) => ({
      filters: {
        ...state.filters,
        search: params.get('search') || undefined,
        categoryIds: categoryIds.length > 0 ? categoryIds : undefined,
        sortBy: (params.get('sort') as ProductFilters['sortBy']) || undefined,
        sortOrder: (params.get('order') as ProductFilters['sortOrder']) || undefined,
        priceMin: params.get('priceMin') ? Number(params.get('priceMin')) : undefined,
        priceMax: params.get('priceMax') ? Number(params.get('priceMax')) : undefined,
        hasPromo,
      },
    }));
  },

  updateUrl: (router, basePath = '') => {
    const params = get().getUrlParams();
    const path = `${basePath}/catalog`;
    const newUrl = params.toString() ? `${path}?${params.toString()}` : path;

    router.push(newUrl);
  },
}));

/**
 * Скільки фільтрів реально звужують видачу.
 * Сортування не рахуємо — воно не прибирає товари, лише міняє порядок.
 */
export function countActiveFilters(filters: ProductFilters & { categoryIds?: string[] }): number {
  let count = 0;

  if (filters.categoryIds?.length) count += filters.categoryIds.length;
  if (filters.priceMin !== undefined) count += 1;
  if (filters.priceMax !== undefined) count += 1;
  if (filters.hasPromo !== undefined) count += 1;
  if (filters.search?.trim()) count += 1;

  return count;
}

export function useCatalogAPI() {
  const { filters, getApiParams } = useCatalogFilters();

  return {
    filters,
    apiParams: getApiParams(),
    queryKey: ['products', getApiParams()],
  };
}
