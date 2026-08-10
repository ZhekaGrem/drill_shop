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
      {/* Серце з Tabler Icons (outline, MIT) — та сама іконографіка 1.75, що й
          решта мови Дії. Активний стан = залите серце тим самим currentColor,
          колір веде CSS (.active → --accent-red). */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={styles.icon}
        viewBox="0 0 24 24"
        fill={isFavorite ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round">
        <path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />
      </svg>
    </button>
  );
};

export const FavoriteButton = memo(FavoriteButtonComponent);
