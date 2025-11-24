// src/features/catalog/hooks/useCatalogFilters.ts - FIXED WITH categoryIds ARRAY
import { create } from 'zustand';
import { ProductFilters, Pagination } from '@/features/catalog/api/products';

interface CatalogFiltersState {
  filters: ProductFilters & { categoryIds?: string[] }; // Додали categoryIds
  pagination: Pagination;

  setFilter: (key: keyof ProductFilters, value: any) => void;
  toggleCategoryId: (categoryId: string) => void; // НОВИЙ метод
  setFilters: (filters: Partial<ProductFilters>) => void;
  clearFilters: () => void;
  setPagination: (pagination: Partial<Pagination>) => void;
  resetPagination: () => void;

  getUrlParams: () => URLSearchParams;
  setFromUrlParams: (params: URLSearchParams) => void;
  getApiParams: () => Record<string, any>;
  updateUrl: (router: any) => void;
}

const defaultFilters: ProductFilters = {};
const defaultPagination: Pagination = {};

export const useCatalogFilters = create<CatalogFiltersState>((set, get) => ({
  filters: { ...defaultFilters },
  pagination: { ...defaultPagination },

  setFilter: (key, value) => {
    set((state) => {
      const newFilters = { ...state.filters };
      if (value === undefined || value === null || value === '') {
        delete newFilters[key];
      } else {
        newFilters[key] = value;
      }
      return {
        filters: newFilters,
        pagination: { ...state.pagination, offset: 0 },
      };
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
        pagination: { ...state.pagination, offset: 0 },
      };
    });
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      pagination: { ...state.pagination, offset: 0 },
    }));

    const { filters } = get();
    sessionStorage.setItem('catalog-filters', JSON.stringify(filters));
  },

  clearFilters: () => {
    set({
      filters: { ...defaultFilters },
      pagination: { ...defaultPagination },
    });

    sessionStorage.removeItem('catalog-filters');
  },

  setPagination: (newPagination) => {
    set((state) => ({
      pagination: { ...state.pagination, ...newPagination },
    }));
  },

  resetPagination: () => {
    set((state) => ({
      pagination: { ...state.pagination, offset: undefined },
    }));
  },

  // ОНОВЛЕНО: Відправляємо categoryIds
  getApiParams: () => {
    const { filters, pagination } = get();
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

    if (pagination.limit) apiParams.limit = pagination.limit;
    if (pagination.offset) apiParams.offset = pagination.offset;

    return apiParams;
  },

  getUrlParams: () => {
    const { filters, pagination } = get();
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

    if (pagination.offset) {
      const limit = pagination.limit || 20;
      const page = Math.floor(pagination.offset / limit) + 1;
      params.set('page', page.toString());
    }

    return params;
  },

  setFromUrlParams: (params) => {
    const filters: ProductFilters & { categoryIds?: string[] } = {};
    const pagination: Pagination = {};

    if (params.get('search')) filters.search = params.get('search')!;

    // FIXED: Читаємо categoryIds з URL
    const categoryIds = params.getAll('categoryId');
    if (categoryIds.length > 0) {
      filters.categoryIds = categoryIds;
    }

    if (params.get('sort')) filters.sortBy = params.get('sort') as any;
    if (params.get('order')) filters.sortOrder = params.get('order') as any;
    if (params.get('priceMin')) filters.priceMin = Number(params.get('priceMin'));
    if (params.get('priceMax')) filters.priceMax = Number(params.get('priceMax'));
    if (params.get('promo')) filters.hasPromo = params.get('promo') === 'true';

    if (params.get('page')) {
      const page = Math.max(1, Number(params.get('page'))) - 1;
      pagination.limit = 18;
      pagination.offset = page * 18;
    }

    set({ filters, pagination });
  },

  updateUrl: (router) => {
    const params = get().getUrlParams();
    const newUrl = params.toString() ? `/catalog?${params.toString()}` : '/catalog';

    router.push(newUrl, { shallow: true });
  },
}));

export function useCatalogAPI() {
  const { filters, pagination, getApiParams } = useCatalogFilters();

  return {
    filters,
    pagination,
    apiParams: getApiParams(),
    queryKey: ['products', getApiParams()],
  };
}
