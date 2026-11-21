'use client';
// src/widgets/ZlypniSection/ZlypniSection.tsx
// Розділ «є. Злипні»: герої двох колекцій (3D з перемикачем, як у «є. ***»). Сітки під ними
// нема: пʼять футболок і три худі видно з перемикача героя.
import { content } from '@/shared/config/content';
import { ZLYPNI_SECTION_SLUGS } from '@/shared/config/zlypni';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { HomeHeroes } from '@/widgets/HomeHeroes/HomeHeroes';
import { useCollections } from '@/widgets/ProductV2/useCollections';

export const ZlypniSection = () => {
  const { data: collections, isError } = useCollections();
  // Порядок розділу, а не бекенда: футболляндручки, потім боби
  const own =
    collections && ZLYPNI_SECTION_SLUGS.flatMap((slug) => collections.filter((c) => c.key === slug));
  if (isError || (own && own.length === 0)) {
    return <PageHeader title={content.zlypni.title} description={content.zlypni.soon} />;
  }
  return <HomeHeroes collections={own} showAbout={false} intro={content.zlypni} />;
};
