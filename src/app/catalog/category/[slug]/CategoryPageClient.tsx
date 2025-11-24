'use client';

import { useState, useEffect } from 'react';
import { Container } from '@mantine/core';
import Link from 'next/link';
import { IconPackage } from '@tabler/icons-react';
import { Category, Product } from '@/shared/types';
import { ProductsResponse } from '@/features/catalog/api/products';
import { ProductCard } from '@/features/catalog/components/ProductCard/ProductCard';
import { Pagination } from '@/shared/components/Pagination/Pagination';
import { Button } from '@/shared/components/Button/Button';
import { useCategoryProducts } from '@/features/catalog/hooks/useCategoryProducts';
import { CategoryHero } from '@/features/catalog/components/CategoryHero/CategoryHero';
import { EmptyState } from '@/shared/components/EmptyState/EmptyState';
import styles from './category.module.scss';

interface CategoryPageClientProps {
  initialCategory: Category;
  initialProducts: ProductsResponse | null;
}

export default function CategoryPageClient({ initialCategory, initialProducts }: CategoryPageClientProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 18;

  const {
    data: queryData,
    isLoading,
    isFetching,
  } = useCategoryProducts({
    categorySlug: initialCategory.slug,
    page: currentPage,
    limit,
    initialData: initialProducts,
  });

  const productsData = queryData || initialProducts;
  const products = productsData?.data || [];
  const totalCount = productsData?.meta?.total || 0;
  const totalPages = totalCount > 0 ? Math.ceil(totalCount / limit) : 0;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={styles.categoryPage}>
      {/* Hero секція з даними категорії */}
      <CategoryHero category={initialCategory} productsCount={totalCount} />

      <Container size="xl" className={styles.content}>
        {/* Breadcrumbs */}
        <nav className={styles.breadcrumbs}>
          <Link href="/catalog" className={styles.breadcrumbs__link}>
            Каталог
          </Link>
          <span className={styles.breadcrumbs__separator}>→</span>
          <span className={styles.breadcrumbs__current}>{initialCategory.name}</span>
        </nav>

        {/* Список товарів */}
        {isLoading && currentPage === 1 ? (
          <div className={styles.loading}>
            <div className={styles.spinner}>Завантаження товарів...</div>
          </div>
        ) : products.length > 0 ? (
          <>
            <div className={styles.productsGrid}>
              {products.map((product: Product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Пагінація */}
            {totalPages > 1 && (
              <div className={styles.paginationWrapper}>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon={IconPackage}
            title="Товарів поки немає"
            description={`У категорії "${initialCategory.name}" ще немає доступних товарів`}
            primaryAction={
              <Link href="/catalog">
                <Button>Переглянути весь каталог</Button>
              </Link>
            }
          />
        )}
      </Container>
    </div>
  );
}
