// src/features/favorites/components/FavoriteButton/FavoriteButton.tsx
'use client';

import { useFavoritesStore } from '@/shared/stores/favorites';
import { Product } from '@/shared/types';
import { useAuthStore } from '@/shared/stores/auth';
import { useCallback, useEffect, memo } from 'react';
import styles from './FavoriteButton.module.scss';

interface FavoriteButtonProps {
  product: Product;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const FavoriteButtonComponent = ({ product, className, size = 'md' }: FavoriteButtonProps) => {
  const isFavorite = useFavoritesStore((state) => state.items.has(product.id));
  const isInitialized = useFavoritesStore((state) => state.isInitialized);
  const { toggleFavorite, initialize } = useFavoritesStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Ініціалізація сторінки
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  // Обробка кліку без зайвих станів
  const handleToggle = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      await toggleFavorite(product);
    },
    [product, toggleFavorite]
  );

  return (
    <button
      className={`${styles.favoriteButton} ${styles[size]} ${isFavorite ? styles.active : ''} ${className || ''}`}
      onClick={handleToggle}
      aria-label={isFavorite ? 'Видалити з обраного' : 'Додати в обране'}
      disabled={!isInitialized}
      type="button">
      <svg
        viewBox="0 0 24 24"
        fill={isFavorite ? 'currentColor' : 'none'}
        xmlns="http://www.w3.org/2000/svg"
        className={styles.icon}>
        <path
          d="M12 19.7501C11.8012 19.7499 11.6105 19.6708 11.47 19.5301L4.70001 12.7401C3.78387 11.8054 3.27072 10.5488 3.27072 9.24006C3.27072 7.9313 3.78387 6.6747 4.70001 5.74006C5.6283 4.81186 6.88727 4.29042 8.20001 4.29042C9.51274 4.29042 10.7717 4.81186 11.7 5.74006L12 6.00006L12.28 5.72006C12.739 5.25606 13.2857 4.88801 13.8883 4.63736C14.4909 4.3867 15.1374 4.25845 15.79 4.26006C16.442 4.25714 17.088 4.38382 17.6906 4.63274C18.2931 4.88167 18.8402 5.24786 19.3 5.71006C20.2161 6.6447 20.7293 7.9013 20.7293 9.21006C20.7293 10.5188 20.2161 11.7754 19.3 12.7101L12.53 19.5001C12.463 19.5752 12.3815 19.636 12.2904 19.679C12.1994 19.7219 12.1006 19.7461 12 19.7501Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};

export const FavoriteButton = memo(FavoriteButtonComponent);
