// src/app/catalog/[slug]/win98/BuyBoxWin98.tsx
// Права половина вікна товару в Windows 98: назва, ціна, розмір, кількість і «Додати в кошик».
// Розмір — піднята кнопка; вибраний — втиснутий на шаховому тлі й жирний, як натиснута кнопка панелі інструментів
// (docs/windows-95-98-encyclopedia.md §7), а НЕ чорна заливка: у спільних стилях обраний чип брав --text-primary
// тлом і --btn-primary-fg текстом, а в Windows 98 обидва чорні — літеру розміру не було видно.
'use client';

import { useState, type RefObject } from 'react';
import { IconMinus, IconPlus } from '@tabler/icons-react';
import clsx from 'clsx';
import type { ProductVariant } from '@/shared/types';
import { Button } from '@/shared/components/Button/Button';
import { IconCart3 } from '@/shared/components/Svg';
import { Win98Icon } from '@/shared/components/Windows98/Win98Icons';
import { formatNumber } from '@/shared/utils/format';
import styles from './productDetailsWin98.module.scss';

export interface BuyBoxWin98Props {
  name: string;
  price: number;
  /** Ціна до знижки — лише коли діє акція */
  originalPrice?: number;
  variants: ProductVariant[];
  selectedVariantId?: string;
  onSelectVariant: (variant: ProductVariant) => void;
  getVariantLabel: (variant: ProductVariant) => string;
  getVariantStock: (variant: ProductVariant) => number;
  variantsRef: RefObject<HTMLDivElement | null>;
  variantError: string | null;
  isInStock: boolean;
  /** Скільки штук обраного варіанта можна покласти в кошик */
  maxQuantity: number;
  archivedNotice?: string;
  addLabel: string;
  onAdd: (quantity: number) => void;
  onNotify: () => void;
  onOpenSizeGuide?: () => void;
}

// «1 000 ₴» — так само, як ціна у вікнах-картках каталогу (спільний formatPrice дає «1 000 грн»)
const formatPrice = (price: number) => `${formatNumber(Math.round(price))} ₴`;

export function BuyBoxWin98(props: BuyBoxWin98Props) {
  const { name, price, originalPrice, variants, isInStock, archivedNotice } = props;

  return (
    <div className={styles.buy}>
      <h1 className={styles.title}>{name}</h1>

      <p className={styles.price}>
        {originalPrice !== undefined && <s className={styles.oldPrice}>{formatPrice(originalPrice)}</s>}
        <span className={clsx(styles.currentPrice, originalPrice !== undefined && styles.promoPrice)}>
          {formatPrice(price)}
        </span>
      </p>

      <hr className={styles.etched} />

      {!archivedNotice && variants.length > 0 && <SizeChoice {...props} />}

      {archivedNotice ? (
        <p className={styles.notice}>{archivedNotice}</p>
      ) : isInStock ? (
        <AddToCart {...props} />
      ) : (
        <Button variant="primary" size="lg" fullWidth className={styles.addButton} onClick={props.onNotify}>
          Сповістити мене про появу товару
        </Button>
      )}
    </div>
  );
}

function SizeChoice({
  variants,
  selectedVariantId,
  onSelectVariant,
  getVariantLabel,
  getVariantStock,
  variantsRef,
  variantError,
  onOpenSizeGuide,
}: BuyBoxWin98Props) {
  // «Розмір», якщо варіанти розрізняються розміром; інакше — загальне «Варіант»
  const bySize = variants.some((v) => Object.keys(v.options || {}).some((k) => k.toLowerCase() === 'size'));
  const label = bySize ? 'Розмір' : 'Варіант';

  return (
    <div className={styles.choiceBlock} ref={variantsRef}>
      <div className={styles.choiceHead}>
        <span className={styles.label} id="win98-size-label">
          {label}:
        </span>
        {onOpenSizeGuide && (
          <button type="button" className={styles.guideButton} onClick={onOpenSizeGuide}>
            <Win98Icon name="ruler" />
            Розмірна сітка
          </button>
        )}
      </div>
      <div className={styles.choices} role="group" aria-labelledby="win98-size-label">
        {variants.map((variant) => {
          const soldOut = getVariantStock(variant) <= 0;
          return (
            <button
              key={variant.id}
              type="button"
              className={styles.choice}
              aria-pressed={variant.id === selectedVariantId}
              disabled={soldOut}
              title={soldOut ? 'Немає в наявності' : undefined}
              onClick={() => onSelectVariant(variant)}>
              {getVariantLabel(variant)}
            </button>
          );
        })}
      </div>
      {variantError && (
        <p className={styles.error} role="alert">
          {variantError}
        </p>
      )}
    </div>
  );
}

function AddToCart({ maxQuantity, addLabel, onAdd }: BuyBoxWin98Props) {
  const [wanted, setWanted] = useState(1);
  // Інший розмір може мати менший залишок — кількість притискається до нього, а не скидається
  const max = Math.max(1, maxQuantity);
  const quantity = Math.min(wanted, max);

  return (
    <>
      <div className={styles.quantityRow}>
        <span className={styles.label} id="win98-qty-label">
          Кількість:
        </span>
        <div className={styles.stepper} role="group" aria-labelledby="win98-qty-label">
          <button
            type="button"
            className={styles.step}
            aria-label="Менше"
            disabled={quantity <= 1}
            onClick={() => setWanted((w) => Math.max(1, Math.min(w, max) - 1))}>
            <IconMinus size={18} stroke={2.5} />
          </button>
          <output className={styles.quantity} aria-live="polite">
            {quantity} шт
          </output>
          <button
            type="button"
            className={styles.step}
            aria-label="Більше"
            disabled={quantity >= max}
            onClick={() => setWanted((w) => Math.min(max, Math.min(w, max) + 1))}>
            <IconPlus size={18} stroke={2.5} />
          </button>
        </div>
      </div>
      <Button
        variant="primary"
        size="lg"
        fullWidth
        className={styles.addButton}
        onClick={() => onAdd(quantity)}>
        <IconCart3 /> {addLabel}
      </Button>
    </>
  );
}
