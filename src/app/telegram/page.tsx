'use client';

import { useRouter } from 'next/navigation';
import { Text } from '@mantine/core';
import { Button } from '@/shared/components/Button/Button';
import { useTelegramAuthStore } from '@/shared/stores/telegram-auth';

import { Suspense, lazy, useState } from 'react';
import Image from 'next/image';
import { ArrowRight } from '@/shared/components/Svg';
import styles from '../home.module.scss';
const Spline = lazy(() => import('@splinetool/react-spline'));

export default function TelegramHomePage() {
  const router = useRouter();
  const { userProfile, isAuthenticated } = useTelegramAuthStore();
  const [isSplineLoaded, setIsSplineLoaded] = useState(false);

  const handleGoToShop = () => {
    router.push('/telegram/catalog');
  };
  return (
    <div className={styles.wrapper}>
      <div className={styles.landingPage}>
        <div className={styles.landingContent}>
          <h1 className={styles.hiddenTitle}>Щільний Дріл Мерч НІЖНА ОКСАНА ПРОКЛЯТИЙ ХУЙ </h1>
          {/* Spline 3D модель - позаду кнопки */}
          <div className={styles.tshirtSpline}>
            {/* Placeholder - показується поки 3D не готова */}
            {!isSplineLoaded && (
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
            )}
            
            {/* 3D модель - завантажується одразу, але прихована поки не готова */}
            <div style={{ opacity: isSplineLoaded ? 1 : 0, transition: 'opacity 0.5s ease' }}>
              <Suspense fallback={null}>
                <Spline
                  scene="https://prod.spline.design/j2veMJqqV2QABEh9/scene.splinecode"
                  onLoad={() => setIsSplineLoaded(true)}
                  className={styles.splineLoader}
                />
              </Suspense>
            </div>
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
}
