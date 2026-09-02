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
import { BuyPanel } from '@/widgets/ProductV2/BuyPanel';
import { ProductError, ProductSkeleton } from '@/widgets/ProductV2/ProductState';
import { ProductInfoGroups } from '@/widgets/ProductV2/ProductInfoGroups';
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
        <div className={styles.mainRow}>
          {/* DOM-порядок навмисно розходиться з візуальним: h1 (назва товару,
              нижче в BuyPanel) має стояти в розмітці ПЕРЕД h2 (назва колекції) —
              аудит вимагає це для скрін-рідерів. Візуальне місце обох колонок
              (медіа зліва, покупка справа/липка) тримає order у SCSS, тож
              розмітка нижче не міняє нічого на екрані, лише порядок читання. */}
          <div className={styles.buyColumn}>
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
          </div>

          {/* Галерея = жива сцена колекції; мініатюри під нею перемикають товар.
              Товар без колекції (isStandalone) заголовок колекції не показує
              взагалі — нема чого називати, назва товару вже стоїть у buyColumn. */}
          <div className={styles.card}>
            {!isStandalone && (
              <div className={styles.collectionHead}>
                {/* Назва зліва, пульсуюча крапка колекції — у правому куті рядка */}
                <div className={styles.collectionTitleRow}>
                  <h2>
                    {collection?.title ?? (collectionsError ? 'Колекція недоступна' : 'Завантажуємо колекцію…')}
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
                        // Той самий фікс, що й у BuyPanel, і з тієї ж причини:
                        // жодного hex у компоненті (правило проєкту), а не
                        // контраст — крапка aria-hidden і дублює текст поруч,
                        // тож рахується WCAG 1.4.11 (нетекстовий контраст, 3:1),
                        // не 1.4.3. #1c8a37 проходить 3:1 (4.43:1 удень / 3.60:1
                        // уночі) так само, як і токен.
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
            ) : collections ||
              collectionsError /* Колекції приїхали, але цього slug у них немає (або запит упав) —
                 сцену не малюємо взагалі. Раніше тут вічно крутився скелетон. */ ? null : (
              <div className={styles.stageSkeleton} aria-busy="true" aria-label="Завантаження колекції" />
            )}
            {/* Опис колекції — внизу картки, під сценою */}
            {collection?.description && (
              <p className={styles.collectionDescription}>
                <RichDescription text={collection.description} />
              </p>
            )}
          </div>
        </div>

        {/* Опис і відгуки прибрані з клієнтської сторінки (рішення власника) */}

        <div className={styles.fullWidth}>
          <OtherCollections collections={collections} currentKey={collection?.key} />
        </div>
      </div>
    </Page>
  );
}
