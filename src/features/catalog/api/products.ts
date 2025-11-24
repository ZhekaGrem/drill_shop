// src/features/catalog/api/products.ts
import { apiClient } from '@/shared/api/client';
import { productEndpoints, categoryEndpoints } from '@/shared/api/endpoints';
import { Product, Category, ProductWithRelations } from '@/shared/types';

// API response types
export interface ProductsResponse {
  success: boolean;
  data: Product[];
  meta: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  message: string;
}

export interface SearchProductsResponse {
  success: boolean;
  data: Product[];
  meta: {
    total: number;
    query: string;
  };
  message: string;
}

export interface ProductResponse {
  success: boolean;
  data: ProductWithRelations & {
    relatedProducts?: Product[];
    breadcrumbs?: { name: string; slug: string; url: string }[];
  };
  message: string;
}

export interface CategoriesResponse {
  success: boolean;
  data: Category[];
  message: string;
}

export interface ProductFilters {
  categorySlug?: string;
  categoryIds?: string[];
  search?: string;
  priceMin?: number;
  priceMax?: number;
  sortBy?: 'name' | 'price' | 'created' | 'popularity';
  sortOrder?: 'asc' | 'desc';
  hasPromo?: boolean;
  limit?: number;
}

export interface Pagination {
  limit?: number;
  offset?: number;
}

export const productsApi = {
  async getProducts(filters: ProductFilters = {}, pagination: Pagination = {}) {
    const response = await apiClient.get<ProductsResponse>(productEndpoints.products, {
      params: { ...filters, ...pagination },
      paramsSerializer: {
        indexes: null, // Це дозволяє правильно серіалізувати масиви (categoryIds[]=1&categoryIds[]=2)
      },
    });
    return response.data;
  },

  async getProductBySlug(slug: string) {
    const response = await apiClient.get<ProductResponse>(productEndpoints.productBySlug(slug));
    return response.data;
  },

  /**
   * Пошук товарів через /products/search endpoint
   * @param query - пошуковий запит (мінімум 2 символи)
   * @returns SearchProductsResponse з товарами для dropdown
   */
  async searchProducts(query: string): Promise<SearchProductsResponse> {
    const response = await apiClient.get<SearchProductsResponse>(productEndpoints.search, {
      params: { q: query.trim() },
    });
    return response.data;
  },

  async getProductsByCategory(categorySlug: string, pagination: Pagination = {}) {
    return this.getProducts({ categorySlug }, pagination);
  },
};

export const categoriesApi = {
  async getCategories() {
    const response = await apiClient.get<CategoriesResponse>(categoryEndpoints.categories);
    return response.data;
  },

  async getNavigation() {
    const response = await apiClient.get<CategoriesResponse>(categoryEndpoints.navigation);
    return response.data;
  },

  async getCategoryBySlug(slug: string) {
    const response = await apiClient.get<{ success: boolean; data: Category; message: string }>(
      categoryEndpoints.categoryBySlug(slug)
    );
    return response.data;
  },
};
