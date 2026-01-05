// src/shared/components/SearchInput/SearchInput.tsx

import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import { useCatalogFilters } from '@/features/catalog/hooks/useCatalogFilters';
import { useDebounce } from '@/shared/hooks';
import styles from './SearchInput.module.scss';
import { Button } from '@/shared/components/Button/Button';
interface SearchInputProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
  basePath?: string;
}

const SearchInputComponent: React.FC<SearchInputProps> = ({
  placeholder = 'Пошук товарів...',
  className = '',
  onSearch,
  basePath = '',
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const { filters, setFilter } = useCatalogFilters();

  // Initialize with current search filter
  useEffect(() => {
    if (filters.search) {
      setQuery(filters.search);
    }
  }, [filters.search]);

  // Search function
  const performSearch = useCallback(
    (searchQuery: string) => {
      if (onSearch) {
        onSearch(searchQuery);
      } else {
        // Default behavior: navigate to catalog with search
        setFilter('search', searchQuery || undefined);

        if (searchQuery.trim()) {
          router.push(`${basePath}/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
        } else {
          router.push(`${basePath}/catalog`);
        }
      }
    },
    [onSearch, setFilter, router, basePath]
  );

  // Debounced search
  const debouncedSearch = useDebounce(performSearch, 300);

  // Handle input change with debounce
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  // Handle form submit (immediate search)
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      performSearch(query);
      inputRef.current?.blur();
    },
    [query, performSearch]
  );

  // Handle clear
  const handleClear = useCallback(() => {
    setQuery('');
    performSearch('');
    inputRef.current?.focus();
  }, [performSearch]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      inputRef.current?.blur();
    }
  }, []);

  return (
    <form
      className={` ${styles.searchInput} ${isFocused ? styles.searchInput__focused : ''} ${className}`}
      onSubmit={handleSubmit}
      noValidate>
      <div className={styles.searchInput__container}>
        <input
          ref={inputRef}
          type="text"
          className={styles.searchInput__field}
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          spellCheck="false"
        />

        {query && (
          <Button
            type="button"
            className={styles.searchInput__clear}
            onClick={handleClear}
            size="fl"
            aria-label="Очистити пошук"
            variant="ghost">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={styles.icon}>
              <path
                d="M12 4L4 12M4 4l8 8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Button>
        )}

        <Button
          type="submit"
          className={styles.searchInput__submit}
          variant="ghost"
          aria-label="Пошук"
          size="fl">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className={styles.icon}>
            <path
              d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Button>
      </div>
    </form>
  );
};

export const SearchInput = memo(SearchInputComponent);
