// src/features/reviews/index.ts

// Components
export { ProductReviews } from './components/ProductReviews/ProductReviews';
export { ReviewForm } from './components/ReviewForm/ReviewForm';
export { ReviewList } from './components/ReviewList/ReviewList';
export { RatingStars } from './components/RatingStars/RatingStars';

// Hooks and Types
export * from './hooks/reviewsHooks';

// API (re-export only reviewsApi object, types are already exported from hooks)
export { reviewsApi } from './api/reviews-api';
