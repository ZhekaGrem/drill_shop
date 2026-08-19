// src/features/catalog/index.ts

// Components
export { ProductCard } from './components/ProductCard/ProductCard';
export { ProductBadges } from './components/ProductBadges/ProductBadges';
// CatalogFilters і MobileFilterModal видалені разом із фільтрами каталогу
// (рішення власника). Стор useCatalogFilters лишився: його читає URL і хедер.

// Hooks
export { useCatalogFilters } from './hooks/useCatalogFilters';
export { useCatalogProducts } from './hooks/useCatalogProducts';
export { useProductSearch } from './hooks/useProductSearch';

// API
export * from './api/products';
