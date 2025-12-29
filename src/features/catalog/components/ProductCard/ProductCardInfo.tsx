// src/features/catalog/components/ProductCard/ProductCardInfo.tsx
import React from 'react';
import Link from 'next/link';
import { Product } from '@/shared/types';
import { calculatePromoPrice, calculateVariantPromoPrice } from '@/shared/utils/promo-calculator';
import { Group, Divider } from '@mantine/core';
import styles from './ProductCard.module.scss';

interface ProductCardInfoProps {
  product: Product;
  isImageHovered: boolean;
  selectedVariant: string | null;
  selectedVariantObject: any;
  sortedVariants: any[];
  showVariantsInCatalog: boolean;
  getVariantDisplayValue: (variant: any) => string;
  getVariantStock: (variantId: string) => number;
  onVariantSelect: (variantId: string) => void;
}

/**
 * Компонент інформації ProductCard
 * Відображає назву, ціну та варіанти товару
 */
export const ProductCardInfo: React.FC<ProductCardInfoProps> = ({
  product,
  isImageHovered,
  selectedVariant,
  selectedVariantObject,
  sortedVariants,
  showVariantsInCatalog,
  getVariantDisplayValue,
  getVariantStock,
  onVariantSelect,
}) => {
  const priceData = calculatePromoPrice(product);

  const renderPrice = () => {
    // Якщо обрано варіант - показуємо його ціну з акцією (якщо є)
    if (selectedVariantObject) {
      const variantPriceData = calculateVariantPromoPrice(selectedVariantObject);

      if (variantPriceData.hasDiscount) {
        return (
          <div className={styles.hasDiscount}>
            <span className={styles.originalPrice}>{variantPriceData.originalPrice}₴</span>
            <span className={styles.finalPrice}>{Math.round(variantPriceData.finalPrice)}₴</span>
          </div>
        );
      }

      return <span className={styles.price}>{selectedVariantObject.price}₴</span>;
    }

    // Якщо не обрано варіант - показуємо ціну головного товару з промо
    if (priceData.hasDiscount) {
      return (
        <div className={styles.hasDiscount}>
          <span className={styles.originalPrice}>{priceData.originalPrice}₴</span>
          <span className={styles.finalPrice}>{Math.round(priceData.finalPrice)}₴</span>
        </div>
      );
    }
    return <span className={styles.price}>{product.price}₴</span>;
  };

  return (
    <div className={styles.content}>
      <Link href={`/catalog/${product.slug}`} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>
          {isImageHovered && product.shortDescription ? product.shortDescription : product.name}
        </h3>
      </Link>
      <Divider className={styles.divider} />

      <Group justify="space-between" className={styles.contentPriceVariants}>
        <div className={styles.priceSection}>{renderPrice()}</div>
        {/* Показувати варіанти ТІЛЬКИ якщо SIZE/COLOR */}
        {showVariantsInCatalog && product.variants && product.variants.length > 0 && (
          <div className={styles.variants} onClick={(e) => e.stopPropagation()}>
            <div className={styles.variants__options}>
              {/* Додаємо головний товар якщо він має size/color */}
              {!product.hasVariants &&
                product.options &&
                Object.keys(product.options).some((k) => {
                  const key = k.toLowerCase();
                  return key === 'size' || key === 'color';
                }) &&
                (() => {
                  const mainStock = product.availableQuantity || 0;
                  const isOutOfStock = mainStock <= 0;

                  const displayValue = getVariantDisplayValue({
                    options: product.options,
                    name: product.name,
                  });
                  return (
                    <label
                      key="main"
                      className={`${styles.variantCheckbox} ${
                        isOutOfStock ? styles.variantCheckbox_disabled : ''
                      }`}>
                      <input
                        type="checkbox"
                        checked={selectedVariant === 'main'}
                        disabled={isOutOfStock}
                        onChange={(e) => {
                          e.stopPropagation();
                          if (!isOutOfStock) {
                            onVariantSelect('main');
                          }
                        }}
                      />
                      <span className={styles.variantCheckboxText}>{displayValue}</span>
                    </label>
                  );
                })()}

              {/* Варіанти товару */}
              {sortedVariants.map((variant) => {
                const stock = getVariantStock(variant.id);
                const isOutOfStock = stock <= 0;
                const displayValue = getVariantDisplayValue(variant);

                return (
                  <label
                    key={variant.id}
                    className={`${styles.variantCheckbox} ${
                      isOutOfStock ? styles.variantCheckbox_disabled : ''
                    }`}>
                    <input
                      type="checkbox"
                      checked={selectedVariant === variant.id}
                      disabled={isOutOfStock}
                      onChange={(e) => {
                        e.stopPropagation();
                        if (!isOutOfStock) {
                          onVariantSelect(variant.id);
                        }
                      }}
                    />
                    <span className={styles.variantCheckboxText}>{displayValue}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </Group>
      <div className={styles.footer}></div>
    </div>
  );
};
