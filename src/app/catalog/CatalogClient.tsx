'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { Modal, Loader, Center, Text, Container } from '@mantine/core';
import { IconFilter, IconChevronDown } from '@tabler/icons-react';
import { Button } from '@/shared/components/Button/Button';
import { ProductCard } from '@/features/catalog/components/ProductCard/ProductCard';
import { CatalogFilters } from '@/features/catalog/components/CatalogFilters/CatalogFilters';
import { useCatalogFilters } from '@/features/catalog/hooks/useCatalogFilters';
import { useCatalogProducts } from '@/features/catalog/hooks/useCatalogProducts';
import { ProductsResponse } from '@/features/catalog/api/products';
import styles from './catalog.module.scss';

interface CatalogProps {
  initialData?: ProductsResponse | null;
  initialCategories?: any[];
  basePath?: string;
}

export default function CatalogClient({ initialData, initialCategories, basePath = '' }: CatalogProps) {
  const [initialized, setInitialized] = useState(false);
  const [filtersModalOpened, setFiltersModalOpened] = useState(false);

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { filters, setFromUrlParams } = useCatalogFilters();

  const observerTarget = useRef<HTMLDivElement>(null);

  const { data, isLoading, error, isFetchingNextPage, fetchNextPage, hasNextPage } = useCatalogProducts({
    filters: filters,
    enabled: initialized,
    initialData: initialData,
  });

  // Об'єднуємо всі сторінки в один масив
  const products = data?.pages.flatMap((page) => page.data) || [];
  const totalCount = data?.pages[0]?.meta.total || 0;

  useEffect(() => {
    setFromUrlParams(searchParams);
    setInitialized(true);
  }, [searchParams, setFromUrlParams]);

  // ✅ Скролимо до верху при зміні фільтрів
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname, filters]); // Спрацює при зміні маршруту або фільтрів

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

  const handleFiltersChange = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className={styles.catalogPage}>
      <h1 className="hiddenTitle">Каталог товарів</h1>
      {/* Кнопка фільтрів для мобільних */}
      <Button
        variant="outline"
        className={styles.filtersButton}
        onClick={() => setFiltersModalOpened(true)}
        fullWidth>
        <div>
          <IconFilter size={16} />
          Фільтри
        </div>
        <IconChevronDown size={16} />
      </Button>

      {/* Фільтри для десктопу */}
      <div className={styles.desktopFilters}>
        <CatalogFilters onFiltersChange={handleFiltersChange} initialCategories={initialCategories} />
      </div>

      {/* Модал з фільтрами для мобільних */}
      <Modal
        opened={filtersModalOpened}
        onClose={() => setFiltersModalOpened(false)}
        title="Фільтри"
        size="100%"
        classNames={{
          body: styles.modalBody,
          content: styles.modalContent,
          title: styles.modalTitle,
          header: styles.modalHeader,
        }}>
        <CatalogFilters onFiltersChange={handleFiltersChange} initialCategories={initialCategories} />
      </Modal>
      <Container size={1300} px={40} pb={50}>
        {error && (
          <div className={styles.error}>
            <h3>Помилка завантаження</h3>
            <p>{error instanceof Error ? error.message : 'Невідома помилка'}</p>
          </div>
        )}

        {isLoading && !initialData && (
          <div className={styles.products}>
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className={styles.productSkeleton}>
                <div className={styles.productSkeleton__image} />
                <div className={styles.productSkeleton__content}>
                  <div className={styles.productSkeleton__title} />
                  <div className={styles.productSkeleton__price} />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && !error && products.length > 0 && (
          <>
            <div className={styles.products}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} basePath={basePath} />
              ))}
            </div>

            {/* Intersection observer target */}
            <div ref={observerTarget} style={{ height: '20px', margin: '20px 0' }} />

            {/* Індикатор завантаження наступної сторінки */}
            {isFetchingNextPage && (
              <Center py="xl">
                <Loader size="md" />
              </Center>
            )}

            {/* Повідомлення про кінець списку */}
            {!hasNextPage && products.length > 0 && (
              <Center py="xl">
                <Text c="red" size="md">
                  Всі товари завантажено ({totalCount})
                </Text>
              </Center>
            )}
          </>
        )}

        {/* Повідомлення якщо товарів немає */}
        {!isLoading && !error && products.length === 0 && (
          <Center py="xl">
            <Text c="red" size="md">
              Товари не знайдено
            </Text>
          </Center>
        )}
      </Container>
    </div>
  );
}
