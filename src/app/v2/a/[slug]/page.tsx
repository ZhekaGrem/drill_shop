// src/app/v2/a/[slug]/page.tsx
// Сервер-обгортка над CollectionProductClient — той самий поділ, що в
// /catalog/[slug]/page.tsx + ProductDetailsClient.tsx: SEO-метадані та
// JSON-LD генеруються тут (сервер), сама сторінка лишається клієнтською
// (3D-сцена, стан активного дизайну колекції). Без цієї обгортки
// /v2/a/[slug] був суто 'use client' без жодного per-товарного title/OG —
// Google бачив дефолтний тайтл на кожному товарі.
import { Metadata } from 'next';
import { cache } from 'react';
import { productsApi } from '@/features/catalog/api/products';
import { JsonLd } from '../../../JsonLd';
import { structuredData } from '../../../seo';
import CollectionProductClient from './CollectionProductClient';

// ISR, як на /catalog/[slug]: без цього серверний запит до бекенда в
// generateMetadata/page робив сторінку повністю динамічною (no-store,
// x-vercel-cache: MISS на кожен візит = виклик функції + запит до API на
// кожного відвідувача). Оновлення товару додатково ревалідує /v2/a/[slug]
// через /api/revalidate, тож година — верхня межа застарілості.
export const revalidate = 3600;

// Сам по собі revalidate тут не спрацював: без generateStaticParams Next
// лишає динамічний сегмент повністю динамічним (перевірено на проді після
// деплою: cache-control no-store, x-vercel-cache MISS на кожен хіт). Тому
// список slug-ів збираємо на білді так само, як /catalog/[slug]; невідомий
// slug рендериться на вимогу і кешується (dynamicParams).
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const response = await productsApi.getProducts(
      { sortBy: 'created', sortOrder: 'desc' },
      { limit: 1000, offset: 0 }
    );
    return response.data.map((product) => ({ slug: product.slug }));
  } catch (error) {
    console.error('Failed to generate static params for /v2/a:', error);
    return [];
  }
}

// Дедуплікація запиту між generateMetadata і самою сторінкою (той самий
// прийом, що на /catalog/[slug])
const getProduct = cache(async (slug: string) => {
  const response = await productsApi.getProductBySlug(slug);
  return response.data;
});

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  try {
    const product = await getProduct(slug);
    const productUrl = `https://www.ye-dril.com/v2/a/${product.slug}`;
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
      title: product.name,
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

export default async function ProductV2Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Товар без 3D-колекції на цю адресу — legit стан (StaticGallery), тож
  // на відміну від /catalog/[slug] тут НЕМАЄ notFound(): помилку показує
  // сам клієнтський компонент (ProductError), сторінка рендериться завжди.
  let product = null;
  try {
    product = await getProduct(slug);
  } catch {
    product = null;
  }

  const productStructuredData = product
    ? structuredData.product({
        name: product.name,
        description: product.description || product.shortDescription || undefined,
        price: product.price,
        images: product.images,
        slug: product.slug,
        sku: product.id?.toString(),
        inStock: product.isInStock,
      })
    : null;

  return (
    <>
      {productStructuredData && <JsonLd data={productStructuredData} />}
      <CollectionProductClient params={params} />
    </>
  );
}
