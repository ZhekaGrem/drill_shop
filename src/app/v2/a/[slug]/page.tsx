'use client';
// Сторінка товару в колекції: 3D-сцена як галерея (мініатюри перемикають
// товар колекції), під нею картка покупки, характеристики, доставка та інші
// колекції. Опис і відгуки прибрані (рішення власника). Колекції — живі.
import { use, useState } from 'react';
import { Page } from '@/shared/components/Page/Page';
import { Breadcrumbs } from '@/shared/components/Breadcrumbs';
import { HeroVisual } from '@/widgets/HeroVisual/HeroVisual';
import { useProduct } from '@/widgets/ProductV2/useProduct';
import { useCollections } from '@/widgets/ProductV2/useCollections';
import { capsuleStyle, collectionOfSlug, itemBySlug } from '@/widgets/ProductV2/collections';
import { BuyPanel } from '@/widgets/ProductV2/BuyPanel';
import { ProductError, ProductSkeleton } from '@/widgets/ProductV2/ProductState';
import { ProductInfoGroups } from '@/widgets/ProductV2/ProductInfoGroups';
import { OtherCollections } from '@/widgets/ProductV2/OtherCollections';
import { RichDescription } from '@/shared/components/RichDescription/RichDescription';
import styles from '@/widgets/ProductV2/ProductV2.module.scss';

export default function CollectionProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: initialSlug } = use(params);
  // Активний товар — СТАН, а не маршрут. router.replace тут перемонтовував
  // сторінку разом із Canvas: WebGL-контекст гинув, сцена вантажилась заново,
  // обертання скидалось. Тепер мініатюри міняють стан (сцена живе, текстура
  // свопиться в тому ж матеріалі), а URL оновлюємо тихо через
  // history.replaceState — Next офіційно підтримує це без ре-рендера.
  const [slug, setSlug] = useState(initialSlug);
  const { data: collections } = useCollections();
  const collection = collectionOfSlug(collections, slug);
  const item = itemBySlug(collections, slug);
  const { data: product, isError, refetch } = useProduct(slug);

  const handleDesignChange = (key: string) => {
    if (key === slug) return;
    setSlug(key);
    window.history.replaceState(null, '', `/v2/a/${key}`);
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
            {/* Назва зліва, пульсуюча крапка колекції — у правому куті рядка */}
            <div className={styles.collectionTitleRow}>
              <h2>
                {collection ? collection.title : 'Завантажуємо колекцію…'}
                {collection?.labelText && (
                  <span
                    className={`${styles.capsule} designCapsule`}
                    style={{ ...capsuleStyle(collection.labelColor), marginLeft: 8 }}>
                    {collection.labelText}
                  </span>
                )}
              </h2>
              {collection?.badgeText && (
                <p className={styles.badgeDot}>
                  <span
                    className={styles.pulseDot}
                    style={{ '--badge-color': collection.badgeColor ?? '#1c8a37' } as React.CSSProperties}
                    aria-hidden="true"
                  />
                  {collection.badgeText}
                </p>
              )}
            </div>
            {collection?.archivedAt && <p className={styles.outOfStock}>Архівна колекція</p>}
          </div>
          {collection ? (
            <HeroVisual
              designs={collection.designs}
              switcher="thumbs"
              value={item?.key}
              onChange={handleDesignChange}
            />
          ) : (
            <div className={styles.stageSkeleton} aria-busy="true" aria-label="Завантаження колекції" />
          )}
          {/* Опис колекції — внизу картки, під сценою */}
          {collection?.description && (
            <p className={styles.collectionDescription}>
              <RichDescription text={collection.description} />
            </p>
          )}
        </div>

        <div className={styles.card}>
          {product ? (
            // key: зміна товару скидає вибір розміру/кількості до дефолтів
            <BuyPanel key={product.id} product={product} />
          ) : isError ? (
            <ProductError slug={slug} onRetry={() => refetch()} />
          ) : (
            <ProductSkeleton />
          )}
        </div>

        {product && <ProductInfoGroups product={product} />}

        {/* Опис і відгуки прибрані з клієнтської сторінки (рішення власника) */}

        <OtherCollections collections={collections} currentKey={collection?.key} />
      </div>
    </Page>
  );
}
