'use client';
// src/app/v2/a/[slug]/CollectionProductClient.tsx
// Клієнтська частина сторінки товару в колекції: 3D-сцена як галерея
// (мініатюри перемикають товар колекції), під нею картка покупки,
// характеристики, доставка та інші колекції. Опис і відгуки прибрані
// (рішення власника). Колекції — живі.
// SEO-метадані (title/OG/canonical/JSON-LD) генерує сервер-компонент
// page.tsx, що загортає цей клієнтський — той самий поділ, що в
// /catalog/[slug]/page.tsx + ProductDetailsClient.tsx.
import { use, useState } from 'react';
import { Page } from '@/shared/components/Page/Page';
import { Breadcrumbs } from '@/shared/components/Breadcrumbs';
import { useDesign } from '@/shared/hooks/useDesign';
import { switcherForCollection } from '@/shared/config/collection-switcher';
import { HeroVisual } from '@/widgets/HeroVisual/HeroVisual';
import { useProduct } from '@/widgets/ProductV2/useProduct';
import { useCollections } from '@/widgets/ProductV2/useCollections';
import { capsuleStyle, collectionOfSlug, itemBySlug } from '@/widgets/ProductV2/collections';
import { BuyPanel, BuyOptions, BuySummary } from '@/widgets/ProductV2/BuyPanel';
import { ProductError, ProductSkeleton } from '@/widgets/ProductV2/ProductState';
import { OtherCollections } from '@/widgets/ProductV2/OtherCollections';
import { StaticGallery } from '@/widgets/ProductV2/StaticGallery';
import { RichDescription } from '@/shared/components/RichDescription/RichDescription';
import styles from '@/widgets/ProductV2/ProductV2.module.scss';

export default function CollectionProductClient({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: initialSlug } = use(params);
  // Активний товар — СТАН, а не маршрут. router.replace тут перемонтовував
  // сторінку разом із Canvas: WebGL-контекст гинув, сцена вантажилась заново,
  // обертання скидалось. Тепер мініатюри міняють стан (сцена живе, текстура
  // свопиться в тому ж матеріалі), а URL оновлюємо тихо через
  // history.replaceState — Next офіційно підтримує це без ре-рендера.
  const [slug, setSlug] = useState(initialSlug);
  const design = useDesign();
  const { data: collections, isError: collectionsError } = useCollections();
  const collection = collectionOfSlug(collections, slug);
  const item = itemBySlug(collections, slug);
  const { data: product, isError, refetch } = useProduct(slug);
  // Товар каталогу без 3D-колекції (не всі товари в неї входять) — не баг,
  // легітимний стан: колекції довантажились, у них цього slug просто нема.
  // Показуємо власні фото товару замість 3D-сцени, решту UI не міняємо.
  const isStandalone = Boolean(product) && Boolean(collections) && !collectionsError && !collection;

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
        {/* mainRow — власний containing block для sticky .buyColumn: без цієї
            обгортки sticky-елемент прив'язувався до ВСЬОГО .page (разом із
            .fullWidth нижче) і на коротких сторінках заїжджав на карусель
            «Інші колекції», бо для sticky грід-елемента containing block —
            це грід-контейнер БАТЬКА, а не власний рядок. */}
        <BuyPanel product={product ?? null}>
          <div className={styles.mainRow}>
            <div className={styles.mediaColumn}>
              <div className={`${styles.card} ${styles.mediaCard}`} data-product-media>
                {/* Product h1 comes first in the DOM. Flex order places the
                    summary below the image while keeping a single reading order. */}
                {product && <BuySummary />}

                {!isStandalone && (
                  <div className={styles.collectionHead}>
                    <div className={styles.collectionTitleRow}>
                      <h2>
                        {collection?.title ??
                          (collectionsError ? 'Колекція недоступна' : 'Завантажуємо колекцію…')}
                        {collection?.labelText && (
                          <span
                            className={`${styles.capsule} designCapsule`}
                            style={{ ...capsuleStyle(collection.labelColor, design), marginLeft: 8 }}>
                            {collection.labelText}
                          </span>
                        )}
                      </h2>
                      {collection?.badgeText && (
                        <p className={styles.badgeDot}>
                          <span
                            className={styles.pulseDot}
                            style={
                              {
                                '--badge-color': collection.badgeColor ?? 'var(--success-green)',
                              } as React.CSSProperties
                            }
                            aria-hidden="true"
                          />
                          {collection.badgeText}
                        </p>
                      )}
                    </div>
                    {collection?.archivedAt && <p className={styles.outOfStock}>Архівна колекція</p>}
                  </div>
                )}

                <div className={styles.mediaVisual}>
                  {collection ? (
                    <HeroVisual
                      designs={collection.designs}
                      switcher={switcherForCollection(collection.key)}
                      switcherWidth="column"
                      value={item?.key}
                      onChange={handleDesignChange}
                    />
                  ) : isStandalone ? (
                    <StaticGallery images={product?.images ?? []} name={product?.name ?? ''} />
                  ) : collections || collectionsError ? null : (
                    <div
                      className={styles.stageSkeleton}
                      aria-busy="true"
                      aria-label="Завантаження колекції"
                    />
                  )}
                </div>

                {collection?.description && (
                  <p className={styles.collectionDescription}>
                    <RichDescription text={collection.description} />
                  </p>
                )}
              </div>
            </div>

            <aside className={styles.buyColumn}>
              <div className={`${styles.card} ${styles.optionsCard}`}>
                {product ? (
                  <BuyOptions />
                ) : isError ? (
                  <ProductError slug={slug} onRetry={() => refetch()} />
                ) : (
                  <ProductSkeleton />
                )}
              </div>
            </aside>
          </div>
        </BuyPanel>

        {/* Опис і відгуки прибрані з клієнтської сторінки (рішення власника) */}

        <div className={styles.fullWidth}>
          <OtherCollections collections={collections} currentKey={collection?.key} />
        </div>
      </div>
    </Page>
  );
}
