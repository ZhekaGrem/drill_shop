// src/widgets/ProductV2/BuyPanel.tsx
// Блок покупки повної сторінки товару v2: бейдж, наявність, ціна з акцією,
// розміри з власним залишком, кількість, «У кошик» + «Купити зараз».
// Потік кошика 1:1 зі сторінкою /catalog/[slug] (addItem + variant + снапшот).
'use client';

import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { Button } from '@/shared/components/Button/Button';
import { StickyBuyBar } from '@/shared/components/StickyBuyBar';
import { IconCart3 } from '@/shared/components/Svg';
import { useCart } from '@/features/cart/hooks/useCart';
import { useDesign } from '@/shared/hooks/useDesign';
import { useActionOffscreen } from '@/shared/hooks/useActionOffscreen';
import { sortVariantsBySize } from '@/shared/utils/size-sort';
import { formatPrice } from '@/shared/utils/format';
import { calculatePromoPrice, calculateVariantPromoPrice } from '@/shared/utils/promo-calculator';
import type { Product, ProductVariant } from '@/shared/types';
import { buildCartSnapshot } from './cart-snapshot';
import { capsuleStyle } from './collections';
import styles from './ProductV2.module.scss';

// Поріг «закінчується» — той самий, що на сторінці товару
const LOW_STOCK = 5;
const stockOf = (v: { quantity?: number; reservedQuantity?: number }) =>
  (v.quantity || 0) - (v.reservedQuantity || 0);
const sizeLabel = (v: ProductVariant) => String(v.options?.size ?? v.name ?? v.sku);

export const BuyPanel = ({ product }: { product: Product }) => {
  const { addItem, isAddingItem } = useCart();
  const design = useDesign();
  const [variantId, setVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  // Головна дія лежить на 292px нижче згину телефона — кнопка є, її не видно.
  // Липка панель нижче показує ту саму дію, поки інлайн-кнопка поза кадром.
  const [actionRef, actionOffscreen] = useActionOffscreen<HTMLButtonElement>();

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
        : 'Виготовлення і доставка — до 7 днів';

  // setAdded ПІСЛЯ успіху, а не до виклику. Раніше кнопка казала «Додано в
  // кошик ✓» навіть тоді, коли запит падав, — людина йшла в кошик по товар,
  // якого там не було.
  const handleAdd = async () => {
    try {
      await addItem(product.id, quantity, variant?.id, buildCartSnapshot(product, variant));
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch {
      // Повідомлення про помилку показує сам useCart (тост);
      // тут головне — не малювати успіх там, де його не було.
    }
  };

  // Одна дія — один опис її стану. Липка панель показує ту саму кнопку, тож
  // підпис і блокування живуть тут, а не двічі в розмітці.
  const actionLabel = added ? 'Додано в кошик ✓' : 'Додати в кошик';
  const actionDisabled = !inStock || isAddingItem;

  return (
    <div className={styles.buyPanel}>
      {(product.badgeText || product.labelText) && (
        <div className={styles.badgesRow}>
          {product.badgeText && (
            <span className={styles.badgeDot}>
              <span
                className={styles.pulseDot}
                // Токен замість хардкод-хексу — того вимагає проєктне правило
                // «жодного hex у компоненті», а не контраст: крапка aria-hidden
                // і дублює сусідній текст словами, тож поріг тут WCAG 1.4.11
                // (нетекстовий контраст, 3:1), а не 1.4.3 для тексту. #1c8a37
                // і так проходить 3:1 (4.43:1 удень / 3.60:1 уночі) —
                // --success-green лишає той самий запас, тільки живе в
                // globals.css, а не хардкодом у компоненті.
                style={{ '--badge-color': product.badgeColor ?? 'var(--success-green)' } as CSSProperties}
                aria-hidden="true"
              />
              {product.badgeText}
            </span>
          )}
          {product.labelText && (
            <span
              className={`${styles.capsule} designCapsule`}
              style={capsuleStyle(product.labelColor ?? null, design)}>
              {product.labelText}
            </span>
          )}
        </div>
      )}

      <h1 className={styles.productName}>{product.name}</h1>

      {/* Артикул клієнтам не показуємо — він лишається в адмінці й замовленнях */}
      <div className={styles.meta}>
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
                {sizeLabel(v)}
              </button>
            ))}
          </div>
        </div>
      )}

      {!archived && inStock && (
        <div className={styles.quantityRow}>
          <span className={styles.blockLabel}>Кількість</span>
          <div className={styles.stepper}>
            <button
              type="button"
              aria-label="Зменшити кількість"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
              −
            </button>
            <span>{quantity}</span>
            <button
              type="button"
              aria-label="Збільшити кількість"
              disabled={quantity >= available}
              onClick={() => setQuantity((q) => Math.min(available, q + 1))}>
              +
            </button>
          </div>
        </div>
      )}

      {/* «Купити зараз» і сердечко-обране прибрані (рішення власника) —
          дія одна: «Додати в кошик» */}
      <div className={styles.actions}>
        {!archived && (
          <Button
            ref={actionRef}
            size="lg"
            variant="primary"
            fullWidth
            disabled={actionDisabled}
            onClick={handleAdd}>
            <IconCart3 size={20} /> {actionLabel}
          </Button>
        )}
      </div>

      {/* Липка панель дії (≤1023px). Ціна тут обовʼязкова: вона теж за згином,
          а рішення про покупку без ціни не приймається. На ≥1024px панелі
          немає — там її роль виконує липка права колонка сторінки. */}
      <StickyBuyBar
        visible={!archived && actionOffscreen}
        price={promo.finalPrice}
        oldPrice={promo.hasDiscount ? promo.originalPrice : null}
        sizeLabel={variant && variants.length > 0 ? sizeLabel(variant) : null}
        disabled={actionDisabled}
        added={added}
        onAdd={handleAdd}
      />
    </div>
  );
};
