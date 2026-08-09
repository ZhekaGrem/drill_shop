'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { Loader, Center, Text, Container, Title, Stack } from '@mantine/core';
import { IconFilter, IconChevronDown } from '@tabler/icons-react';
import { Button } from '@/shared/components/Button/Button';
import { ProductCard } from '@/features/catalog/components/ProductCard/ProductCard';
import { CatalogFilters } from '@/features/catalog/components/CatalogFilters/CatalogFilters';
import { MobileFilterModal } from '@/features/catalog/components/MobileFilterModal/MobileFilterModal';
import { useCatalogFilters, countActiveFilters } from '@/features/catalog/hooks/useCatalogFilters';
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
  const router = useRouter();
  const { filters, setFromUrlParams, clearFilters } = useCatalogFilters();

  const observerTarget = useRef<HTMLDivElement>(null);

  const { data, isLoading, error, refetch, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useCatalogProducts({
      filters: filters,
      enabled: initialized,
      initialData: initialData,
    });

  // Об'єднуємо всі сторінки в один масив
  const products = data?.pages.flatMap((page) => page.data) || [];
  const totalCount = data?.pages[0]?.meta.total || 0;
  const activeFilterCount = countActiveFilters(filters);

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

  const handleResetFilters = useCallback(() => {
    clearFilters();
    router.replace(pathname);
  }, [clearFilters, router, pathname]);

  return (
    <div className={styles.catalogPage}>
      {/* Кнопка фільтрів для мобільних — з лічильником активних */}
      <Button
        variant="outline"
        className={styles.filtersButton}
        onClick={() => setFiltersModalOpened(true)}
        fullWidth>
        <div>
          <IconFilter size={16} />
          Фільтри
          {activeFilterCount > 0 && <span className={styles.filtersBadge}>{activeFilterCount}</span>}
        </div>
        <IconChevronDown size={16} />
      </Button>

      {/* Фільтри для десктопу */}
      <div className={styles.desktopFilters}>
        <CatalogFilters
          onFiltersChange={handleFiltersChange}
          initialCategories={initialCategories}
          resultsCount={totalCount}
        />
      </div>

      {/* Мобільний bottom sheet з фільтрами */}
      <MobileFilterModal
        opened={filtersModalOpened}
        onClose={() => setFiltersModalOpened(false)}
        onFiltersChange={handleFiltersChange}
        initialCategories={initialCategories}
        resultsCount={totalCount}
      />
      <Container size={1300} px={{ base: 20, sm: 40 }} pb={50}>
        {error && (
          <div className={styles.error}>
            <h3>Не вдалося завантажити товари</h3>
            <p>Перевірте з&apos;єднання з інтернетом і спробуйте ще раз.</p>
            <Button variant="primary" onClick={() => refetch()}>
              Спробувати ще раз
            </Button>
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
                <Text c="dimmed" size="md">
                  Всі товари завантажено ({totalCount})
                </Text>
              </Center>
            )}
          </>
        )}

        {/* Повідомлення якщо товарів немає */}
        {!isLoading && !error && products.length === 0 && (
          <Center py="xl">
            <Stack align="center" gap="md" maw={400}>
              <IconFilter size={64} color="var(--mantine-color-gray-5)" />
              <Title order={3} ta="center">
                Нічого не знайдено
              </Title>
              <Text ta="center" c="dimmed">
                За обраними фільтрами товарів немає. Спробуйте змінити або скинути фільтри.
              </Text>
              <Button variant="secondary" onClick={handleResetFilters}>
                Скинути фільтри
              </Button>
            </Stack>
          </Center>
        )}
      </Container>
    </div>
  );
}
