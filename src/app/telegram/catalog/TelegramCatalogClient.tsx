'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Modal, Loader, Center, Text, Container, Box } from '@mantine/core';
import { IconFilter, IconChevronDown } from '@tabler/icons-react';
import { Button } from '@/shared/components/Button/Button';
import { ProductCard } from '@/features/catalog/components/ProductCard/ProductCard';
import { CatalogFilters } from '@/features/catalog/components/CatalogFilters/CatalogFilters';
import { useCatalogFilters } from '@/features/catalog/hooks/useCatalogFilters';
import { useCatalogProducts } from '@/features/catalog/hooks/useCatalogProducts';
import { ProductsResponse } from '@/features/catalog/api/products';
import styles from './telegramCatalog.module.scss';

interface CatalogProps {
  initialData?: ProductsResponse | null;
  initialCategories?: any[];
}

export default function TelegramCatalogClient({ initialData, initialCategories }: CatalogProps) {
  const [initialized, setInitialized] = useState(false);
  const [filtersModalOpened, setFiltersModalOpened] = useState(false);

  const searchParams = useSearchParams();
  const { filters, setFromUrlParams } = useCatalogFilters();

  const observerTarget = useRef<HTMLDivElement>(null);

  const { data, isLoading, error, isFetchingNextPage, fetchNextPage, hasNextPage } = useCatalogProducts({
    filters: filters,
    enabled: initialized,
    initialData: initialData,
  });

  const products = data?.pages.flatMap((page) => page.data) || [];
  const totalCount = data?.pages[0]?.meta.total || 0;

  useEffect(() => {
    setFromUrlParams(searchParams);
    setInitialized(true);
  }, [searchParams, setFromUrlParams]);

  // Intersection Observer для безкінечного скролу
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <Container size="lg" p="md">
      <Box mb="md">
        <Text size="xl" fw={700} mb="xs">
          Каталог товарів
        </Text>
        <Text size="sm" c="dimmed">
          {totalCount > 0 ? `Знайдено ${totalCount} товарів` : 'Завантаження...'}
        </Text>
      </Box>

      {/* Кнопка фільтрів */}
      <Button variant="outline" className={styles.filtersButton} onClick={() => setFiltersModalOpened(true)} fullWidth>
        <div>
          <IconFilter size={16} />
          Фільтри
        </div>
        <IconChevronDown size={16} />
      </Button>

      {/* Модал з фільтрами */}
      <Modal
        opened={filtersModalOpened}
        onClose={() => setFiltersModalOpened(false)}
        title="Фільтри"
        size="lg"
        fullScreen>
        <CatalogFilters onFiltersChange={() => setFiltersModalOpened(false)} initialCategories={initialCategories} />
      </Modal>

      {/* Список товарів */}
      {isLoading && !initialized ? (
        <Center py={60}>
          <Loader size="lg" />
        </Center>
      ) : error ? (
        <Center py={60}>
          <Text c="red">Помилка завантаження товарів</Text>
        </Center>
      ) : products.length === 0 ? (
        <Center py={60}>
          <Text c="dimmed">Товарів не знайдено</Text>
        </Center>
      ) : (
        <>
          <div className={styles.productGrid}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Observer для безкінечного скролу */}
          <div ref={observerTarget} style={{ height: '20px', margin: '20px 0' }} />

          {isFetchingNextPage && (
            <Center py={20}>
              <Loader size="md" />
            </Center>
          )}

          {!hasNextPage && products.length > 0 && (
            <Center py={20}>
              <Text size="sm" c="dimmed">
                Всі товари завантажені
              </Text>
            </Center>
          )}
        </>
      )}
    </Container>
  );
}
