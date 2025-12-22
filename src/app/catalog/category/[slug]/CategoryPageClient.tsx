'use client';

import { useEffect, useRef } from 'react';
import { Container, Loader, Center, Text } from '@mantine/core';
import Link from 'next/link';
import { IconPackage } from '@tabler/icons-react';
import { Category, Product } from '@/shared/types';
import { ProductsResponse } from '@/features/catalog/api/products';
import { ProductCard } from '@/features/catalog/components/ProductCard/ProductCard';
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
  const observerTarget = useRef<HTMLDivElement>(null);

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } = useCategoryProducts({
    categorySlug: initialCategory.slug,
    initialData: initialProducts,
  });

  // Об'єднуємо всі сторінки в один масив
  const products = data?.pages.flatMap((page) => page.data) || [];
  const totalCount = data?.pages[0]?.meta?.total || 0;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

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
        {isLoading ? (
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
                <Text c="dimmed" size="sm">
                  Всі товари завантажено ({totalCount})
                </Text>
              </Center>
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
