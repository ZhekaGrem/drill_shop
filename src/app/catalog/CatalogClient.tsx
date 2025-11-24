'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { ProductCard } from '@/features/catalog/components/ProductCard/ProductCard';
import { CatalogFilters } from '@/features/catalog/components/CatalogFilters/CatalogFilters';
import { Pagination } from '@/shared/components/Pagination/Pagination';
import { useCatalogFilters } from '@/features/catalog/hooks/useCatalogFilters';
import { useCatalogProducts, usePrefetchNextPage } from '@/features/catalog/hooks/useCatalogProducts';
import { ProductsResponse } from '@/features/catalog/api/products';
import { MobileFilterModal } from '@/features/catalog/components/MobileFilterModal/MobileFilterModal';
import { Button } from '@/shared/components/Button/Button';
import styles from './catalog.module.scss';

interface CatalogProps {
  initialData?: ProductsResponse | null;
  initialCategories?: any[];
}

export default function CatalogClient({ initialData, initialCategories }: CatalogProps) {
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);

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
    setMobileFilterOpen(false);
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

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.categorySlug) count++;
    if (filters.priceMin || filters.priceMax) count++;
    if (filters.hasPromo) count++;
    if (filters.sortBy && filters.sortBy !== 'created') count++;
    return count;
  };

  const showInitialData = !initialized && initialData && !searchParams.toString();

  if (showInitialData) {
    return (
      <div className={styles.catalogPage}>
        <div className={styles.container}>
          <div className={styles.content}>
            <div className={styles.main}>
              <div className={styles.products}>
                {initialData!.data.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
            <aside className={styles.sidebar}>
              <CatalogFilters onFiltersChange={handleFiltersChange} initialCategories={initialCategories} />
            </aside>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.catalogPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.resultsCount}></div>
        </div>

        <div className={styles.content}>
          <div className={styles.main}>
            <Button
              variant="outline"
              className={styles.mobileFilterBtn}
              onClick={() => setMobileFilterOpen(true)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 22 22"
                fill="none"
                stroke="currentColor">
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M4 8h4v4h-4z" />
                <path d="M6 4l0 4" />
                <path d="M6 12l0 8" />
                <path d="M10 14h4v4h-4z" />
                <path d="M12 4l0 10" />
                <path d="M12 18l0 2" />
                <path d="M16 5h4v4h-4z" />
                <path d="M18 4l0 1" />
                <path d="M18 9l0 11" />
              </svg>
              <span>Фільтри</span>
              {getActiveFiltersCount() > 0 && (
                <span className={styles.filterCount}>{getActiveFiltersCount()}</span>
              )}
            </Button>

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

          <aside className={styles.sidebar}>
            <CatalogFilters onFiltersChange={handleFiltersChange} initialCategories={initialCategories} />
          </aside>
        </div>
      </div>

      <MobileFilterModal
        opened={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        onFiltersChange={handleFiltersChange}
        initialCategories={initialCategories}
      />
    </div>
  );
}
