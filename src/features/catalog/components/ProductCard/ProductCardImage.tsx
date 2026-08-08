// src/features/catalog/components/ProductCard/ProductCardImage.tsx
import React from 'react';
import { Product } from '@/shared/types';
import { CloudinaryImage } from '@/shared/components/CloudinaryImage/CloudinaryImage';
import { ProductBadges } from '@/features/catalog/components/ProductBadges/ProductBadges';
import styles from './ProductCard.module.scss';

interface ProductCardImageProps {
  product: Product;
  imageUrl: string | undefined;
  primaryImage: any;
  secondaryImage: any;
  isImageHovered: boolean;
  selectedVariantObject: any;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

/**
 * Компонент зображення ProductCard
 * Відображає зображення товару, badges та кнопку favorite
 */
export const ProductCardImage: React.FC<ProductCardImageProps> = ({
  product,
  imageUrl,
  primaryImage,
  secondaryImage,
  isImageHovered,
  selectedVariantObject,
  onMouseEnter,
  onMouseLeave,
}) => {
  return (
    <div className={styles.productCardImageContainer} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <div className={styles.productCardImageContainer__ImageWrapper}>
        <CloudinaryImage
          src={imageUrl || '/assets/img/placeholder-product.jpg'}
          alt={
            isImageHovered && secondaryImage
              ? secondaryImage.altText || product.name
              : primaryImage?.altText || product.name
          }
          width={400}
          height={400}
          className={styles.productImage}
          loading="lazy"
        />
      </div>
      <ProductBadges product={product} selectedVariant={selectedVariantObject} />
    </div>
  );
};
