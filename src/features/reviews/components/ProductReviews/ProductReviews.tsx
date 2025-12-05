'use client';

import { useState } from 'react';
import { ReviewList } from '../ReviewList/ReviewList';
import { ReviewForm } from '../ReviewForm/ReviewForm';
import { useCanReview } from '../../hooks/reviewsHooks';
import { useAuthStore } from '@/shared/stores/auth';
import styles from './productReviews.module.scss';
import { Button } from '@/shared/components/Button/Button';

interface ProductReviewsProps {
  productId: string;
  canReview?: boolean;
}

export const ProductReviews = ({ productId }: ProductReviewsProps) => {
  const [showForm, setShowForm] = useState(false);
  const { isAuthenticated } = useAuthStore();

  // Check if user can actually review this product - only for authenticated users
  const { data: reviewPermission, isLoading: checkingPermission } = useCanReview(productId);

  const handleReviewSuccess = () => {
    setShowForm(false);
  };

  // Determine if user can review
  const userCanReview = isAuthenticated && reviewPermission?.canReview;
  const cannotReviewReason = reviewPermission?.reason;

  return (
    <section className={styles.productReviews}>
      <div className={styles.header}>
        {isAuthenticated ? (
          userCanReview && !showForm ? (
            <Button onClick={() => setShowForm(true)}>Написати відгук</Button>
          ) : !userCanReview && !checkingPermission ? (
            <div className={styles.cantReviewMessage}>
              {cannotReviewReason || 'Ви не можете залишити відгук для цього товару'}
            </div>
          ) : null
        ) : (
          <div className={styles.loginPrompt}>Увійдіть в акаунт, щоб залишити відгук</div>
        )}
      </div>

      {showForm && userCanReview && (
        <div className={styles.reviewFormContainer}>
          <ReviewForm
            productId={productId}
            onSuccess={handleReviewSuccess}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <ReviewList productId={productId} />
    </section>
  );
};
