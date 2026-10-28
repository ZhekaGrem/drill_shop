// src/app/catalog/[slug]/win98/ProductDetailsWin98.tsx
// Сторінка товару в дизайні Windows 98 — два окремі вікна замість сірих панелей одна в одній:
//   1) вікно товару: смуга-крихти, фото на білому «екрані», назва, ціна, розмір, кількість, «Додати в кошик»,
//      знизу рядок стану (наявність);
//   2) «Доставка, оплата й повернення»: Нова Пошта, картка, накладений платіж, повернення/обмін.
// Нижче — вікно «Схожі товари»: від 1024 px три вікна-картки в ряд, вужче — стрічка з прокруткою, де кожна картка
// має сталу ширину, тож вікна не стискаються в дві кривенькі колонки, як раніше.
// Дубль розміру («Розмір: M» у списку характеристик) тут не показується — розмір видно на кнопках.
// Решта дизайнів — ProductDetailsClient без змін; стан і обробники теж там, сюди лише передаються.
'use client';

import { ViewTransition, type ReactNode } from 'react';
import clsx from 'clsx';
import type { Product, ProductImage, ProductWithRelations } from '@/shared/types';
import { Breadcrumbs } from '@/shared/components/Breadcrumbs';
import { ListGroup, ListRow } from '@/shared/components/ListGroup/ListGroup';
import { CloudinaryImage } from '@/shared/components/CloudinaryImage/CloudinaryImage';
import { Windows98WindowBar } from '@/shared/components/Windows98/Windows98';
import { Win98Window } from '@/shared/components/Windows98/Win98Window';
import {
  Win98CategoryIcon,
  Win98FolderIcon,
  Win98Icon,
  type Win98IconName,
} from '@/shared/components/Windows98/Win98Icons';
import win98Window from '@/shared/components/Windows98/win98-window.module.scss';
import { ProductCard } from '@/features/catalog/components/ProductCard/ProductCard';
import { ProductBadges } from '@/features/catalog/components/ProductBadges/ProductBadges';
import { content } from '@/shared/config/content';
import { getImageUrl } from '@/shared/utils/image';
import { BuyBoxWin98, type BuyBoxWin98Props } from './BuyBoxWin98';
import styles from './productDetailsWin98.module.scss';

const SERVICE_ICONS: Record<string, Win98IconName> = {
  delivery: 'truck',
  card: 'card',
  cod: 'box',
  returns: 'calendar',
};
// Слаги категорій, для яких є піксельна іконка; решта — тека
const ICON_CATEGORIES = new Set(['t-shirt', 't-shirts', 'buba', 'hoodies']);

interface ProductDetailsWin98Props {
  product: ProductWithRelations;
  basePath: string;
  images: ProductImage[];
  selectedImageIndex: number;
  onSelectImage: (index: number) => void;
  onOpenGallery: () => void;
  selectedVariant: BuyBoxWin98Props['variants'][number] | null;
  stockLabel: string;
  buy: BuyBoxWin98Props;
  relatedProducts: Product[];
  /** Модалки (розмірна сітка, сповіщення, галерея) — ті самі, що в інших дизайнах */
  children?: ReactNode;
}

export function ProductDetailsWin98(props: ProductDetailsWin98Props) {
  const { product, basePath, buy, stockLabel, relatedProducts, children } = props;
  const iconSlug = product.categories?.find((c) => ICON_CATEGORIES.has(c.slug))?.slug;

  return (
    <div className={styles.desk}>
      <section className={clsx(win98Window.window, styles.window)} data-store-window="">
        <Windows98WindowBar icon={iconSlug ? <Win98CategoryIcon slug={iconSlug} /> : <Win98FolderIcon />}>
          <Breadcrumbs
            items={[
              { label: 'Головна', href: `${basePath}/` },
              { label: 'Каталог', href: `${basePath}/catalog` },
              { label: product.name },
            ]}
          />
        </Windows98WindowBar>
        <div className={styles.productBody}>
          <Gallery {...props} />
          <BuyBoxWin98 {...buy} />
        </div>
        <p className={clsx(win98Window.status, !buy.isInStock && styles.statusOut)}>{stockLabel}</p>
      </section>

      <Win98Window
        title="Доставка, оплата й повернення"
        icon={<Win98Icon name="truck" />}
        className={styles.window}>
        <ListGroup>
          {content.services.map((service) => (
            <ListRow
              key={service.id}
              href={`${basePath}${service.href}`}
              media={<Win98Icon name={SERVICE_ICONS[service.id] ?? 'info'} />}
              title={service.title}
              hint={service.hint}
            />
          ))}
        </ListGroup>
      </Win98Window>

      {relatedProducts.length > 0 && (
        <Win98Window
          title="Схожі товари"
          icon={<Win98FolderIcon />}
          action={{ href: `${basePath}/catalog`, label: 'Весь каталог' }}
          className={styles.window}>
          <div className={styles.related} data-win98-grid="">
            {relatedProducts.slice(0, 4).map((related, index) => (
              <div key={related.id} className={clsx(styles.relatedItem, index === 3 && styles.narrowOnly)}>
                <ProductCard product={related} basePath={basePath} />
              </div>
            ))}
          </div>
        </Win98Window>
      )}

      {children}
    </div>
  );
}

function Gallery({
  product,
  images,
  selectedImageIndex,
  onSelectImage,
  onOpenGallery,
  selectedVariant,
}: ProductDetailsWin98Props) {
  const current = images[selectedImageIndex] ?? images[0];

  return (
    <div className={styles.gallery}>
      <div
        className={styles.screen}
        role="button"
        tabIndex={0}
        aria-label="Відкрити фото на весь екран"
        onClick={onOpenGallery}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpenGallery();
          }
        }}>
        {/* Пара до фото в ProductCard (однаковий name) — фото картки перетікає сюди з каталогу */}
        <ViewTransition name={`product-${product.id}`} share="morph" default="none">
          <CloudinaryImage
            src={getImageUrl(current?.url || current?.publicId)}
            alt={product.name}
            className={styles.photo}
            width={880}
            height={880}
            priority
          />
        </ViewTransition>
        <ProductBadges product={product} selectedVariant={selectedVariant} className={styles.badges} />
      </div>

      {images.length > 1 && (
        <div className={styles.thumbs} role="group" aria-label="Фото товару">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              className={styles.thumb}
              aria-label={`Показати зображення ${index + 1}`}
              aria-pressed={index === selectedImageIndex}
              onClick={() => onSelectImage(index)}>
              <CloudinaryImage
                src={getImageUrl(image.url || image.publicId)}
                alt={image.altText || product.name}
                width={56}
                height={56}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
