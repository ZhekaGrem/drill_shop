// src/app/catalog/page.tsx — SSG зі списком товарів
import { getCatalogFirstPage } from '@/features/catalog/api/products';
import CatalogClient from './CatalogClient';
import { JsonLd } from '../JsonLd';
import { structuredData } from '../seo';

// ✅ Revalidate кожні 6 годин
export const revalidate = 21600;

export async function generateMetadata() {
  return {
    title: 'Каталог товарів',
    description:
      'Великий вибір мерчу онлайн — футболки, худі, аксесуари. Доставка по Україні від офіційного магазину Є.Дріл.',
    alternates: {
      canonical: 'https://www.ye-dril.com/catalog',
    },
  };
}

// Категорії тут більше не тягнемо: єдиним їхнім споживачем були фільтри
// каталогу, які прибрані (рішення власника). Один зайвий запит на SSG менше.

export default async function CatalogPage() {
  // SSG: перша сторінка вже без товарів прихованих розділів
  const initialData = await getCatalogFirstPage();

  const itemListData = initialData?.data
    ? structuredData.itemList(
        initialData.data.map((p) => ({
          name: p.name,
          slug: p.slug,
          image: p.primaryImage?.url || p.images?.[0]?.url,
        }))
      )
    : null;

  return (
    <>
      {itemListData && <JsonLd data={itemListData} />}
      <h1 className="hiddenTitle">Каталог мерчу Є.Дріл — футболки, худі, постери та аксесуари</h1>
      <CatalogClient initialData={initialData} />
    </>
  );
}
