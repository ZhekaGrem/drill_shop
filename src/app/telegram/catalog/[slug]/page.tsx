import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { productsApi } from '@/features/catalog/api/products';
import TelegramProductDetailsClient from './TelegramProductDetailsClient';

export const revalidate = 86400; // 24 години

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  try {
    const response = await productsApi.getProductBySlug(slug);
    const product = response.data;

    return {
      title: `${product.name} | Telegram Mini App`,
      description: product.shortDescription || product.description?.substring(0, 160),
    };
  } catch {
    return {
      title: 'Товар не знайдено',
    };
  }
}

export default async function TelegramProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let productData = null;

  try {
    const response = await productsApi.getProductBySlug(slug);
    productData = response.data;
  } catch (error) {
    console.error('Failed to fetch product:', error);
    notFound();
  }

  if (!productData) {
    notFound();
  }

  return <TelegramProductDetailsClient initialProduct={productData} />;
}
