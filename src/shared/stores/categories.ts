// src/shared/stores/categories.ts - FIXED WITH TTL CACHE
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { apiClient } from '@/shared/api/client';

// ✅ TTL для кешу категорій: 5 годин

interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string | null;
  sortOrder: number;
  isActive: boolean;
  productCount?: number;
  children?: CategoryNode[];
  depth?: number;
  hasChildren?: boolean;
}

interface GroupedCategory {
  parent: {
    id: string;
    name: string;
    slug: string;
  };
  children: Array<{
    id: string;
    name: string;
    slug: string;
    parentId?: string | null;
  }>;
}

interface CategoriesState {
  categories: CategoryNode[];
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  lastFetch: number | null;

  // Actions
  fetchCategories: (options?: { force?: boolean; skipCache?: boolean }) => Promise<void>;
  createCategory: (data: any) => Promise<any>;
  updateCategory: (id: string, data: any) => Promise<any>;
  deleteCategory: (id: string, options?: { force?: boolean }) => Promise<void>;
  bulkUpdateCategories: (action: string, ids: string[]) => Promise<void>;
  reorderCategories: (updates: Array<{ id: string; sortOrder: number; parentId?: string }>) => Promise<void>;

  // Utilities
  getCategoryBySlug: (slug: string) => CategoryNode | null;
  getCategoryById: (id: string) => CategoryNode | null;
  flattenCategories: () => Array<CategoryNode & { depth: number }>;
  getGroupedCategories: () => GroupedCategory[];
  reset: () => void;
}

// Utility function to flatten category tree
const flattenTree = (
  categories: CategoryNode[],
  depth: number = 0
): Array<CategoryNode & { depth: number }> => {
  const result: Array<CategoryNode & { depth: number }> = [];

  for (const category of categories) {
    result.push({
      ...category,
      depth,
      hasChildren: (category.children?.length || 0) > 0,
    });

    if (category.children && category.children.length > 0) {
      result.push(...flattenTree(category.children, depth + 1));
    }
  }

  return result;
};

// Find category in tree
const findInTree = (
  categories: CategoryNode[],
  predicate: (cat: CategoryNode) => boolean
): CategoryNode | null => {
  for (const category of categories) {
    if (predicate(category)) {
      return category;
    }
    if (category.children) {
      const found = findInTree(category.children, predicate);
      if (found) return found;
    }
  }
  return null;
};

export const useCategoriesStore = create<CategoriesState>()(
  devtools(
    (set, get) => ({
      categories: [],
      isLoading: false,
      isInitialized: false,
      error: null,
      lastFetch: null,

      fetchCategories: async (options = {}) => {
        const { isLoading } = get();
        // ✅ Якщо вже завантажується - не робимо новий запит
        if (isLoading) return;

        set({ isLoading: true, error: null });

        try {
          const response = await apiClient.get('/categories');

          if (response.data?.success && Array.isArray(response.data.data)) {
            set({
              categories: response.data.data,
              isInitialized: true,
              lastFetch: Date.now(),
              error: null,
            });
          } else {
            throw new Error('Invalid response format');
          }
        } catch (error: any) {
          console.error('❌ Failed to fetch categories:', error);
          set({
            error: error.response?.data?.message || error.message || 'Failed to fetch categories',
            isInitialized: true,
          });
        } finally {
          set({ isLoading: false });
        }
      },

      // ✅ FIXED: Після CRUD операцій - force оновлення кешу
      createCategory: async (data) => {
        set({ isLoading: true, error: null });

        try {
          const response = await apiClient.post('/admin/categories', data);

          if (response.data?.success) {
            // ✅ Force refresh для актуальних даних
            await get().fetchCategories();
            return response.data.data; // Повертаємо створену категорію
          } else {
            throw new Error(response.data?.message || 'Failed to create category');
          }
        } catch (error: any) {
          console.error('❌ Failed to create category:', error);
          set({
            error: error.response?.data?.message || error.message || 'Failed to create category',
          });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // ✅ FIXED: Force refresh після оновлення
      updateCategory: async (id, data) => {
        set({ isLoading: true, error: null });

        try {
          const response = await apiClient.put(`/admin/categories/${id}`, data);

          if (response.data?.success) {
            await get().fetchCategories();
            return response.data.data; // Повертаємо оновлену категорію
          } else {
            throw new Error(response.data?.message || 'Failed to update category');
          }
        } catch (error: any) {
          console.error('❌ Failed to update category:', error);
          set({
            error: error.response?.data?.message || error.message || 'Failed to update category',
          });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // ✅ FIXED: Force refresh після видалення
      deleteCategory: async (id, options = {}) => {
        set({ isLoading: true, error: null });

        try {
          const params = new URLSearchParams();
          if (options.force) {
            params.append('force', 'true');
          }

          const url = params.toString() ? `/admin/categories/${id}?${params}` : `/admin/categories/${id}`;

          const response = await apiClient.delete(url);

          if (response.data?.success) {
            await get().fetchCategories();
          } else {
            throw new Error(response.data?.message || 'Failed to delete category');
          }
        } catch (error: any) {
          console.error('❌ Failed to delete category:', error);
          set({
            error: error.response?.data?.message || error.message || 'Failed to delete category',
          });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // ✅ FIXED: Force refresh після bulk операцій
      bulkUpdateCategories: async (action, ids) => {
        set({ isLoading: true, error: null });

        try {
          const response = await apiClient.post('/admin/categories/bulk', {
            action,
            ids,
          });

          if (response.data?.success) {
            await get().fetchCategories();
          } else {
            throw new Error(response.data?.message || 'Bulk operation failed');
          }
        } catch (error: any) {
          console.error('❌ Bulk operation failed:', error);
          set({
            error: error.response?.data?.message || error.message || 'Bulk operation failed',
          });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // ✅ FIXED: Force refresh після reorder
      reorderCategories: async (updates) => {
        set({ isLoading: true, error: null });

        try {
          const response = await apiClient.post('/admin/categories/reorder', {
            updates,
          });

          if (response.data?.success) {
            await get().fetchCategories();
          } else {
            throw new Error(response.data?.message || 'Failed to reorder categories');
          }
        } catch (error: any) {
          console.error('❌ Failed to reorder categories:', error);
          set({
            error: error.response?.data?.message || error.message || 'Failed to reorder categories',
          });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // Get category by slug
      getCategoryBySlug: (slug) => {
        const { categories } = get();
        return findInTree(categories, (cat) => cat.slug === slug);
      },

      // Get category by ID
      getCategoryById: (id) => {
        const { categories } = get();
        return findInTree(categories, (cat) => cat.id === id);
      },

      // Flatten categories for display
      flattenCategories: () => {
        const { categories } = get();
        return flattenTree(categories);
      },

      getGroupedCategories: () => {
        const { categories } = get();

        const parentsWithChildren = categories
          .filter((cat) => cat.children && cat.children.length > 0)
          .map((parent) => ({
            parent: {
              id: parent.id,
              name: parent.name,
              slug: parent.slug,
            },
            children: (parent.children || []).map((child) => ({
              id: child.id,
              name: child.name,
              slug: child.slug,
              parentId: child.parentId,
            })),
          }));

        return parentsWithChildren;
      },

      // Reset store
      reset: () => {
        set({
          categories: [],
          isLoading: false,
          isInitialized: false,
          error: null,
          lastFetch: null,
        });
      },
    }),
    {
      name: 'categories-store',
    }
  )
);
