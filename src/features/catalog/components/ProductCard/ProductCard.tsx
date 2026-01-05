// src/features/catalog/components/ProductCard/ProductCard.tsx - Refactored with FSD

'use client';

import React, { useState } from 'react';
import { Product } from '@/shared/types';
import { ProductQuickViewModal } from '@/features/catalog/components/ProductQuickViewModal';
import { useProductCardLogic } from '@/features/catalog/hooks/useProductCardLogic';
import { useProductCardActions } from '@/features/catalog/hooks/useProductCardActions';
import { ProductCardImage } from './ProductCardImage';
import { ProductCardInfo } from './ProductCardInfo';
import { ProductCardActions } from './ProductCardActions';
import styles from './ProductCard.module.scss';

interface ProductCardProps {
  product: Product;
  className?: string;
  enableQuickView?: boolean;
  basePath?: string;
}

/**
 * Компонент картки товару
 * Оркеструє логіку відображення товару в каталозі
 */
export const ProductCard = React.memo<ProductCardProps>(
  ({ product, className = '', enableQuickView = false, basePath = '' }) => {
    const [quickViewOpened, setQuickViewOpened] = useState(false);

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
      enableQuickView,
      onQuickViewOpen: () => setQuickViewOpened(true),
      basePath,
    });

    return (
      <div className={`${styles.card} ${className}`}>
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
            isImageHovered={isImageHovered}
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

        {/* Quick View Modal */}
        {enableQuickView && (
          <ProductQuickViewModal
            product={product}
            opened={quickViewOpened}
            onClose={() => setQuickViewOpened(false)}
            basePath={basePath}
          />
        )}
      </div>
    );
  }
);

ProductCard.displayName = 'ProductCard';
