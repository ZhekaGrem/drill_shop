// src/app/sitemap.ts
import { MetadataRoute } from 'next';
import { productsApi, categoriesApi } from '@/features/catalog/api/products';

const baseUrl = 'https://selotasalo.shop';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Статичні сторінки
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/catalog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/delivery-and-payment`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/returns-exchanges`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/public-offer`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.4,
    },
  ];

  try {
    // Завантажуємо всі товари для sitemap
    const productsResponse = await productsApi.getProducts(
      { sortBy: 'created', sortOrder: 'desc' },
      { limit: 1000, offset: 0 }
    );

    const productPages: MetadataRoute.Sitemap = productsResponse.data.map((product) => ({
      url: `${baseUrl}/catalog/${product.slug}`,
      lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    // Завантажуємо всі категорії
    const categoriesResponse = await categoriesApi.getCategories();

    const categoryPages: MetadataRoute.Sitemap = categoriesResponse.data.map((category) => ({
      url: `${baseUrl}/catalog?category=${category.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    return [...staticPages, ...categoryPages, ...productPages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Повертаємо хоча б статичні сторінки
    return staticPages;
  }
}
