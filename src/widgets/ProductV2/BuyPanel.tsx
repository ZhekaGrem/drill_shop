// src/widgets/ProductV2/BuyPanel.tsx
// Блок покупки повної сторінки товару v2: бейдж, наявність, ціна з акцією,
// розміри з власним залишком, кількість, «У кошик» + «Купити зараз».
// Потік кошика 1:1 зі сторінкою /catalog/[slug] (addItem + variant + снапшот).
'use client';

import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/components/Button/Button';
import { IconCart3 } from '@/shared/components/Svg';
import { FavoriteButton } from '@/features/favorites/components/FavoriteButton/FavoriteButton';
import { useCart } from '@/features/cart/hooks/useCart';
import { sortVariantsBySize } from '@/shared/utils/size-sort';
import { formatPrice } from '@/shared/utils/format';
import { calculatePromoPrice, calculateVariantPromoPrice } from '@/shared/utils/promo-calculator';
import type { Product, ProductVariant } from '@/shared/types';
import { buildCartSnapshot } from './cart-snapshot';
import styles from './ProductV2.module.scss';

// Поріг «закінчується» — той самий, що на сторінці товару
const LOW_STOCK = 5;
const stockOf = (v: { quantity?: number; reservedQuantity?: number }) =>
  (v.quantity || 0) - (v.reservedQuantity || 0);

export const BuyPanel = ({ product }: { product: Product }) => {
  const router = useRouter();
  const { addItem, isAddingItem } = useCart();
  const [variantId, setVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const variants = useMemo(() => sortVariantsBySize(product.variants ?? []), [product.variants]);
  const variant: ProductVariant | undefined = variants.find((v) => v.id === variantId) ?? variants[0];

  const promo = variant ? calculateVariantPromoPrice(variant) : calculatePromoPrice(product);
  const available = stockOf(variant ?? product);
  // Архівна колекція: вітрина без продажу — контролі покупки не рендеряться
  const archived = Boolean(product.collection?.archivedAt);
  const inStock = available > 0;
  const stockLabel = archived
    ? 'Продаж завершено'
    : !inStock
      ? 'Немає в наявності'
      : available <= LOW_STOCK
        ? `Залишилось ${available} шт`
        : 'В наявності';

  const handleAdd = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    addItem(product.id, quantity, variant?.id, buildCartSnapshot(product, variant));
  };

  return (
    <div className={styles.buyPanel}>
      {(product.badgeText || product.labelText) && (
        <div className={styles.badgesRow}>
          {product.badgeText && (
            <span className={styles.badgeDot}>
              <span
                className={styles.pulseDot}
                style={{ '--badge-color': product.badgeColor ?? '#1c8a37' } as CSSProperties}
                aria-hidden="true"
              />
              {product.badgeText}
            </span>
          )}
          {product.labelText && (
            <span className={styles.capsule} style={{ background: product.labelColor ?? '#3b6ff5' }}>
              {product.labelText}
            </span>
          )}
        </div>
      )}

      <h1 className={styles.productName}>{product.name}</h1>

      <div className={styles.meta}>
        <span>Артикул: {product.sku}</span>
        <span className={!archived && inStock ? styles.inStock : styles.outOfStock}>{stockLabel}</span>
      </div>

      {product.shortDescription && <p className={styles.shortDescription}>{product.shortDescription}</p>}

      <div className={styles.priceRow}>
        {promo.hasDiscount && <span className={styles.oldPrice}>{formatPrice(promo.originalPrice)}</span>}
        <span className={`${styles.price} ${promo.hasDiscount ? styles.priceDiscount : ''}`}>
          {formatPrice(promo.finalPrice)}
        </span>
      </div>

      {archived && (
        <p className={styles.archivedNote}>
          Архівна колекція «{product.collection?.title}» — лишається на вітрині, але купити її вже не можна.
        </p>
      )}

      {!archived && variants.length > 0 && (
        <div className={styles.sizesBlock}>
          <span className={styles.blockLabel}>Розмір</span>
          <div className={styles.sizes} role="group" aria-label="Розмір">
            {variants.map((v) => (
              <button
                key={v.id}
                type="button"
                className={styles.size}
                aria-pressed={variant?.id === v.id}
                disabled={stockOf(v) <= 0}
                onClick={() => {
                  setVariantId(v.id);
                  setQuantity(1);
                }}>
                {String(v.options?.size ?? v.name ?? v.sku)}
              </button>
            ))}
          </div>
        </div>
      )}

      {!archived && inStock && (
        <div className={styles.quantityRow}>
          <span className={styles.blockLabel}>Кількість</span>
          <div className={styles.stepper}>
            <button type="button" aria-label="Менше" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
              −
            </button>
            <span>{quantity}</span>
            <button
              type="button"
              aria-label="Більше"
              disabled={quantity >= available}
              onClick={() => setQuantity((q) => Math.min(available, q + 1))}>
              +
            </button>
          </div>
        </div>
      )}

      <div className={styles.actions}>
        {!archived && (
          <Button
            size="lg"
            variant="primary"
            fullWidth
            disabled={!inStock || isAddingItem}
            onClick={handleAdd}>
            <IconCart3 size={20} /> {added ? 'Додано в кошик ✓' : 'Додати в кошик'}
          </Button>
        )}
        <div className={styles.actionsRow}>
          {!archived && (
            <Button
              size="lg"
              variant="secondary"
              fullWidth
              disabled={!inStock || isAddingItem}
              onClick={() => {
                addItem(product.id, quantity, variant?.id, buildCartSnapshot(product, variant));
                router.push('/checkout');
              }}>
              Купити зараз
            </Button>
          )}
          <FavoriteButton product={product} size="lg" />
        </div>
      </div>
    </div>
  );
};
