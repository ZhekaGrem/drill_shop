// src/widgets/HeroVisual/HeroVisual.tsx
// 3D-футболка в герої. Раніше Spline монтувався одразу разом зі сторінкою:
// важкий рантайм + сцена вантажились у той самий момент, що й LCP, а
// перемикання з плейсхолдера було різким стрибком непрозорості.
//
// Тепер: сцена підвантажується лише коли блок реально потрапив у в'юпорт,
// і взагалі не вантажиться, якщо система просить менше руху. Статичне фото —
// не «заглушка на час», а повноцінний фолбек.
'use client';

import { Suspense, lazy, useState } from 'react';
import Image from 'next/image';
import { useInView } from 'react-intersection-observer';
import { useReducedMotion } from '@mantine/hooks';
import styles from './HeroVisual.module.scss';

const Spline = lazy(() => import('@splinetool/react-spline'));

const SCENE_URL = 'https://prod.spline.design/j2veMJqqV2QABEh9/scene.splinecode';

export const HeroVisual = () => {
  const prefersReducedMotion = useReducedMotion();
  const [isSceneReady, setIsSceneReady] = useState(false);

  // rootMargin — щоб сцена почала вантажитись трохи раніше, ніж блок
  // з'явиться на екрані, і не «клацала» вже на видимому місці
  const { ref, inView } = useInView({ triggerOnce: true, rootMargin: '200px' });

  const shouldLoadScene = inView && !prefersReducedMotion;

  return (
    <div ref={ref} className={styles.stage}>
      {/* Підсвітка-«стенд» під об'єктом: предмет стоїть на поверхні,
          а не висить у порожнечі */}
      <span className={styles.spotlight} aria-hidden="true" />
      <span className={styles.shadow} aria-hidden="true" />

      <Image
        src="/assets/img/tshirt.webp"
        alt="Футболка Є.Дріл — офіційний мерч"
        width={520}
        height={520}
        priority
        className={`${styles.still} ${isSceneReady ? styles.stillHidden : ''}`}
      />

      {shouldLoadScene && (
        <div className={`${styles.scene} ${isSceneReady ? styles.sceneReady : ''}`}>
          <Suspense fallback={null}>
            <Spline scene={SCENE_URL} onLoad={() => setIsSceneReady(true)} />
          </Suspense>
        </div>
      )}
    </div>
  );
};
