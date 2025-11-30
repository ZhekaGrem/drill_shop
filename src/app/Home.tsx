// src/app/Home.tsx
'use client';

import { useRouter } from 'next/navigation';
import { Suspense, lazy, useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/shared/components/Button/Button';
import { ArrowRight } from '@/shared/components/Svg';
import styles from './home.module.scss';

// Lazy load Spline component для оптимізації
const Spline = lazy(() => import('@splinetool/react-spline'));

const Home = () => {
  const router = useRouter();
  const [showSpline, setShowSpline] = useState(false);

  useEffect(() => {
    // Показуємо 3D модель через 2 секунди
    const timer = setTimeout(() => {
      setShowSpline(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleGoToShop = () => {
    router.push('/catalog');
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.landingPage}>
        <div className={styles.landingContent}>
          {/* Spline 3D модель - позаду кнопки */}
          <div className={styles.tshirtSpline}>
            {!showSpline ? (
              <div className={styles.splineLoader}>
                <Image
                  src="/assets/img/tshirt.webp"
                  alt="Завантаження..."
                  width={700}
                  height={700}
                  className={styles.placeholderImage}
                  priority
                />
              </div>
            ) : (
              <Suspense
                fallback={
                  <div className={styles.splineLoader}>
                    <Image
                      src="/assets/img/tshirt.webp"
                      alt="Завантаження..."
                      width={700}
                      height={700}
                      className={styles.placeholderImage}
                      priority
                    />
                  </div>
                }>
                <Spline scene="https://prod.spline.design/j2veMJqqV2QABEh9/scene.splinecode" />
              </Suspense>
            )}
          </div>

          {/* Кнопка поверх футболки */}
          <Button size="promo" variant="yellow" onClick={handleGoToShop}>
            <span className={styles.bthSpan}>
              В МАГАЗИН <ArrowRight />
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;
