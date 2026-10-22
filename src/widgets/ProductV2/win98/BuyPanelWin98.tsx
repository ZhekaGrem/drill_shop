// src/widgets/ProductV2/win98/BuyPanelWin98.tsx
// Стан покупки для вікна товару в дизайні Windows 98 (CollectionProductWin98.tsx): ціна, розміри й «Додати в кошик»
// в одному вікні. Дизайни до Windows користуються незмінним ../BuyPanel.tsx.
'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { CSSProperties } from 'react';
import { Button } from '@/shared/components/Button/Button';
import { IconCart3 } from '@/shared/components/Svg';
import { useCart } from '@/features/cart/hooks/useCart';
import { useDesign } from '@/shared/hooks/useDesign';
import { sortVariantsBySize } from '@/shared/utils/size-sort';
import { formatPrice } from '@/shared/utils/format';
import { calculatePromoPrice, calculateVariantPromoPrice } from '@/shared/utils/promo-calculator';
import type { Product, ProductVariant } from '@/shared/types';
import { buildCartSnapshot } from '../cart-snapshot';
import { capsuleStyle } from '../collections';
import styles from './ProductV2Win98.module.scss';

const LOW_STOCK = 5;
const stockOf = (v: { quantity?: number; reservedQuantity?: number }) =>
  (v.quantity || 0) - (v.reservedQuantity || 0);
const optionValue = (variant: ProductVariant, key: 'size' | 'color') => {
  const entry = Object.entries(variant.options ?? {}).find(([name]) => name.toLowerCase() === key);
  return entry?.[1] == null ? '' : String(entry[1]).trim();
};
interface PurchaseState {
  product: Product;
  variants: ProductVariant[];
  variant?: ProductVariant;
  sizes: string[];
  colors: string[];
  archived: boolean;
  inStock: boolean;
  stockLabel: string;
  promo: ReturnType<typeof calculatePromoPrice>;
  added: boolean;
  isAddingItem: boolean;
  add: () => Promise<void>;
  select: (dimension: 'size' | 'color', value: string) => void;
  selectVariant: (id: string) => void;
  selected: (dimension: 'size' | 'color', value: string) => boolean;
  available: (dimension: 'size' | 'color', value: string) => boolean;
}

const PurchaseContext = createContext<PurchaseState | null>(null);

export function BuyPanel({ product, children }: { product: Product | null; children: ReactNode }) {
  if (!product) return children;
  return <PurchaseProvider product={product}>{children}</PurchaseProvider>;
}

function PurchaseProvider({ product, children }: { product: Product; children: ReactNode }) {
  const { addItem, isAddingItem } = useCart();
  const [variantId, setVariantId] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const variants = useMemo(() => sortVariantsBySize(product.variants ?? []), [product.variants]);
  const sizes = useMemo(
    () => [...new Set(variants.map((variant) => optionValue(variant, 'size')).filter(Boolean))],
    [variants]
  );
  const colors = useMemo(
    () => [...new Set(variants.map((variant) => optionValue(variant, 'color')).filter(Boolean))],
    [variants]
  );
  const variant =
    variants.find((entry) => entry.id === variantId) ??
    variants.find((entry) => stockOf(entry) > 0) ??
    variants[0];
  const archived = Boolean(product.collection?.archivedAt);
  const inStock = stockOf(variant ?? product) > 0;
  const availableQuantity = stockOf(variant ?? product);
  const stockLabel = archived
    ? 'Продаж завершено'
    : !inStock
      ? 'Немає в наявності'
      : availableQuantity <= LOW_STOCK
        ? `Залишилось ${availableQuantity} шт`
        : 'Виготовлення і доставка — до 7 днів';
  const promo = variant ? calculateVariantPromoPrice(variant) : calculatePromoPrice(product);

  const available = (dimension: 'size' | 'color', value: string) =>
    variants.some((entry) => optionValue(entry, dimension) === value && stockOf(entry) > 0);
  const selected = (dimension: 'size' | 'color', value: string) =>
    Boolean(variant && stockOf(variant) > 0 && optionValue(variant, dimension) === value);
  const select = (dimension: 'size' | 'color', value: string) => {
    const matches = variants.filter((entry) => optionValue(entry, dimension) === value);
    const other = dimension === 'size' ? 'color' : 'size';
    const next =
      matches.find(
        (entry) =>
          optionValue(entry, other) === optionValue(variant ?? variants[0], other) && stockOf(entry) > 0
      ) ?? matches.find((entry) => stockOf(entry) > 0);
    if (next) setVariantId(next.id);
  };
  const selectVariant = (id: string) => {
    const next = variants.find((entry) => entry.id === id);
    if (next && stockOf(next) > 0) setVariantId(next.id);
  };

  const add = async () => {
    try {
      await addItem(product.id, 1, variant?.id, buildCartSnapshot(product, variant));
      setAdded(true);
      window.setTimeout(() => setAdded(false), 2000);
    } catch {
      // useCart displays an error notification.
    }
  };

  return (
    <PurchaseContext.Provider
      value={{
        product,
        variants,
        variant,
        sizes,
        colors,
        archived,
        inStock,
        stockLabel,
        promo,
        added: added && !isAddingItem,
        isAddingItem,
        add,
        select,
        selectVariant,
        selected,
        available,
      }}>
      {children}
    </PurchaseContext.Provider>
  );
}

const usePurchase = () => {
  const value = useContext(PurchaseContext);
  if (!value) throw new Error('Product purchase components must be inside BuyPanel.');
  return value;
};

/**
 * Назва, ціна, вибір розміру/кольору/варіанта і «Додати в кошик» — на кнопці вікно товару закінчується, а розмірна
 * сітка й доставка — у сусідньому вікні «Інформація».
 */
export function BuySummary() {
  const { product, archived, inStock, stockLabel, promo, added, add, isAddingItem } = usePurchase();
  const design = useDesign();
  const actionDisabled = archived || !inStock || isAddingItem;

  return (
    <div className={styles.productSummary}>
      {(product.badgeText || product.labelText) && (
        <div className={styles.badgesRow}>
          {product.badgeText && (
            <span className={styles.badgeDot}>
              <span
                className={styles.pulseDot}
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
      <p className={`${styles.stockLabel} ${!archived && inStock ? styles.inStock : styles.outOfStock}`}>
        {stockLabel}
      </p>
      <div className={styles.priceRow}>
        {promo.hasDiscount && <span className={styles.oldPrice}>{formatPrice(promo.originalPrice)}</span>}
        <span className={`${styles.price} ${promo.hasDiscount ? styles.priceDiscount : ''}`}>
          {formatPrice(promo.finalPrice)}
        </span>
      </div>
      {product.shortDescription && <p className={styles.shortDescription}>{product.shortDescription}</p>}
      {archived && (
        <p className={styles.archivedNote}>
          Архівна колекція «{product.collection?.title}» — лишається на вітрині, але купити її вже не можна.
        </p>
      )}
      <BuyChoices />
      {!archived && (
        <Button size="lg" variant="primary" fullWidth disabled={actionDisabled} onClick={add}>
          <IconCart3 size={20} />
          {added ? 'Додано в кошик ✓' : !inStock ? 'Немає в наявності' : 'Додати в кошик'}
        </Button>
      )}
    </div>
  );
}

function ChoiceGroup({
  dimension,
  values,
  title,
}: {
  dimension: 'size' | 'color';
  values: string[];
  title: string;
}) {
  const { select, selected, available } = usePurchase();
  if (!values.length) return null;

  const hasUnavailable = values.some((value) => !available(dimension, value));
  return (
    <fieldset className={styles.choiceGroup}>
      <legend className={styles.blockLabel}>{title}</legend>
      <div className={styles.optionChoices}>
        {values.map((value) => {
          const isAvailable = available(dimension, value);
          return (
            <button
              key={value}
              type="button"
              className={styles.optionChoice}
              data-win98-choice=""
              aria-pressed={selected(dimension, value)}
              aria-label={`${title}: ${value}${isAvailable ? '' : ' — немає в наявності'}`}
              title={isAvailable ? value : 'Немає в наявності'}
              disabled={!isAvailable}
              onClick={() => select(dimension, value)}>
              {value}
            </button>
          );
        })}
      </div>
      {hasUnavailable && (
        <span className={styles.optionHint}>Недоступні зараз варіанти позначені й вимкнені.</span>
      )}
    </fieldset>
  );
}

/** Розмір, колір або довільний варіант товару — те, що треба вибрати перед покупкою */
export function BuyChoices() {
  const { variants, sizes, colors, variant, selectVariant } = usePurchase();
  const hasSizeOrColor = sizes.length > 0 || colors.length > 0;
  const genericVariants = !hasSizeOrColor && variants.length > 0;

  return (
    <>
      {sizes.length > 0 ? <ChoiceGroup dimension="size" values={sizes} title="Розмір" /> : null}
      {colors.length > 0 ? <ChoiceGroup dimension="color" values={colors} title="Колір" /> : null}
      {genericVariants && (
        <fieldset className={styles.choiceGroup}>
          <legend className={styles.blockLabel}>Варіант</legend>
          <div className={styles.optionChoices}>
            {variants.map((entry) => {
              const isAvailable = entry.quantity - entry.reservedQuantity > 0;
              const label = entry.name || entry.sku;
              return (
                <button
                  key={entry.id}
                  type="button"
                  className={styles.optionChoice}
                  data-win98-choice=""
                  aria-pressed={variant?.id === entry.id && isAvailable}
                  aria-label={`${label}${isAvailable ? '' : ' — немає в наявності'}`}
                  title={isAvailable ? label : 'Немає в наявності'}
                  disabled={!isAvailable}
                  onClick={() => isAvailable && selectVariant(entry.id)}>
                  {label}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}
      {variants.length === 0 && (
        <p className={styles.noVariantHint}>Цей товар продається без вибору варіантів.</p>
      )}
    </>
  );
}
