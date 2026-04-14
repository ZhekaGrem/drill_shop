// src/app/catalog/page.tsx - SSG with categories
import { productsApi, categoriesApi } from '@/features/catalog/api/products';
import CatalogClient from './CatalogClient';
import { JsonLd } from '../JsonLd';
import { structuredData } from '../seo';

// ✅ Revalidate кожні 6 годин
export const revalidate = 21600;

export async function generateMetadata() {
  return {
    title: 'Каталог товарів',
    description:
      'Великий вибір мерчу онлайн — футболки, худі, аксесуари. Доставка по Україні від офіційного магазину Drill shop.',
    alternates: {
      canonical: 'https://www.shchilnuidrill.com/catalog',
    },
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
      <h1 className="hiddenTitle">
        Каталог мерчу Drill shop — футболки, худі, постери та аксесуари
      </h1>
      <CatalogClient initialData={initialData} initialCategories={initialCategories} />
    </>
  );
}
