import { productsApi } from '@/features/catalog/api/products';
import CatalogClient from '@/app/catalog/CatalogClient';

export const revalidate = 26400; // 6 годин

export async function generateMetadata() {
  return {
    title: 'Каталог | Telegram Mini App',
    description: 'Офіційний мерч Щільного Drill: футболки, худі, постери та аксесуари.',
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

// Категорії тут більше не тягнемо: їх споживали лише фільтри каталогу,
// які прибрані (рішення власника)

export default async function TelegramCatalogPage() {
  const initialData = await getInitialProducts();

  return <CatalogClient initialData={initialData} basePath="/telegram" />;
}
