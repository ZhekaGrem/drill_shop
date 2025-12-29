// src/features/catalog/components/ProductCard/ProductCard.tsx - СПРОЩЕНО
import React, { useEffect } from 'react';
import Link from 'next/link';
import { Product } from '@/shared/types';
import { useCart } from '@/features/cart/hooks/useCart';
import { FavoriteButton } from '@/features/favorites/components/FavoriteButton/FavoriteButton';
import { CloudinaryImage } from '@/shared/components/CloudinaryImage/CloudinaryImage';
import { useFavoritesStore } from '@/shared/stores/favorites';
import styles from './Card.module.scss';

interface ProductCardProps {
  product: Product;
  className?: string;
  styleText?: string;
}

export const Card: React.FC<ProductCardProps> = ({ product, className = '', styleText = 'title' }) => {
  const { initialize, isInitialized } = useFavoritesStore();
  const { addItem, isAddingItem } = useCart();

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  const baseUrl = process.env.NEXT_PUBLIC_API_IMG_URL;
  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];

  const imageUrl = primaryImage?.url || primaryImage?.publicId;
  // Варіанти
  const hasVariants = product.variants && product.variants.length > 0;
  // const allPrices = hasVariants
  //   ? [Number(product.price), ...product.variants.map((v) => Number(v.price))]
  //   : [Number(product.price)];

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (hasVariants) {
      window.location.href = `/catalog/${product.slug}`;
      return;
    }

    addItem(product.id, 1);
  };

  return (
    <div className={`${styles.card} ${className}`}>
      <Link href={`/catalog/${product.slug}`} className={styles.link}>
        <div className={styles.productCardImageContainer}>
          <CloudinaryImage
            src={imageUrl || '/assets/img/placeholder-product.jpg'}
            alt={primaryImage?.altText || product.name}
            width={400}
            height={400}
            className={styles.productImage}
          />
          {/* 
          <div
            className={styles.favoriteButtonWrapper}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}>
            <FavoriteButton product={product} />
          </div> */}
        </div>

        <div className={styles.content}>
          <h3 className={styles[styleText]}>{product.name}</h3>
        </div>
      </Link>
    </div>
  );
};
