// src/app/zlypni/[key]/page.tsx
// Прихована галерея «Злипні»: відкривається лише за посиланням із ключем, яке власник
// надсилає вибраним клієнтам. Ключа в коді нема (репозиторій публічний) — тільки його хеш
// (config/zlypni.ts); з будь-яким іншим ключем, як і на голому /zlypni, сторінки не існує.
import { createHash } from 'node:crypto';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ZLYPNI_PREVIEW_KEY_SHA256, ZLYPNI_TITLE } from '@/shared/config/zlypni';
import { ZlypniGallery } from '@/widgets/ZlypniGallery/ZlypniGallery';

// Порожній список: сторінка статична, але будується на перший візит — ключ на білді не відомий
export async function generateStaticParams() {
  return [];
}

export const metadata: Metadata = {
  title: ZLYPNI_TITLE,
  robots: { index: false, follow: false },
};

export default async function ZlypniGalleryPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (createHash('sha256').update(key).digest('hex') !== ZLYPNI_PREVIEW_KEY_SHA256) notFound();
  return <ZlypniGallery />;
}
