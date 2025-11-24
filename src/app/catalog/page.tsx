// src/app/catalog/page.tsx - SSG with categories
import { productsApi, categoriesApi } from '@/features/catalog/api/products';
import CatalogClient from './CatalogClient';

// ✅ Revalidate кожні 6 години
export const revalidate = 26400;
// export const revalidate = 300;

export async function generateMetadata() {
  return {
    title: 'Каталог товарів | Selo ta Salo',
    description: "Широкий вибір свіжого м'яса та м'ясних продуктів",
  };
}

// SSG - завантажуємо початкові товари
async function getInitialProducts() {
  try {
    const response = await productsApi.getProducts(
      { sortBy: 'created', sortOrder: 'desc' },
      { limit: 18, offset: 0 }
    );
    return response;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return null;
  }
}

// ✅ SSG - завантажуємо категорії
async function getInitialCategories() {
  try {
    const response = await categoriesApi.getCategories();
    return response.data || [];
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}

export default async function CatalogPage() {
  const [initialData, initialCategories] = await Promise.all([getInitialProducts(), getInitialCategories()]);

  return <CatalogClient initialData={initialData} initialCategories={initialCategories} />;
}
