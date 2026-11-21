'use client';
// src/widgets/ZlypniGallery/ZlypniGallery.tsx
// Прихована галерея «Злипні» (/zlypni/<ключ>): лише перегляд, без цін, розмірів і кошика.
// Дані — з репозиторію (config/zlypni.ts), а не з БД: товарів там уже нема.
import { Page } from '@/shared/components/Page/Page';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { content } from '@/shared/config/content';
import { ZLYPNI_COLLECTIONS, ZLYPNI_TITLE } from '@/shared/config/zlypni';
import { ZlypniShowcase } from './ZlypniShowcase';

export const ZlypniGallery = () => (
  <Page>
    <PageHeader title={ZLYPNI_TITLE} description={content.zlypniGallery.description} />
    {ZLYPNI_COLLECTIONS.map((collection) => (
      <ZlypniShowcase key={collection.key} collection={collection} />
    ))}
  </Page>
);
