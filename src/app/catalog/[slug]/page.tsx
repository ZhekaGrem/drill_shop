// src/app/catalog/[slug]/page.tsx - SSG для всіх товарів
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { productsApi } from '@/features/catalog/api/products';
import ProductDetailsClient from './ProductDetailsClient';
import { JsonLd } from '../../JsonLd';
import { structuredData } from '../../seo';

// Revalidate кожні 24 години
export const revalidate = 86400;



// Генеруємо статичні шляхи для ВСІХ товарів при білді
export async function generateStaticParams() {
  try {
    // Завантажуємо всі товари (якщо < 1000)
    const response = await productsApi.getProducts(
      { sortBy: 'created', sortOrder: 'desc' },
      { limit: 1000, offset: 0 }
    );

    // Генеруємо шляхи
    return response.data.map((product) => ({
      slug: product.slug,
    }));
  } catch (error) {
    console.error('Failed to generate static params:', error);
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  try {
    const response = await productsApi.getProductBySlug(slug);
    const product = response.data;

    return {
      title: `${product.name}`,
      description: product.shortDescription || product.description?.substring(0, 160),
      alternates: {
        canonical: `https://shchilnuidrill.com/catalog/${product.slug}`,
      },
      openGraph: {
        title: product.name,
        description: product.shortDescription || undefined,
        images: product.images?.[0]?.url ? [{ url: product.images[0].url }] : [],
      },
    };
  } catch {
    return {
      title: 'Товар не знайдено',
      description: 'Товар не знайдено в каталозі',
    };
  }
}

// SSG сторінка товару
export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let productData = null;

  try {
    // Завантажуємо товар на сервері
    const response = await productsApi.getProductBySlug(slug);
    productData = response.data;
  } catch (error) {
    console.error('Failed to fetch product:', error);
    notFound();
  }

  if (!productData) {
    notFound();
  }

  // Генеруємо structured data для товару
  // Витягуємо назву категорії з breadcrumbs якщо доступна
  const categoryName = productData.breadcrumbs?.find((b) => b.slug !== 'catalog')?.name;

  const productStructuredData = structuredData.product({
    name: productData.name,
    description: productData.description || productData.shortDescription || undefined,
    price: productData.price,
    images: productData.images,
    slug: productData.slug,
    sku: productData.id?.toString(),
    category: categoryName ? { name: categoryName } : undefined,
  });

  // Генеруємо breadcrumb structured data
  const breadcrumbData = productData.breadcrumbs
    ? structuredData.breadcrumb(
        productData.breadcrumbs.map((crumb) => ({
          name: crumb.name,
          url: `https://shchilnuidrill.com${crumb.url}`,
        }))
      )
    : null;

  // Передаємо статичні дані в клієнтський компонент
  return (
    <>
      <JsonLd data={productStructuredData} />
      {breadcrumbData && <JsonLd data={breadcrumbData} />}
      <ProductDetailsClient initialProduct={productData} />
    </>
  );
}
