// src/features/catalog/components/ProductCard/ProductCard.tsx - Refactored with FSD

'use client';

import React from 'react';
import { Product } from '@/shared/types';
import { useProductCardLogic } from '@/features/catalog/hooks/useProductCardLogic';
import { useProductCardActions } from '@/features/catalog/hooks/useProductCardActions';
import { ProductCardImage } from './ProductCardImage';
import { ProductCardInfo } from './ProductCardInfo';
import { ProductCardActions } from './ProductCardActions';
import styles from './ProductCard.module.scss';

interface ProductCardProps {
  product: Product;
  className?: string;
  basePath?: string;
  /** Порядковий номер у списку — керує каскадом появи (--i) */
  index?: number;
}

/**
 * Компонент картки товару
 * Оркеструє логіку відображення товару в каталозі
 */
export const ProductCard = React.memo<ProductCardProps>(
  ({ product, className = '', basePath = '', index }) => {
    // Використовуємо hooks для логіки
    const {
      selectedVariant,
      setSelectedVariant,
      isImageHovered,
      setIsImageHovered,
      sortedVariants,
      selectedVariantObject,
      showVariantsInCatalog,
      variantLabel,
      isInStock,
      primaryImage,
      secondaryImage,
      imageUrl,
      getVariantDisplayValue,
      getVariantStock,
    } = useProductCardLogic(product);

    const { isClicked, handleAddToCart, handleCardClick, getButtonText } = useProductCardActions({
      product,
      selectedVariant,
      selectedVariantObject,
      showVariantsInCatalog,
      variantLabel,
      basePath,
    });

    return (
      // Обрізаємо --i на 8: далі затримка каскаду робить низ довгого списку
      // відчутно повільним, і каскад із декоративного стає перешкодою.
      <div
        className={`${styles.card} ${className}`}
        style={{ '--i': Math.min(index ?? 0, 8) } as React.CSSProperties}>
        <div className={styles.link} onClick={handleCardClick}>
          {/* Product Image */}
          <ProductCardImage
            product={product}
            imageUrl={imageUrl}
            primaryImage={primaryImage}
            secondaryImage={secondaryImage}
            isImageHovered={isImageHovered}
            selectedVariantObject={selectedVariantObject}
            onMouseEnter={() => setIsImageHovered(true)}
            onMouseLeave={() => setIsImageHovered(false)}
          />

          {/* Product Info */}
          <ProductCardInfo
            product={product}
            isInStock={isInStock}
            selectedVariant={selectedVariant}
            selectedVariantObject={selectedVariantObject}
            sortedVariants={sortedVariants}
            showVariantsInCatalog={showVariantsInCatalog}
            getVariantDisplayValue={getVariantDisplayValue}
            getVariantStock={getVariantStock}
            onVariantSelect={setSelectedVariant}
            basePath={basePath}
          />
        </div>

        {/* Product Actions */}
        <ProductCardActions
          isClicked={isClicked}
          isInStock={isInStock}
          buttonText={getButtonText()}
          onAddToCart={handleAddToCart}
        />
      </div>
    );
  }
);

ProductCard.displayName = 'ProductCard';
