'use client';

import { useState } from 'react';
import styles from './ratingStars.module.scss';

interface RatingStarsProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const RatingStars = ({
  rating,
  onRatingChange,
  readonly = false,
  size = 'md',
  showText = false,
}: RatingStarsProps) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleStarClick = (value: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleStarHover = (value: number) => {
    if (!readonly) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className={`${styles.ratingStars} ${styles[size]}`}>
      <div className={styles.stars} onMouseLeave={handleMouseLeave}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`${styles.star} ${
              star <= displayRating ? styles.filled : styles.empty
            } ${readonly ? styles.readonly : ''}`}
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => handleStarHover(star)}
            disabled={readonly}
            aria-label={`${star} зірка${star > 1 ? 'и' : ''}`}>
            ★
          </button>
        ))}
      </div>
      {showText && (
        <span className={styles.ratingText}>{rating > 0 ? `${rating.toFixed(1)} з 5` : 'Без рейтингу'}</span>
      )}
    </div>
  );
};
