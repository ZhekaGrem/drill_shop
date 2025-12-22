// src/app/catalog/category/[slug]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { productsApi, categoriesApi } from '@/features/catalog/api/products';
import CategoryPageClient from './CategoryPageClient';
import { JsonLd } from '../../../JsonLd';
import { structuredData } from '../../../seo';

// Revalidate кожні 6 годин
export const revalidate = 21600;

// ✅ ФІКС CPU: Повертати 404 для категорій не з generateStaticParams
export const dynamicParams = false;

// ✅ ФІКС CPU: Кешування API запиту для дедуплікації між generateMetadata та page
const getCategory = cache(async (slug: string) => {
  const response = await categoriesApi.getCategoryBySlug(slug);
  return response.data;
});

// Генеруємо статичні шляхи для всіх категорій при білді
export async function generateStaticParams() {
  try {
    const response = await categoriesApi.getCategories();
    return response.data.map((category) => ({
      slug: category.slug,
    }));
  } catch (error) {
    console.error('Failed to generate static params for categories:', error);
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  try {
    // ✅ Використовуємо кешований запит (дедуплікація з page component)
    const category = await getCategory(slug);

    return {
      title: category.metaTitle || `${category.name} | Каталог`,
      description: category.metaDescription || category.description || `Товари категорії ${category.name}`,
      alternates: {
        canonical: `https://shchilnuidrill.com/catalog/category/${category.slug}`,
      },
      openGraph: {
        title: category.metaTitle || category.name,
        description: category.metaDescription || category.description || undefined,
        images: category.image ? [{ url: category.image }] : [],
      },
    };
  } catch {
    return {
      title: 'Категорія не знайдена',
      description: 'Категорія не знайдена в каталозі',
    };
  }
}

// SSG сторінка категорії
export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let categoryData = null;
  let productsData = null;

  try {
    // ✅ Завантажуємо категорію (кешований запит) та товари паралельно
    const [category, productsResponse] = await Promise.all([
      getCategory(slug), // Використовуємо кеш
      productsApi.getProductsByCategory(slug, { limit: 18, offset: 0 }),
    ]);

    categoryData = category;
    productsData = productsResponse;
  } catch (error) {
    console.error('Failed to fetch category or products:', error);
    notFound();
  }

  if (!categoryData) {
    notFound();
  }

  // Генеруємо structured data для категорії
  const breadcrumbData = structuredData.breadcrumb([
    {
      name: 'Головна',
      url: 'https://shchilnuidrill.com',
    },
    {
      name: 'Каталог',
      url: 'https://shchilnuidrill.com/catalog',
    },
    {
      name: categoryData.name,
      url: `https://shchilnuidrill.com/catalog/category/${categoryData.slug}`,
    },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbData} />
      <CategoryPageClient initialCategory={categoryData} initialProducts={productsData} />
    </>
  );
}
