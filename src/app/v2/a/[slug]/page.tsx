'use client';
// v2 «A» — повна сторінка товару в колекції: 3D-сцена як галерея (мініатюри
// перемикають товар колекції), під нею картка покупки, характеристики,
// доставка, опис, відгуки та інші колекції.
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Page } from '@/shared/components/Page/Page';
import { Section } from '@/shared/components/Section/Section';
import { Breadcrumbs } from '@/shared/components/Breadcrumbs';
import { HeroVisual } from '@/widgets/HeroVisual/HeroVisual';
import { ProductReviews } from '@/features/reviews/components/ProductReviews/ProductReviews';
import { sanitizeHTML } from '@/shared/utils/sanitize';
import { useProduct } from '@/widgets/ProductV2/useProduct';
import { collectionOfSlug, itemBySlug } from '@/widgets/ProductV2/collections';
import { BuyPanel } from '@/widgets/ProductV2/BuyPanel';
import { ProductError, ProductSkeleton } from '@/widgets/ProductV2/ProductState';
import { ProductInfoGroups } from '@/widgets/ProductV2/ProductInfoGroups';
import { OtherCollections } from '@/widgets/ProductV2/OtherCollections';
import styles from '@/widgets/ProductV2/ProductV2.module.scss';

export default function ProductV2A({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const collection = collectionOfSlug(slug);
  const item = itemBySlug(slug);
  const { data: product, isError, refetch } = useProduct(slug);

  // Мініатюра в сцені = інший товар колекції: міняємо адресу без перезавантаження
  const handleDesignChange = (key: string) => {
    const target = collection.items.find((i) => i.key === key);
    if (target && target.slug !== slug) router.replace(`/v2/a/${target.slug}`);
  };

  return (
    <Page>
      <Breadcrumbs
        items={[
          { label: 'Головна', href: '/' },
          { label: 'Каталог', href: '/catalog' },
          { label: product?.name ?? item?.design.label ?? 'Товар' },
        ]}
      />

      <div className={styles.page}>
        {/* Галерея = жива сцена колекції; мініатюри під нею перемикають товар */}
        <div className={styles.card}>
          <div className={styles.collectionHead}>
            <h2>Колекція «{collection.title}»</h2>
            <p>{collection.description}</p>
          </div>
          <HeroVisual
            designs={collection.designs}
            switcher="thumbs"
            value={item?.key}
            onChange={handleDesignChange}
          />
        </div>

        <div className={styles.card}>
          {product ? (
            <BuyPanel product={product} />
          ) : isError ? (
            <ProductError slug={slug} onRetry={() => refetch()} />
          ) : (
            <ProductSkeleton />
          )}
        </div>

        {product && <ProductInfoGroups product={product} />}

        {product?.description && (
          <Section title="Опис">
            <div className={styles.card}>
              <div
                className={styles.description}
                dangerouslySetInnerHTML={{ __html: sanitizeHTML(product.description) }}
              />
            </div>
          </Section>
        )}

        {product && <ProductReviews productId={product.id} />}

        <OtherCollections currentKey={collection.key} />
      </div>
    </Page>
  );
}
