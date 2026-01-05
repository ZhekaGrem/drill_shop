// src/features/catalog/components/SearchInput/SearchInput.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TextInput, Loader, Text, Box, Image } from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';
import { useProductSearch } from '../../hooks/useProductSearch';
import { formatPrice } from '@/shared/utils/format';
import styles from './SearchInput.module.scss';

interface SearchInputProps {
  /** Placeholder для input */
  placeholder?: string;
  /** CSS клас для контейнера */
  className?: string;
  /** Базовий шлях для навігації (наприклад, '/telegram') */
  basePath?: string;
}

/**
 * Компонент пошуку товарів з autocomplete dropdown
 * Показує до 5 товарів під час введення
 */
export const SearchInput = ({ placeholder = 'Пошук товарів...', className, basePath = '' }: SearchInputProps) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { data, isLoading, isError } = useProductSearch(query);

  const products = data?.data?.slice(0, 5) || [];
  const hasResults = products.length > 0;
  const showDropdown = isOpen && query.length >= 2 && (hasResults || isLoading || isError);

  // Закрити dropdown при кліку поза компонентом
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Закрити dropdown при натисканні Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleProductClick = (slug: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(`${basePath}/catalog/${slug}`);
  };

  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`${styles.container} ${className || ''}`}>
      <TextInput
        value={query}
        onChange={(e) => {
          setQuery(e.currentTarget.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        leftSection={<IconSearch size={18} />}
        rightSection={
          isLoading ? (
            <Loader size="xs" />
          ) : query ? (
            <IconX size={18} onClick={handleClear} style={{ cursor: 'pointer' }} />
          ) : null
        }
        classNames={{
          input: styles.input,
        }}
      />

      {showDropdown && (
        <Box className={styles.dropdown}>
          {isLoading ? (
            <div className={styles.loadingState}>
              <Loader size="sm" />
              <Text size="sm" c="dimmed">
                Пошук...
              </Text>
            </div>
          ) : isError ? (
            <div className={styles.emptyState}>
              <Text size="sm" c="red">
                Помилка пошуку
              </Text>
            </div>
          ) : hasResults ? (
            <div className={styles.results}>
              {products.map((product) => (
                <button
                  key={product.id}
                  className={styles.productItem}
                  onClick={() => handleProductClick(product.slug)}>
                  <Image
                    src={product.images?.[0]?.url || '/placeholder.jpg'}
                    alt={product.name}
                    className={styles.productImage}
                    width={50}
                    height={50}
                  />
                  <div className={styles.productInfo}>
                    <Text size="sm" fw={500} lineClamp={1}>
                      {product.name}
                    </Text>
                    <Text size="sm" c="dimmed">
                      {formatPrice(product.price)}
                    </Text>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <Text size="sm" c="dimmed">
                Нічого не знайдено
              </Text>
            </div>
          )}
        </Box>
      )}
    </div>
  );
};
