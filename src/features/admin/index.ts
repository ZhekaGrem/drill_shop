// src/features/admin/index.ts

// Components
export { ProductForm } from './components/ProductForm/ProductForm';
export { CategoryForm } from './components/CategoryForm/CategoryForm';
export { DiscountForm } from './components/DiscountForm/DiscountForm';
export { OrderCard } from './components/OrderCard/OrderCard';
export { ReviewCard } from './components/ReviewCard/ReviewCard';

// Hooks
export * from './hooks/adminHooks';
export * from './hooks/discountHooks';
export * from './hooks/reviewHooks';
export { useModifyOrder } from './hooks/useModifyOrder';
export { useDiscountForm } from './hooks/useDiscountForm';
