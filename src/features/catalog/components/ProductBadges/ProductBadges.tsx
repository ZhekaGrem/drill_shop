// src/features/catalog/components/ProductBadges/ProductBadges.tsx
import React from 'react';
import { Product, ProductVariant } from '@/shared/types';
import { Badge } from '@/shared/components/Badge/Badge';
import {
  isPromoActive,
  getPromoBadgeText,
  isVariantPromoActive,
  getVariantPromoBadgeText,
} from '@/shared/utils/promo-calculator';
import styles from './ProductBadges.module.scss';

interface ProductBadgesProps {
  product: Product;
  className?: string;
  selectedVariant?: ProductVariant | null;
}

export const ProductBadges: React.FC<ProductBadgesProps> = ({ product, className = '', selectedVariant }) => {
  const badges = [];

  // ✅ Якщо є варіанти - НЕ показуємо плашку "Немає в наявності"
  // Користувач має обрати варіант на сторінці деталей
  const isInStock = product.hasVariants ? true : (product.isInStock ?? false);

  // ✅ Немає в наявності - показуємо ТІЛЬКИ якщо немає ні товару ні варіантів
  if (!isInStock) {
    badges.push({
      type: 'outOfStock' as const,
      text: 'Немає в наявності',
      key: 'outOfStock',
    });
    // Якщо немає в наявності - не показуємо інші бейджі
    return (
      <div className={`${styles.container} ${className}`}>
        <Badge type="outOfStock" text="Немає в наявності" />
      </div>
    );
  }

  // Промо акція - перевіряємо спочатку варіант, потім головний товар
  if (selectedVariant) {
    const hasVariantPromo = isVariantPromoActive(selectedVariant);
    const variantBadgeText = getVariantPromoBadgeText(selectedVariant);
    if (hasVariantPromo && variantBadgeText) {
      badges.push({
        type: 'promo' as const,
        text: variantBadgeText,
        key: 'promo',
      });
    }
  } else {
    const hasPromo = isPromoActive(product);
    const badgeText = getPromoBadgeText(product);
    if (hasPromo && badgeText) {
      badges.push({
        type: 'promo' as const,
        text: badgeText,
        key: 'promo',
      });
    }
  }

  // Популярний товар
  if (product.isFeatured) {
    badges.push({
      type: 'featured' as const,
      text: 'ХІТ',
      key: 'featured',
    });
  }

  // Знижка з comparePrice
  if (product.comparePrice && product.comparePrice > product.price) {
    const discountPercent = Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100);
    badges.push({
      type: 'discount' as const,
      text: `-${discountPercent}%`,
      key: 'discount',
    });
  }

  if (badges.length === 0) return null;

  return (
    <div className={`${styles.container} ${className}`}>
      {badges.map((badge) => (
        <Badge key={badge.key} type={badge.type} text={badge.text} />
      ))}
    </div>
  );
};
