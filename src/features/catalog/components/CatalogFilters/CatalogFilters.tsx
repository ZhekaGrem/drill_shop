// src/features/catalog/components/CatalogFilters/CatalogFilters.tsx
import React, { useState, useEffect } from 'react';
import { useCatalogFilters } from '@/features/catalog/hooks/useCatalogFilters';
import { useCategoriesStore } from '@/shared/stores/categories';
import styles from './CatalogFilters.module.scss';

interface CatalogFiltersProps {
  onFiltersChange?: () => void;
  className?: string;
  initialCategories?: any[];
}

const SORT_OPTIONS = [
  { value: 'created_desc', label: 'Рекомендовані' },
  { value: 'popularity_desc', label: 'За популярністю' },
  { value: 'price_asc', label: 'Від дешевших' },
  { value: 'price_desc', label: 'Від дорожчих' },
  { value: 'name_asc', label: 'За назвою (А-Я)' },
];

export const CatalogFilters: React.FC<CatalogFiltersProps> = ({
  onFiltersChange,
  className = '',
  initialCategories,
}) => {
  const { filters, setFilter, clearFilters } = useCatalogFilters();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const {
    categories,
    fetchCategories,
    isLoading: categoriesLoading,
    isInitialized: categoriesInitialized,
    getGroupedCategories,
  } = useCategoriesStore();

  const displayCategories = categories.length > 0 ? categories : initialCategories || [];

  const [priceRange, setPriceRange] = useState({
    min: filters.priceMin?.toString() || '',
    max: filters.priceMax?.toString() || '',
  });

  useEffect(() => {
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

  const currentSort = `${filters.sortBy || 'created'}_${filters.sortOrder || 'desc'}`;
  const currentSortLabel = SORT_OPTIONS.find((opt) => opt.value === currentSort)?.label || 'Рекомендовані';

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split('_');
    setFilter('sortBy', sortBy);
    setFilter('sortOrder', sortOrder);
    setShowSortDropdown(false);
    onFiltersChange?.();
  };

  const handleCategoryToggle = (categoryId: string) => {
    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId];

    setSelectedCategories(newCategories);
    setFilter('categoryIds', newCategories.length > 0 ? newCategories : undefined);
    onFiltersChange?.();
  };

  const handlePriceChange = (field: 'min' | 'max', value: string) => {
    const numValue = value === '' ? '' : value;
    setPriceRange((prev) => ({ ...prev, [field]: numValue }));
  };

  const handlePriceBlur = () => {
    const min = priceRange.min === '' ? undefined : Number(priceRange.min);
    const max = priceRange.max === '' ? undefined : Number(priceRange.max);

    setFilter('priceMin', min);
    setFilter('priceMax', max);
    onFiltersChange?.();
  };

  const handleClearFilters = () => {
    clearFilters();
    setPriceRange({ min: '', max: '' });
    setSelectedCategories([]);
    onFiltersChange?.();
  };

  const rootCategories = displayCategories.filter(
    (cat) => !cat.parentId && (!cat.children || cat.children.length === 0)
  );

  const groupedCategories = getGroupedCategories();

  return (
    <div className={`${styles.filters} ${className}`}>
      {/* Сортування */}
      <div className={styles.filterGroup}>
        <label className={styles.label}>Сортувати за:</label>
        <div className={styles.dropdown}>
          <button className={styles.dropdownButton} onClick={() => setShowSortDropdown(!showSortDropdown)}>
            <span>{currentSortLabel}</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={styles.chevron}>
              <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
            </svg>
          </button>

          {showSortDropdown && (
            <div className={styles.dropdownMenu}>
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  className={`${styles.dropdownItem} ${currentSort === option.value ? styles.active : ''}`}
                  onClick={() => handleSortChange(option.value)}>
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Ціна */}
      <div className={styles.filterGroup}>
        <div className={styles.priceInputs}>
          <div className={styles.priceField}>
            <label className={styles.priceLabel}>від ₴</label>
            <input
              type="number"
              className={styles.priceInput}
              value={priceRange.min}
              onChange={(e) => handlePriceChange('min', e.target.value)}
              onBlur={handlePriceBlur}
              placeholder="0"
            />
          </div>

          <div className={styles.priceField}>
            <label className={styles.priceLabel}>до ₴</label>
            <input
              type="number"
              className={styles.priceInput}
              value={priceRange.max}
              onChange={(e) => handlePriceChange('max', e.target.value)}
              onBlur={handlePriceBlur}
              placeholder="9999"
            />
          </div>
        </div>
      </div>

      {/* Категорії (основні без батьків) */}
      {rootCategories.length > 0 && (
        <div className={styles.categorySection}>
          <label className={styles.categoryLabel}>Категорії</label>
          <div className={styles.checkboxes}>
            {rootCategories.map((category) => (
              <label key={category.id} className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.id)}
                  onChange={() => handleCategoryToggle(category.id)}
                />
                <span className={styles.checkboxText}>{category.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Групові категорії (батько + діти як окремі блоки) */}
      {groupedCategories.map((group) => (
        <div key={group.parent.id} className={styles.categorySection}>
          <label className={styles.categoryLabel}>{group.parent.name}</label>
          <div className={styles.checkboxes}>
            {group.children.map((child) => (
              <label key={child.id} className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(child.id)}
                  onChange={() => handleCategoryToggle(child.id)}
                />
                <span className={styles.checkboxText}>{child.name}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
