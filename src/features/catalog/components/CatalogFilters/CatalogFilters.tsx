// src/features/catalog/components/CatalogFilters/CatalogFilters.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useCatalogFilters, countActiveFilters } from '@/features/catalog/hooks/useCatalogFilters';
import { useCategoriesStore } from '@/shared/stores/categories';
import { formatProducts } from '@/shared/utils/format';
import styles from './CatalogFilters.module.scss';

interface CatalogFiltersProps {
  onFiltersChange?: () => void;
  className?: string;
  initialCategories?: any[];
  /** Скільки товарів зараз у видачі — показуємо в рядку стану */
  resultsCount?: number;
}

const SORT_OPTIONS = [
  { value: 'created_desc', label: 'Рекомендовані' },
  { value: 'popularity_desc', label: 'За популярністю' },
  { value: 'price_asc', label: 'Ціна, від низької до високої' },
  { value: 'price_desc', label: 'Ціна, від високої до низької' },
];

/** Ціна застосовується з паузою після набору, а не по blur.
 *  Раніше людина набирала суму й нічого не відбувалось, поки вона не клацне
 *  повз поле — тобто категорії застосовувались миттєво, а ціна ні. Одна
 *  модель на всі контроли (Nielsen #1: видимість статусу системи). */
const PRICE_APPLY_DELAY = 500;

export const CatalogFilters: React.FC<CatalogFiltersProps> = ({
  onFiltersChange,
  className = '',
  initialCategories,
  resultsCount,
}) => {
  const { filters, setFilter, clearFilters } = useCatalogFilters();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const sortButtonRef = useRef<HTMLButtonElement>(null);
  const priceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  useEffect(() => {
    setSelectedCategories(filters.categoryIds || []);
  }, [filters.categoryIds]);

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

  useEffect(
    () => () => {
      if (priceTimer.current) clearTimeout(priceTimer.current);
    },
    []
  );

  const currentSort = `${filters.sortBy || 'created'}_${filters.sortOrder || 'desc'}`;
  const currentSortLabel = SORT_OPTIONS.find((opt) => opt.value === currentSort)?.label || 'Рекомендовані';

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split('_');
    setFilter('sortBy', sortBy);
    setFilter('sortOrder', sortOrder);
    setShowSortDropdown(false);
    sortButtonRef.current?.focus();
    onFiltersChange?.();
  };

  /** Стрілки / Home / End / Escape у списку сортування.
   *  Раніше це була пара <button> + <div> без ролей: мишею працювало,
   *  з клавіатури — ні (Nielsen #7, доступність). */
  const handleSortKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      setShowSortDropdown(false);
      sortButtonRef.current?.focus();
      return;
    }
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;

    event.preventDefault();
    if (!showSortDropdown) {
      setShowSortDropdown(true);
      return;
    }

    const index = SORT_OPTIONS.findIndex((o) => o.value === currentSort);
    const last = SORT_OPTIONS.length - 1;
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? last
          : event.key === 'ArrowDown'
            ? Math.min(index + 1, last)
            : Math.max(index - 1, 0);

    handleSortChange(SORT_OPTIONS[next].value);
    setShowSortDropdown(true);
  };

  const handleCategoryToggle = (categoryId: string) => {
    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId];

    setSelectedCategories(newCategories);
    setFilter('categoryIds', newCategories.length > 0 ? newCategories : undefined);
    onFiltersChange?.();
  };

  /** Застосовує пару значень цілісно й нормалізує їх замість того, щоб
   *  лаятись: якщо «від» більше за «до», міняємо місцями (Postel's Law —
   *  приймай ввід ліберально, віддавай передбачувано). Раніше min > max
   *  приймався мовчки й давав порожню видачу без пояснення. */
  const applyPrice = useCallback(
    (raw: { min: string; max: string }) => {
      let min = raw.min === '' ? undefined : Math.max(0, Number(raw.min));
      let max = raw.max === '' ? undefined : Math.max(0, Number(raw.max));

      if (min !== undefined && Number.isNaN(min)) min = undefined;
      if (max !== undefined && Number.isNaN(max)) max = undefined;
      if (min !== undefined && max !== undefined && min > max) [min, max] = [max, min];

      setFilter('priceMin', min);
      setFilter('priceMax', max);
      onFiltersChange?.();
    },
    [setFilter, onFiltersChange]
  );

  const handlePriceChange = (field: 'min' | 'max', value: string) => {
    const next = { ...priceRange, [field]: value };
    setPriceRange(next);

    if (priceTimer.current) clearTimeout(priceTimer.current);
    priceTimer.current = setTimeout(() => applyPrice(next), PRICE_APPLY_DELAY);
  };

  const handleClearFilters = () => {
    if (priceTimer.current) clearTimeout(priceTimer.current);
    clearFilters();
    setPriceRange({ min: '', max: '' });
    setSelectedCategories([]);
    onFiltersChange?.();
  };

  // Групові категорії (батько + діти)
  const groupedCategories = getGroupedCategories();

  // Категорії верхнього рівня без дітей раніше не показувались узагалі —
  // getGroupedCategories віддає тільки пари «батько + діти».
  const groupedChildIds = new Set(groupedCategories.flatMap((g) => g.children.map((c: any) => c.id)));
  const groupedParentIds = new Set(groupedCategories.map((g) => g.parent.id));
  const ungroupedCategories = displayCategories.filter(
    (c: any) => !c.parentId && !groupedParentIds.has(c.id) && !groupedChildIds.has(c.id)
  );

  const activeCount = countActiveFilters(filters);
  const showSummary = activeCount > 0 || resultsCount !== undefined;

  /** Які саме фільтри зараз увімкнені — видимими чіпами, кожен знімається
   *  окремо. Було лише «Скинути (3)»: людина бачила КІЛЬКІСТЬ обмежень, але
   *  мусила згадувати, які саме (Recognition rather than recall, Nielsen #6). */
  const categoryNameById = new Map<string, string>(
    displayCategories.map((c: any) => [c.id as string, c.name as string])
  );
  const activeChips: { key: string; label: string; onRemove: () => void }[] = [
    ...selectedCategories.map((id) => ({
      key: `cat-${id}`,
      label: categoryNameById.get(id) || 'Категорія',
      onRemove: () => handleCategoryToggle(id),
    })),
    ...(filters.priceMin !== undefined
      ? [
          {
            key: 'price-min',
            label: `від ${filters.priceMin} ₴`,
            onRemove: () => applyPrice({ min: '', max: priceRange.max }),
          },
        ]
      : []),
    ...(filters.priceMax !== undefined
      ? [
          {
            key: 'price-max',
            label: `до ${filters.priceMax} ₴`,
            onRemove: () => applyPrice({ min: priceRange.min, max: '' }),
          },
        ]
      : []),
    ...(filters.hasPromo
      ? [
          {
            key: 'promo',
            label: 'Тільки зі знижкою',
            onRemove: () => {
              setFilter('hasPromo', undefined);
              onFiltersChange?.();
            },
          },
        ]
      : []),
    ...(filters.search?.trim()
      ? [
          {
            key: 'search',
            label: `Пошук: ${filters.search.trim()}`,
            onRemove: () => {
              setFilter('search', undefined);
              onFiltersChange?.();
            },
          },
        ]
      : []),
  ];

  return (
    <div className={`${styles.filters} ${className}`}>
      {/* Сортування */}
      <div className={styles.filterGroup}>
        <span className={styles.label} id="sort-label">
          Сортувати
        </span>
        <div className={styles.dropdown} ref={dropdownRef} onKeyDown={handleSortKeyDown}>
          <button
            type="button"
            ref={sortButtonRef}
            className={styles.dropdownButton}
            aria-haspopup="listbox"
            aria-expanded={showSortDropdown}
            aria-labelledby="sort-label"
            onClick={() => setShowSortDropdown(!showSortDropdown)}>
            <span>{currentSortLabel}</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
              className={`${styles.chevron} ${showSortDropdown ? styles.chevronOpen : ''}`}>
              <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          {showSortDropdown && (
            <div className={styles.dropdownMenu} role="listbox" aria-labelledby="sort-label">
              {SORT_OPTIONS.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  role="option"
                  aria-selected={currentSort === option.value}
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
        <span className={styles.label}>Ціна, ₴</span>
        <div className={styles.priceInputs}>
          {/* Плейсхолдери були «0» і «9999» — вигаданий діапазон, не повʼязаний
              з реальним каталогом. Порожнє поле = межі немає. */}
          <input
            type="number"
            inputMode="numeric"
            min="0"
            className={styles.priceInput}
            value={priceRange.min}
            onChange={(e) => handlePriceChange('min', e.target.value)}
            placeholder="від"
            aria-label="Ціна від"
          />
          <span className={styles.priceDash} aria-hidden="true">
            —
          </span>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            className={styles.priceInput}
            value={priceRange.max}
            onChange={(e) => handlePriceChange('max', e.target.value)}
            placeholder="до"
            aria-label="Ціна до"
          />
        </div>
      </div>

      {/* Категорії. Раніше кожна група стояла в тому самому горизонтальному
          ряду з вертикальним border-right між групами: щойно чіпів ставало
          більше й ряд переносився, роздільники опинялись посеред нізвідки. */}
      {groupedCategories.map((group) => (
        <fieldset key={group.parent.id} className={styles.filterGroup}>
          <legend className={styles.label}>{group.parent.name}</legend>
          <div className={styles.checkboxes}>
            {group.children.map((child: any) => (
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
        </fieldset>
      ))}

      {ungroupedCategories.length > 0 && (
        <fieldset className={styles.filterGroup}>
          <legend className={styles.label}>Категорії</legend>
          <div className={styles.checkboxes}>
            {ungroupedCategories.map((category: any) => (
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
        </fieldset>
      )}

      {/* Рядок стану: що дала фільтрація і як зняти конкретне обмеження */}
      {showSummary && (
        <div className={styles.summary}>
          {activeChips.length > 0 && (
            <div className={styles.activeChips}>
              {activeChips.map((chip) => (
                <button
                  type="button"
                  key={chip.key}
                  className={styles.activeChip}
                  onClick={chip.onRemove}
                  aria-label={`Прибрати фільтр: ${chip.label}`}>
                  <span>{chip.label}</span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path
                      d="M2 2L10 10M10 2L2 10"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              ))}
            </div>
          )}

          <div className={styles.summaryMeta}>
            {resultsCount !== undefined && (
              <span className={styles.resultsCount} aria-live="polite">
                Знайдено {formatProducts(resultsCount)}
              </span>
            )}
            {activeCount > 0 && (
              <button type="button" className={styles.resetButton} onClick={handleClearFilters}>
                Скинути все
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
