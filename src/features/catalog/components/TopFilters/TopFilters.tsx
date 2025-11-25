// src/features/catalog/components/TopFilters/TopFilters.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useCatalogFilters } from '@/features/catalog/hooks/useCatalogFilters';
import styles from './TopFilters.module.scss';

interface TopFiltersProps {
  onFiltersChange?: () => void;
  className?: string;
}

const SORT_OPTIONS = [
  { value: 'created_desc', label: 'Рекомендовані' },
  { value: 'price_asc', label: 'Ціна, від низької до високої' },
  { value: 'price_desc', label: 'Ціна, від високої до низької' },
  { value: 'name_asc', label: 'Новинки' },
];

const SIZE_OPTIONS = ['S', 'M', 'L', 'XL', 'XXL'];

export const TopFilters: React.FC<TopFiltersProps> = ({ onFiltersChange, className = '' }) => {
  const { filters, setFilter } = useCatalogFilters();
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [priceRange, setPriceRange] = useState({
    min: filters.priceMin?.toString() || '',
    max: filters.priceMax?.toString() || '',
  });

  useEffect(() => {
    setPriceRange({
      min: filters.priceMin?.toString() || '',
      max: filters.priceMax?.toString() || '',
    });
  }, [filters.priceMin, filters.priceMax]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSortDropdown(false);
      }
    };

    if (showSortDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSortDropdown]);

  const currentSort = `${filters.sortBy || 'created'}_${filters.sortOrder || 'desc'}`;
  const currentSortLabel = SORT_OPTIONS.find((opt) => opt.value === currentSort)?.label || 'Рекомендовані';

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split('_');
    setFilter('sortBy', sortBy);
    setFilter('sortOrder', sortOrder);
    setShowSortDropdown(false);
    onFiltersChange?.();
  };

  const handleSizeToggle = (size: string) => {
    const newSizes = selectedSizes.includes(size)
      ? selectedSizes.filter((s) => s !== size)
      : [...selectedSizes, size];

    setSelectedSizes(newSizes);
    // TODO: Інтегрувати з API фільтрації по розмірах
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

  return (
    <div className={`${styles.topFilters} ${className}`}>
      {/* Сортування */}
      <div className={styles.filterItem}>
        <label className={styles.label}>Сортувати за:</label>
        <div className={styles.dropdown} ref={dropdownRef}>
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

      {/* Розміри */}
      <div className={styles.filterItem}>
        <label className={styles.label}>Розміри:</label>
        <div className={styles.sizeButtons}>
          {SIZE_OPTIONS.map((size) => (
            <button
              key={size}
              className={`${styles.sizeButton} ${selectedSizes.includes(size) ? styles.active : ''}`}
              onClick={() => handleSizeToggle(size)}>
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Ціна */}
      <div className={styles.filterItem}>
        <div className={styles.priceInputs}>
          <div className={styles.priceField}>
            <label className={styles.priceLabel}>від ₴</label>
            <input
              type="number"
              className={styles.priceInput}
              value={priceRange.min}
              onChange={(e) => handlePriceChange('min', e.target.value)}
              onBlur={handlePriceBlur}
              placeholder="500"
              min="0"
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
              placeholder="2 000"
              min="0"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
