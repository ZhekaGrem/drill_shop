'use client';

import merch from '@/shared/config/new-merch.json';
import { content } from '@/shared/config/content';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { HomeHeroes } from '@/widgets/HomeHeroes/HomeHeroes';
import { useCollections } from '@/widgets/ProductV2/useCollections';

const collectionKeys = new Set(merch.collections.map((collection) => collection.key));

export const NewMerchHeroes = () => {
  const { data: collections, isError } = useCollections();
  const own = collections?.filter((collection) => collectionKeys.has(collection.key));
  if (isError || (own && own.length === 0)) {
    return <PageHeader title={content.prokliatyi.title} description={content.prokliatyi.soon} />;
  }
  return <HomeHeroes collections={own} showAbout={false} intro={content.prokliatyi} />;
};
