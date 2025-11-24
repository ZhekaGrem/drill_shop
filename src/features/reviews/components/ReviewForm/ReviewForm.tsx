'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { RatingStars } from '../RatingStars/RatingStars';
import { useCreateReview } from '../../hooks/reviewsHooks';
import { useAuthStore } from '@/shared/stores/auth';
import styles from './reviewForm.module.scss';

// ВИПРАВЛЕНО: title не обов'язковий, буде заповнюватися автоматично
const reviewSchema = z.object({
  rating: z.number().min(1, 'Оберіть рейтинг').max(5),
  content: z.string().min(10, 'Відгук повинен містити мінімум 10 символів').max(2000),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  productId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const ReviewForm = ({ productId, onSuccess, onCancel }: ReviewFormProps) => {
  const [rating, setRating] = useState(0);
  const createReview = useCreateReview();
  const { userProfile } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      content: '',
    },
  });

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    setValue('rating', newRating);
  };

  const onSubmit = async (data: ReviewFormData) => {
    try {
      // ВИПРАВЛЕНО: автоматично формуємо title з імені користувача
      const title = userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : 'Користувач';

      await createReview.mutateAsync({
        productId,
        title, // Передаємо автоматично сформований title
        ...data,
      });
      onSuccess?.();
    } catch (error) {
      console.error('Помилка створення відгуку:', error);
    }
  };

  const contentLength = watch('content')?.length || 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.reviewForm} noValidate>
      <div className={styles.header}>
        <h3>Залишити відгук</h3>
        {/* ДОДАНО: показуємо від чийого імені буде відгук */}
        {userProfile && (
          <p className={styles.authorInfo}>
            Відгук від:{' '}
            <strong>
              {userProfile.firstName} {userProfile.lastName}
            </strong>
          </p>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          Оцінка товару <span className={styles.required}>*</span>
        </label>
        <RatingStars rating={rating} onRatingChange={handleRatingChange} size="lg" />
        {errors.rating && <span className={styles.error}>{errors.rating.message}</span>}
      </div>

      <div className={styles.field}>
        <label htmlFor="content" className={styles.label}>
          Ваш відгук <span className={styles.required}>*</span>
        </label>
        <textarea
          id="content"
          placeholder="Розкажіть детальніше про товар: якість, смак, упаковка..."
          rows={5}
          className={`${styles.textarea} ${errors.content ? styles.inputError : ''}`}
          {...register('content')}
        />
        <div className={styles.charCount}>{contentLength}/2000 символів</div>
        {errors.content && <span className={styles.error}>{errors.content.message}</span>}
      </div>

      {createReview.error && (
        <div className={styles.submitError}>{createReview.error.message || 'Помилка створення відгуку'}</div>
      )}

      <div className={styles.actions}>
        {onCancel && (
          <button type="button" onClick={onCancel} className={styles.cancelButton} disabled={isSubmitting}>
            Скасувати
          </button>
        )}
        <button type="submit" className={styles.submitButton} disabled={isSubmitting || rating === 0}>
          {isSubmitting ? 'Відправлення...' : 'Залишити відгук'}
        </button>
      </div>
    </form>
  );
};
