// src/app/Home.tsx
'use client';

import { useRouter } from 'next/navigation';
import { Suspense, lazy } from 'react';
import { Button } from '@/shared/components/Button/Button';
import { IconShoppingBag } from '@tabler/icons-react';
import styles from './home.module.scss';

// Lazy load Spline component для оптимізації
const Spline = lazy(() => import('@splinetool/react-spline'));

const Home = () => {
  const router = useRouter();

  const handleGoToShop = () => {
    router.push('/catalog');
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.landingPage}>
        <div className={styles.landingContent}>
          {/* Spline 3D модель - позаду кнопки */}
          <div className={styles.tshirtSpline}>
            <Suspense fallback={<div className={styles.splineLoader}>Завантаження 3D моделі...</div>}>
              <Spline scene="https://prod.spline.design/j2veMJqqV2QABEh9/scene.splinecode" />
            </Suspense>
          </div>

          {/* Кнопка поверх футболки */}
          <Button
            size="promo"
            variant="primary"
            onClick={handleGoToShop}
            leftIcon={<IconShoppingBag size={32} />}>
            В МАГАЗИН
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;
