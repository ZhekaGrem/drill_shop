'use client';

import { useState } from 'react';
import { RatingStars } from '../RatingStars/RatingStars';
import { useProductReviews, useMarkHelpful, useDeleteReview } from '../../hooks/reviewsHooks';
import styles from './reviewList.module.scss';
import { useAuthStore } from '@/shared/stores/auth';
import { IconTrash, IconMessage } from '@tabler/icons-react';
import { EmptyState } from '@/shared/components/EmptyState';
import { Button } from '@/shared/components/Button/Button';

interface ReviewListProps {
  productId: string;
  limit?: number;
}

export const ReviewList = ({ productId, limit = 10 }: ReviewListProps) => {
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'helpful'>(
    'newest'
  );
  const [offset, setOffset] = useState(0);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
  const { userProfile } = useAuthStore();

  const { data, isLoading, error } = useProductReviews({
    productId,
    sortBy,
    limit,
    offset,
  });

  const markHelpful = useMarkHelpful();
  const deleteReview = useDeleteReview();
  const handleMarkHelpful = async (reviewId: string) => {
    try {
      await markHelpful.mutateAsync(reviewId);
    } catch (error) {
      console.error('Помилка оцінки відгуку:', error);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Ви впевнені, що хочете видалити цей відгук?')) {
      return;
    }

    try {
      setDeletingReviewId(reviewId);
      await deleteReview.mutateAsync(reviewId);
    } catch (error) {
      console.error('Помилка видалення відгуку:', error);
    } finally {
      setDeletingReviewId(null);
    }
  };

  const handleLoadMore = () => {
    setOffset((prev) => prev + limit);
  };

  const canDeleteReview = (review: any) => {
    if (!userProfile) return false;
    // Since backend returns author name as "firstName lastName", we check if current user matches
    const currentUserName = `${userProfile.firstName} ${userProfile.lastName}`;
    return (
      review.author.name === currentUserName ||
      review.author.name === 'Ви' ||
      review.author.name.includes(userProfile.firstName)
    );
  };

  if (isLoading && offset === 0) {
    return (
      <div className={styles.loading}>
        <div className={styles.skeleton}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className={styles.skeletonItem}>
              <div className={styles.skeletonHeader}></div>
              <div className={styles.skeletonContent}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>Помилка завантаження відгуків: {error.message}</p>
        <button onClick={() => window.location.reload()}>Спробувати знову</button>
      </div>
    );
  }

  const reviews = data?.data || [];
  const stats = data?.stats;

  return (
    <div className={styles.reviewList}>
      {stats && (
        <div className={styles.header}>
          <div className={styles.stats}>
            <h3>Відгуки покупців ({stats.totalReviews})</h3>
            <div className={styles.averageRating}>
              <RatingStars rating={stats.averageRating} readonly size="md" showText />
            </div>
          </div>

          <div className={styles.ratingDistribution}>
            {Object.entries(stats.ratingDistribution)
              .reverse()
              .map(([rating, count]) => (
                <div key={rating} className={styles.ratingRow}>
                  <span>{rating} ★</span>
                  <div className={styles.ratingBar}>
                    <div
                      className={styles.ratingFill}
                      style={{
                        width: stats.totalReviews > 0 ? `${(count / stats.totalReviews) * 100}%` : '0%',
                      }}
                    />
                  </div>
                  <span>{count}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className={styles.controls}>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className={styles.sortSelect}>
          <option value="newest">Найновіші</option>
          <option value="oldest">Найстаріші</option>
          <option value="rating_high">Найвища оцінка</option>
          <option value="rating_low">Найнижча оцінка</option>
          <option value="helpful">Найкорисніші</option>
        </select>
      </div>

      {reviews.length === 0 ? (
        <EmptyState
          icon={IconMessage}
          iconSize={70}
          title="Поки що немає відгуків"
          description="Станьте першим, хто залишить відгук про цей товар!"
          minHeight={250}
        />
      ) : (
        <div className={styles.reviews}>
          {reviews.map((review) => (
            <article key={review.id} className={styles.review}>
              <header className={styles.reviewHeader}>
                <div className={styles.authorInfo}>
                  <span className={styles.authorName}>
                    {review.author.name}
                    {review.author.isVerified && (
                      <span className={styles.verified} title="Верифікована покупка">
                        ✓
                      </span>
                    )}
                  </span>
                  <span className={styles.reviewDate}>{review.timeAgo}</span>
                </div>
                <div className={styles.reviewActions}>
                  <RatingStars rating={review.rating} readonly size="sm" />

                  {canDeleteReview(review) && (
                    <Button
                      onClick={() => handleDeleteReview(review.id)}
                      className={styles.deleteButton}
                      disabled={deletingReviewId === review.id}>
                      {deletingReviewId === review.id ? '...' : <IconTrash size={16} />}
                    </Button>
                  )}
                </div>
              </header>

              <div className={styles.reviewContent}>
                {review.content && <p className={styles.reviewText}>{review.content}</p>}
              </div>

              {/* <footer className={styles.reviewFooter}>
                <button
                  onClick={() => handleMarkHelpful(review.id)}
                  className={styles.helpfulButton}
                  disabled={markHelpful.isLoading}
                >
                  👍 Корисно ({review.helpfulCount})
                </button>
              </footer> */}
            </article>
          ))}
        </div>
      )}

      {data?.meta?.hasMore && (
        <div className={styles.loadMore}>
          <button onClick={handleLoadMore} disabled={isLoading} className={styles.loadMoreButton}>
            {isLoading ? 'Завантаження...' : 'Показати більше'}
          </button>
        </div>
      )}
    </div>
  );
};
