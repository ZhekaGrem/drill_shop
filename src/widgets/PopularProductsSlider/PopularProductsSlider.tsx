// src/widgets/PopularProductsSlider/PopularProductsSlider.tsx
// Карусель «як у Дії»: великі картки-новини з високим фото на всю картку,
// підпис і кругла стрілка всередині картки, крапки-пагінація знизу.
// Автоплей паузиться на hover/focus — користувач керує, не карусель.
'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useKeenSlider } from 'keen-slider/react';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/features/catalog/api/products';
import { CloudinaryImage } from '@/shared/components/CloudinaryImage/CloudinaryImage';
import { ArrowRight } from '@/shared/components/Svg';
import { formatPrice } from '@/shared/utils/format';
import styles from './PopularProductsSlider.module.scss';
import 'keen-slider/keen-slider.min.css';

const AUTOPLAY_MS = 4000;
const SKELETON_COUNT = 3;

export const PopularProductsSlider = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['popular-products-slider'],
    queryFn: () => productsApi.getProducts({ sortBy: 'popularity', sortOrder: 'desc' }, { limit: 8 }),
    staleTime: 5 * 60 * 1000,
  });

  const [currentSlide, setCurrentSlide] = useState(0);
  const isPausedRef = useRef(false);

  const [sliderRef, instanceRef] = useKeenSlider({
    loop: true,
    slides: { perView: 1.15, spacing: 16 },
    breakpoints: {
      '(min-width: 768px)': {
        slides: { perView: 2.2, spacing: 20 },
      },
      '(min-width: 1120px)': {
        slides: { perView: 3, spacing: 24 },
      },
    },
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel);
    },
  });

  const products = data?.data || [];

  useEffect(() => {
    if (!instanceRef.current || products.length <= 1) return;
    const interval = setInterval(() => {
      if (!isPausedRef.current) {
        instanceRef.current?.next();
      }
    }, AUTOPLAY_MS);
    return () => clearInterval(interval);
  }, [instanceRef, products.length]);

  if (isLoading) {
    return (
      <div>
        <h2 className={styles.title}>Популярні продукти</h2>
        <div className={styles.skeletonRow} aria-hidden="true">
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <div key={i} className={styles.skeletonSlide}>
              <div className={styles.skeletonImage} />
              <div className={styles.skeletonCaption}>
                <div className={styles.skeletonLine} />
                <div className={styles.skeletonLineShort} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2 className={styles.title}>Популярні продукти</h2>
        <div className={styles.errorCard}>
          <p className={styles.errorText}>Не вдалося завантажити товари. Перевірте з&apos;єднання.</p>
          <button type="button" className={styles.retryButton} onClick={() => refetch()}>
            Спробувати ще раз
          </button>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null; // Секції нема що показувати — успішна відповідь без товарів
  }

  return (
    <div
      onMouseEnter={() => (isPausedRef.current = true)}
      onMouseLeave={() => (isPausedRef.current = false)}
      onFocusCapture={() => (isPausedRef.current = true)}
      onBlurCapture={() => (isPausedRef.current = false)}>
      <h2 className={styles.title}>Популярні продукти</h2>

      <div ref={sliderRef} className={`keen-slider ${styles.slider}`}>
        {products.map((product) => {
          const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];
          return (
            <div key={product.id} className="keen-slider__slide">
              <Link href={`/catalog/${product.slug}`} className={styles.slideCard}>
                <div className={styles.slideImageWrapper}>
                  <CloudinaryImage
                    src={primaryImage?.url || primaryImage?.publicId || '/assets/img/placeholder-product.jpg'}
                    alt={primaryImage?.altText || product.name}
                    width={600}
                    height={800}
                    className={styles.slideImage}
                  />
                </div>
                <div className={styles.slideCaption}>
                  <div className={styles.slideCaptionText}>
                    <span className={styles.slidePrice}>{formatPrice(Number(product.price))}</span>
                    <span className={styles.slideName}>{product.name}</span>
                  </div>
                  <span className={styles.slideArrow} aria-hidden="true">
                    <ArrowRight />
                  </span>
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      {products.length > 1 && (
        <div className={styles.dots} role="tablist" aria-label="Слайди популярних товарів">
          {products.map((product, idx) => (
            <button
              key={product.id}
              type="button"
              role="tab"
              aria-label={`Слайд ${idx + 1}`}
              aria-selected={currentSlide === idx}
              className={`${styles.dot} ${currentSlide === idx ? styles.dotActive : ''}`}
              onClick={() => instanceRef.current?.moveToIdx(idx)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
