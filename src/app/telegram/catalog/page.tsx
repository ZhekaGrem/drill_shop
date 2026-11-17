import { getCatalogFirstPage } from '@/features/catalog/api/products';
import CatalogClient from '@/app/catalog/CatalogClient';

export const revalidate = 26400; // 6 годин

export async function generateMetadata() {
  return {
    title: 'Каталог | Telegram Mini App',
    description: 'Офіційний мерч Щільного Drill: футболки, худі, постери та аксесуари.',
  };
}

// Категорії тут більше не тягнемо: їх споживали лише фільтри каталогу,
// які прибрані (рішення власника)

export default async function TelegramCatalogPage() {
  const initialData = await getCatalogFirstPage();

  return <CatalogClient initialData={initialData} basePath="/telegram" />;
}
