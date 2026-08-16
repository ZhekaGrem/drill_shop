// src/app/catalog/[slug]/page.tsx - SSG для всіх товарів
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { productsApi } from '@/features/catalog/api/products';
import ProductDetailsClient from './ProductDetailsClient';
import { JsonLd } from '../../JsonLd';
import { structuredData } from '../../seo';

// Revalidate кожні 24 години
export const revalidate = 86400;

// ✅ ФІКС CPU: Повертати 404 для товарів не з generateStaticParams
export const dynamicParams = true;

// ✅ ФІКС CPU: Кешування API запиту для дедуплікації між generateMetadata та page
const getProduct = cache(async (slug: string) => {
  const response = await productsApi.getProductBySlug(slug);
  return response.data;
});

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
    // ✅ Використовуємо кешований запит (дедуплікація з page component)
    const product = await getProduct(slug);

    const productUrl = `https://www.ye-dril.com/catalog/${product.slug}`;
    const image = product.images?.[0];

    const shortDesc = product.shortDescription?.trim();
    const longDesc = product.description?.trim();
    const description =
      shortDesc && shortDesc.length >= 80
        ? shortDesc.slice(0, 160)
        : longDesc
          ? longDesc.slice(0, 160)
          : `Купити ${product.name} у Є.Дріл. Ціна від ${product.price} грн. Офіційний магазин мерчу Щільний Drill, доставка по Україні.`;

    return {
      title: `${product.name}`,
      description,
      alternates: {
        canonical: productUrl,
      },
      openGraph: {
        title: product.name,
        description,
        url: productUrl,
        siteName: 'Є.Дріл',
        locale: 'uk_UA',
        type: 'article',
        images: image?.url
          ? [{ url: image.url, width: 851, height: 1024, alt: image.altText || product.name }]
          : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: product.name,
        description,
        images: image?.url ? [image.url] : [],
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
    // ✅ Використовуємо кешований запит (той самий що в generateMetadata)
    productData = await getProduct(slug);
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

  // Відгуки прибрані з видимої сторінки (рішення власника), тому JSON-LD
  // aggregateRating/review теж не віддаємо: розмітка контенту, якого нема на
  // екрані, порушує вимоги Google до rich results
  const productStructuredData = structuredData.product({
    name: productData.name,
    description: productData.description || productData.shortDescription || undefined,
    price: productData.price,
    images: productData.images,
    slug: productData.slug,
    sku: productData.id?.toString(),
    category: categoryName ? { name: categoryName } : undefined,
    inStock: productData.isInStock,
  });

  // Генеруємо breadcrumb structured data (з fallback, якщо бекенд не повертає breadcrumbs)
  const breadcrumbItems = productData.breadcrumbs?.length
    ? productData.breadcrumbs.map((crumb) => ({
        name: crumb.name,
        url: `https://www.ye-dril.com${crumb.url}`,
      }))
    : [
        { name: 'Головна', url: 'https://www.ye-dril.com' },
        { name: 'Каталог', url: 'https://www.ye-dril.com/catalog' },
        { name: productData.name, url: `https://www.ye-dril.com/catalog/${productData.slug}` },
      ];

  const breadcrumbData = structuredData.breadcrumb(breadcrumbItems);

  // Передаємо статичні дані в клієнтський компонент
  return (
    <>
      <JsonLd data={productStructuredData} />
      <JsonLd data={breadcrumbData} />
      <ProductDetailsClient initialProduct={productData} />
    </>
  );
}
