// src/features/catalog/components/ProductCard/ProductCardImage.tsx
import React from 'react';
import { ViewTransition } from 'react';
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
        {/* name збігається з обгорткою головного фото на сторінці товару — по
            ньому React знаходить пару й морфить фото між позиціями. share="morph"
            і default="none" потрібні обидва: без default фото крос-фейдилось би
            на КОЖНОМУ переході, без share пара мовчки перестає морфитись. */}
        <ViewTransition name={`product-${product.id}`} share="morph" default="none">
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
        </ViewTransition>
      </div>
      <ProductBadges product={product} selectedVariant={selectedVariantObject} />
    </div>
  );
};
