// src/features/catalog/components/CatalogFilters/CatalogFilters.tsx
import React, { useState, useEffect } from 'react';
import { useCatalogFilters } from '@/features/catalog/hooks/useCatalogFilters';
import { useCategoriesStore } from '@/shared/stores/categories';
import styles from './CatalogFilters.module.scss';

interface CatalogFiltersProps {
  onFiltersChange?: () => void;
  className?: string;
  initialCategories?: any[]; // ✅ ДОДАНО
}

export const CatalogFilters: React.FC<CatalogFiltersProps> = ({
  onFiltersChange,
  className = '',
  initialCategories,
}) => {
  const { filters, setFilter, clearFilters } = useCatalogFilters();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const {
    categories,
    fetchCategories,
    isLoading: categoriesLoading,
    isInitialized: categoriesInitialized,
    getGroupedCategories,
  } = useCategoriesStore();

  // ✅ Використовуємо SSG дані якщо є
  const displayCategories = categories.length > 0 ? categories : initialCategories || [];

  const handleCategoryToggle = (categoryId: string) => {
    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId];

    setSelectedCategories(newCategories);
    setFilter('categoryIds', newCategories.length > 0 ? newCategories : undefined);
    onFiltersChange?.();
  };

  const [priceRange, setPriceRange] = useState({
    min: filters.priceMin?.toString() || '',
    max: filters.priceMax?.toString() || '',
  });

  useEffect(() => {
    // ✅ Завантажуємо тільки якщо немає SSG даних
    if (!categoriesInitialized && !categoriesLoading) {
      fetchCategories();
    }
  }, [initialCategories, categoriesInitialized, categoriesLoading, fetchCategories]);

  useEffect(() => {
    setPriceRange({
      min: filters.priceMin?.toString() || '',
      max: filters.priceMax?.toString() || '',
    });
  }, [filters.priceMin, filters.priceMax]);

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split('_');
    setFilter('sortBy', sortBy);
    setFilter('sortOrder', sortOrder);
    onFiltersChange?.();
  };

  const handlePromoFilterChange = (hasPromo: boolean) => {
    setFilter('hasPromo', hasPromo || undefined);
    onFiltersChange?.();
  };

  const handleClearFilters = () => {
    clearFilters();
    setPriceRange({ min: '', max: '' });
    setSelectedCategories([]);
    onFiltersChange?.();
  };

  // ✅ Оптимізовані функції для роботи з SSG даними
  const rootCategories = displayCategories.filter(
    (cat) => !cat.parentId && (!cat.children || cat.children.length === 0)
  );

  const groupedCategories = getGroupedCategories();

  const currentSort = `${filters.sortBy || 'created'}_${filters.sortOrder || 'desc'}`;

  return (
    <div className={`${styles.catalogFilters} ${className}`}>
      <div className={styles.catalogFilters__header}>
        <h3 className={styles.catalogFilters__title}>Фільтри</h3>
        <button className={styles.catalogFilters__clear} onClick={handleClearFilters}>
          Очистити
        </button>
      </div>

      {/* Сортування */}
      <div className={styles.catalogFilters__section}>
        <label className={styles.catalogFilters__label}>Сортувати</label>
        <select
          className={styles.catalogFilters__select}
          value={currentSort}
          onChange={(e) => handleSortChange(e.target.value)}>
          <option value="created_desc">Новинки</option>
          <option value="popularity_desc">За популярністю</option>
          <option value="price_asc">Від дешевшого</option>
          <option value="price_desc">Від дорожчого</option>
        </select>
      </div>

      {/* Акції */}
      <div className={styles.catalogFilters__section}>
        <label className={styles.catalogFilters__label}>Акції</label>
        <div className={styles.catalogFilters__checkboxes}>
          <label className={styles.catalogFilters__checkbox}>
            <input
              type="checkbox"
              name="promo"
              checked={!filters.hasPromo}
              onChange={() => handlePromoFilterChange(false)}
            />
            <span className={styles.catalogFilters__checkboxText}>Всі товари</span>
          </label>

          <label className={styles.catalogFilters__checkbox}>
            <input
              type="checkbox"
              name="promo"
              checked={filters.hasPromo === true}
              onChange={() => handlePromoFilterChange(true)}
            />
            <span className={styles.catalogFilters__checkboxText}>Акційні товари</span>
          </label>
        </div>
      </div>

      {/* Категорії (основні без батьків) */}
      <div className={styles.catalogFilters__section}>
        <label className={styles.catalogFilters__label}>Категорії</label>
        <div className={styles.catalogFilters__checkboxes}>
          {rootCategories.map((category) => (
            <label key={category.id} className={styles.catalogFilters__checkbox}>
              <input
                type="checkbox"
                checked={selectedCategories.includes(category.id)}
                onChange={() => handleCategoryToggle(category.id)}
              />
              <span className={styles.catalogFilters__checkboxText}>{category.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Групові категорії (батько + діти як окремі блоки) */}
      {groupedCategories.map((group) => (
        <div key={group.parent.id} className={styles.catalogFilters__section}>
          <label className={styles.catalogFilters__label}>{group.parent.name}</label>
          <div className={styles.catalogFilters__checkboxes}>
            {group.children.map((child) => (
              <label key={child.id} className={styles.catalogFilters__checkbox}>
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(child.id)}
                  onChange={() => handleCategoryToggle(child.id)}
                />
                <span className={styles.catalogFilters__checkboxText}>{child.name}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
