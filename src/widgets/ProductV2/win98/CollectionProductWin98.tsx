'use client';
// src/widgets/ProductV2/win98/CollectionProductWin98.tsx
// Сторінка товару в колекції (/v2/a/[slug]) у дизайні Windows 98 — окремий компонент, щоб дизайни до Windows рендерив
// незмінний app/v2/a/[slug]/CollectionProductClient.tsx (вибір — CollectionProductByDesign.tsx).
// Екран — окремі вікна на робочому столі (docs/windows-95-98-encyclopedia.md §7):
//   1. вікно товару: синя смуга з хлібними крихтами, 3D на білій робочій області (крапка колекції в її куті),
//      «Фото товару», ціна, розміри й «Додати в кошик» — на кнопці вікно закінчується;
//   2. «Інформація»: характеристики, розмірна сітка, доставка й оплата на білому полі з кнопкою праворуч;
//   3. «Іньчі колекції».
// Стан покупки — BuyPanelWin98.tsx, стилі — ProductV2Win98.module.scss.
import { use, useState } from 'react';
import { Page } from '@/shared/components/Page/Page';
import { Breadcrumbs } from '@/shared/components/Breadcrumbs';
import { RichDescription } from '@/shared/components/RichDescription/RichDescription';
import { Windows98WindowBar } from '@/shared/components/Windows98/Windows98';
import { switcherForCollection } from '@/shared/config/collection-switcher';
import { HeroVisual } from '@/widgets/HeroVisual/HeroVisual';
import { useProduct } from '../useProduct';
import { useCollections } from '../useCollections';
import { capsuleStyle, collectionOfSlug, itemBySlug } from '../collections';
import { ProductError, ProductSkeleton } from '../ProductState';
import { ProductInfoGroups } from '../ProductInfoGroups';
import { StaticGallery } from '../StaticGallery';
import { BuyPanel, BuySummary } from './BuyPanelWin98';
import { OtherCollectionsWin98 } from './OtherCollectionsWin98';
import { ProductPhotos } from './ProductPhotos';
import styles from './ProductV2Win98.module.scss';

export function CollectionProductWin98({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: initialSlug } = use(params);
  // Активний товар — стан, а не маршрут: мініатюри міняють стан (сцена живе), а URL оновлюється тихо через
  // history.replaceState — так само, як у CollectionProductClient.
  const [slug, setSlug] = useState(initialSlug);
  const { data: collections, isError: collectionsError } = useCollections();
  const collection = collectionOfSlug(collections, slug);
  const item = itemBySlug(collections, slug);
  const { data: product, isError, refetch } = useProduct(slug);
  // Товар каталогу без 3D-колекції — легітимний стан: показуємо власні фото товару замість 3D-сцени
  const isStandalone = Boolean(product) && Boolean(collections) && !collectionsError && !collection;

  const handleDesignChange = (key: string) => {
    if (key === slug) return;
    setSlug(key);
    window.history.replaceState(null, '', `/v2/a/${key}`);
  };

  const crumbs = [
    { label: 'Головна', href: '/' },
    { label: 'Каталог', href: '/catalog' },
    { label: product?.name ?? item?.design.label ?? 'Товар' },
  ];
  // Крапка колекції («■ класика») — у куті білої робочої області сцени, як у героях
  const badge = collection?.badgeText && (
    <p className={styles.badgeDot}>
      <span
        className={styles.pulseDot}
        style={{ '--badge-color': collection.badgeColor ?? 'var(--success-green)' } as React.CSSProperties}
        aria-hidden="true"
      />
      {collection.badgeText}
    </p>
  );

  return (
    <Page>
      <div className={styles.page}>
        {/* mainRow — власний containing block для sticky .buyColumn (див. CollectionProductClient) */}
        <BuyPanel product={product ?? null}>
          <div className={styles.mainRow}>
            <div className={styles.mediaColumn}>
              <div className={`${styles.card} ${styles.mediaCard}`} data-product-media data-store-window="">
                <Windows98WindowBar>
                  <Breadcrumbs items={crumbs} />
                </Windows98WindowBar>
                {/* h1 товару стоїть першим у DOM; flex order показує його під сценою */}
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
                            style={{ ...capsuleStyle(collection.labelColor, 'win98'), marginLeft: 8 }}>
                            {collection.labelText}
                          </span>
                        )}
                      </h2>
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
                      stageOverlay={badge || undefined}
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

                {/* Фото товару: каталог і сцена показують 3D, тож фото відкриваються окремим вікном */}
                {product && collection && <ProductPhotos images={product.images ?? []} name={product.name} />}

                {collection?.description && (
                  <p className={styles.collectionDescription}>
                    <RichDescription text={collection.description} />
                  </p>
                )}
              </div>
            </div>

            <aside className={styles.buyColumn}>
              <div className={`${styles.card} ${styles.optionsCard}`} data-store-window="">
                <Windows98WindowBar as="h2" title="Інформація" />
                {product ? (
                  <div data-win98-field="">
                    <ProductInfoGroups product={product} hideChoiceOptions />
                  </div>
                ) : isError ? (
                  <ProductError slug={slug} onRetry={() => refetch()} />
                ) : (
                  <ProductSkeleton />
                )}
              </div>
            </aside>
          </div>
        </BuyPanel>

        <div className={styles.fullWidth}>
          <OtherCollectionsWin98 collections={collections} currentKey={collection?.key} />
        </div>
      </div>
    </Page>
  );
}
