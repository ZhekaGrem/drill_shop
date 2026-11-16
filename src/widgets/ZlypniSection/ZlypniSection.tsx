'use client';
// src/widgets/ZlypniSection/ZlypniSection.tsx
// Розділ «є. Злипні»: герої двох колекцій (3D з перемикачем, як у «є. ***»), а під ними всі
// дизайни кожної колекції сіткою — сто футболок перемикачем героя не переглянеш.
import { content } from '@/shared/config/content';
import { ZLYPNI_COLLECTION_SLUGS, ZLYPNI_LIVE } from '@/shared/config/zlypni';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { CollectionGrid } from '@/widgets/CollectionGrid/CollectionGrid';
import { HomeHeroes } from '@/widgets/HomeHeroes/HomeHeroes';
import { useCollections } from '@/widgets/ProductV2/useCollections';

export const ZlypniSection = () => {
  const { data: collections, isError } = useCollections();
  // Порядок розділу, а не бекенда: футболярчики, потім бобаночки
  const own =
    collections && ZLYPNI_COLLECTION_SLUGS.flatMap((slug) => collections.filter((c) => c.key === slug));
  if (!ZLYPNI_LIVE || isError || (own && own.length === 0)) {
    return <PageHeader title={content.zlypni.title} description={content.zlypni.soon} />;
  }
  return (
    <>
      <HomeHeroes collections={own} showAbout={false} intro={content.zlypni} />
      {own?.map((collection) => (
        <CollectionGrid key={collection.key} collection={collection} countWords={content.zlypni.designs} />
      ))}
    </>
  );
};
