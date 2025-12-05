'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { Modal } from '@mantine/core';
import { IconFilter, IconChevronDown } from '@tabler/icons-react';
import { Button } from '@/shared/components/Button/Button';
import { ProductCard } from '@/features/catalog/components/ProductCard/ProductCard';
import { CatalogFilters } from '@/features/catalog/components/CatalogFilters/CatalogFilters';
import { Pagination } from '@/shared/components/Pagination/Pagination';
import { useCatalogFilters } from '@/features/catalog/hooks/useCatalogFilters';
import { useCatalogProducts, usePrefetchNextPage } from '@/features/catalog/hooks/useCatalogProducts';
import { ProductsResponse } from '@/features/catalog/api/products';
import styles from './catalog.module.scss';

interface CatalogProps {
  initialData?: ProductsResponse | null;
  initialCategories?: any[];
}

export default function CatalogClient({ initialData, initialCategories }: CatalogProps) {
  const [initialized, setInitialized] = useState(false);
  const [filtersModalOpened, setFiltersModalOpened] = useState(false);

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { filters, pagination, setFromUrlParams, getUrlParams, setPagination } = useCatalogFilters();

  const {
    data: queryData,
    isLoading,
    error,
    isFetching,
  } = useCatalogProducts({
    filters: filters,
    pagination: pagination,
    enabled: initialized,
    initialData: initialData,
  });

  const productsData = queryData || initialData;
  const products = productsData?.data || [];

  // ✅ FIX: Використовуємо реальні дані з API
  const totalCount = productsData?.meta.total || 0;
  const currentLimit = productsData?.meta.limit || pagination.limit || 18;
  const currentOffset = productsData?.meta.offset || pagination.offset || 0;

  // Якщо products.length < limit, значить це остання сторінка
  const actualTotal =
    products.length < currentLimit && currentOffset === 0
      ? products.length // Якщо перша сторінка і товарів менше ліміту - це єдина сторінка
      : totalCount;

  // ✅ FIX: Розрахунок правильних значень
  const totalPages = actualTotal > 0 ? Math.ceil(actualTotal / currentLimit) : 0;
  const currentPage = Math.floor(currentOffset / currentLimit) + 1;

  usePrefetchNextPage(currentPage, totalPages, filters);

  useEffect(() => {
    setFromUrlParams(searchParams);
    setInitialized(true);
  }, [searchParams, setFromUrlParams]);

  // ✅ Скролимо до верху при відкритті каталогу
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]); // Спрацює при зміні маршруту

  const handlePageChange = (page: number) => {
    const limit = 18;
    const newOffset = (page - 1) * limit;
    setPagination({ limit, offset: newOffset });
    updateURLWithoutReload(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFiltersChange = () => {
    setPagination({ limit: 18, offset: 0 });
    updateURLWithoutReload(1);
  };

  const updateURLWithoutReload = (page?: number) => {
    const params = getUrlParams();
    if (page && page > 1) {
      params.set('page', page.toString());
    } else {
      params.delete('page');
    }
    const newUrl = `${pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    window.history.replaceState(null, '', newUrl);
  };

  const showInitialData = !initialized && initialData && !searchParams.toString();

  if (showInitialData) {
    return (
      <div className={styles.catalogPage}>
        {/* Кнопка фільтрів для мобільних */}
        <Button className={styles.filtersButton} onClick={() => setFiltersModalOpened(true)} fullWidth>
          <IconFilter size={20} />
          <span>Фільтри</span>
          <IconChevronDown size={20} />
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
          size="xl"
          classNames={{
            body: styles.modalBody,
            content: styles.modalContent,
            title: styles.modalTitle,
            header: styles.modalHeader,
          }}>
          <CatalogFilters onFiltersChange={handleFiltersChange} initialCategories={initialCategories} />
        </Modal>
        <div className={styles.container}>

          <div className={styles.products}>
            {initialData!.data.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.catalogPage}>
      {/* Кнопка фільтрів для мобільних */}
      <Button variant='outline' className={styles.filtersButton} onClick={() => setFiltersModalOpened(true)} fullWidth>
        <IconFilter size={20} />
        <span>Фільтри</span>
        <IconChevronDown size={20} />
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
      <div className={styles.container}>

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
            <div className={styles.products} style={{ opacity: isFetching ? 0.7 : 1 }}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* ✅ FIX: Пагінація показується тільки коли товарів більше ніж limit */}
            {totalCount > currentLimit && totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                className={styles.pagination}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
