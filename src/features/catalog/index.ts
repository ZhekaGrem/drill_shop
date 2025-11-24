// src/features/catalog/index.ts

// Components
export { ProductCard } from './components/ProductCard/ProductCard';
export { ProductBadges } from './components/ProductBadges/ProductBadges';
export { CatalogFilters } from './components/CatalogFilters/CatalogFilters';
export { SearchInput } from './components/SearchInput';

// Hooks
export { useCatalogFilters } from './hooks/useCatalogFilters';
export { useCatalogProducts } from './hooks/useCatalogProducts';
export { useProductSearch } from './hooks/useProductSearch';

// API
export * from './api/products';
