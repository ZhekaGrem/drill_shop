// src/widgets/PopularProductsSlider/PopularProductsSlider.tsx - ПРОСТАЯ ВЕРСИЯ
'use client';

import { useEffect } from 'react';
import { useKeenSlider } from 'keen-slider/react';
import { useQuery } from '@tanstack/react-query';
import { Container, Title } from '@mantine/core';
import { productsApi } from '@/features/catalog/api/products';
import { Card } from '@/shared/components/Card/Card';
import styles from './PopularProductsSlider.module.scss';
import 'keen-slider/keen-slider.min.css';

export const PopularProductsSlider = () => {
  // Fetch popular products
  const { data, isLoading, error } = useQuery({
    queryKey: ['popular-products-slider'],
    queryFn: () => productsApi.getProducts({ sortBy: 'popularity', sortOrder: 'desc' }, { limit: 8 }),
    staleTime: 5 * 60 * 1000,
  });

  // Keen slider setup
  const [sliderRef, instanceRef] = useKeenSlider({
    loop: true,
    slides: {
      perView: 'auto',
      spacing: 20,
    },
    breakpoints: {
      '(max-width: 768px)': {
        slides: { perView: 1.2, spacing: 16 },
      },
      '(max-width: 1024px)': {
        slides: { perView: 2.5, spacing: 20 },
      },
      '(min-width: 1025px)': {
        slides: { perView: 3.5, spacing: 24 },
      },
    },
  });

  const products = data?.data || [];

  // Auto-play
  useEffect(() => {
    if (!instanceRef.current || products.length <= 1) return;
    const interval = setInterval(() => instanceRef.current?.next(), 4000);
    return () => clearInterval(interval);
  }, [instanceRef, products.length]);

  if (isLoading) {
    return (
      <Container size="lg" className={styles.section}>
        <Title order={2} className={styles.title}>
          Популярні продукти
        </Title>
        <div className={styles.loading}>Завантаження...</div>
      </Container>
    );
  }

  if (error || products.length === 0) {
    return null; // Не показуємо секцію якщо немає товарів
  }

  return (
    <section className={styles.section}>
      <Container size="lg" className={styles.container}>
        <Title order={2} className={styles.title}>
          Популярні продукти
        </Title>

        <div ref={sliderRef} className={`keen-slider ${styles.slider}`}>
          {products.map((product) => (
            <div key={product.id} className={`keen-slider__slide ${styles.slide}`}>
              <Card product={product} />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};
