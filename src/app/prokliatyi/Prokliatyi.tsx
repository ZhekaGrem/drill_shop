// src/app/prokliatyi/Prokliatyi.tsx
// Колекції розділу (футболки, худі) героями — та сама механіка, що на
// головній (HomeHeroes: стек Дії або механіка дизайн-концепції з /v2/dev).
// Колекції розділу — ті, чия словомарка в hidden-collections «***»;
// порядок той, що віддає бекенд (sortOrder 102, 103).
'use client';

import { Page } from '@/shared/components/Page/Page';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { HIDDEN_COLLECTION_WORDMARK } from '@/shared/config/hidden-collections';
import { content } from '@/shared/config/content';
import { HomeHeroes } from '@/widgets/HomeHeroes/HomeHeroes';
import { useCollections } from '@/widgets/ProductV2/useCollections';

const WORDMARK = HIDDEN_COLLECTION_WORDMARK['prokliatyi-futbolky'];

const Prokliatyi = () => {
  const { data: collections, isError } = useCollections();
  const own = collections?.filter((c) => HIDDEN_COLLECTION_WORDMARK[c.key] === WORDMARK);

  // Колекції приїхали, а розділу серед них нема (вимкнений у БД), або запит
  // упав. Без цієї гілки HomeHeroes вічно крутив би скелетон.
  if (isError || (own && own.length === 0)) {
    return (
      <Page>
        <PageHeader title={content.prokliatyi.title} description={content.prokliatyi.soon} />
      </Page>
    );
  }

  return (
    <Page>
      <HomeHeroes collections={own} showAbout={false} intro={content.prokliatyi} />
    </Page>
  );
};

export default Prokliatyi;
