import { productsApi, categoriesApi } from '@/features/catalog/api/products';
import TelegramCatalogClient from './TelegramCatalogClient';

export const revalidate = 26400; // 6 годин

export async function generateMetadata() {
  return {
    title: 'Каталог | Telegram Mini App',
    description: "Широкий вибір свіжого м'яса та м'ясних продуктів",
  };
}

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

async function getInitialCategories() {
  try {
    const response = await categoriesApi.getCategories();
    return response.data || [];
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}

export default async function TelegramCatalogPage() {
  const [initialData, initialCategories] = await Promise.all([getInitialProducts(), getInitialCategories()]);

  return <TelegramCatalogClient initialData={initialData} initialCategories={initialCategories} />;
}
