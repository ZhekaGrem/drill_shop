// src/widgets/HeroVisual/HeroVisual.tsx
// 3D-футболка в герої. Сцена локальна (public/model/tshirt.glb) і рендериться
// через React Three Fiber — раніше вона вантажилась із хостингу Spline, через
// що ми не мали доступу до камери й компенсували кадрування CSS-масштабом.
// Дизайни перемикаються свотчами: сцені передається лише URL мапи, статичному
// фолбеку — своє фото, тож перемикач працює і при reduced-motion без 3D.
//
// Порядок завантаження лишився той самий: сцена підвантажується лише коли блок
// реально потрапив у в'юпорт, і взагалі не вантажиться, якщо система просить
// менше руху. Статичне фото — не «заглушка на час», а повноцінний фолбек.
'use client';

import { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import Image from 'next/image';
import { useInView } from 'react-intersection-observer';
import { useDragRotation } from './useDragRotation';
import { DESIGNS } from './designs';
import type { Design } from './designs';
import styles from './HeroVisual.module.scss';

// Окремий чанк: three і drei не потрапляють у бандл головної сторінки
const TshirtScene = lazy(() => import('./TshirtScene'));

type Props = {
  /** Власний набір дизайнів (герой колекції); без нього — основний DESIGNS */
  designs?: Record<string, Design>;
  /** Контрольований режим (герой-магазин тримає вибір у себе) */
  value?: string;
  onChange?: (key: string) => void;
  /** Вигляд перемикача: крапки-кольори або міні-фото (різнорідні предмети) */
  switcher?: 'dots' | 'thumbs';
};

export const HeroVisual = ({ designs = DESIGNS, value, onChange, switcher = 'dots' }: Props) => {
  // Рішення власника (2026-08-12): 3D показуємо всім, ігноруючи
  // prefers-reduced-motion. Компромісний режим (статична 3D + drag) — в історії.
  const [inner, setInner] = useState(() => Object.keys(designs)[0]);
  const design = value ?? inner;
  const setDesign = onChange ?? setInner;
  // Union записів звужуємо до спільного інтерфейсу: modelUrl є не в усіх
  const active: Design = designs[design];
  // Готовність пам'ятаємо ЯК МОДЕЛЬ: перемкнули GLB — активна модель ще не
  // готова, канвас сам ховається за фолбек до onReady нової сцени
  const activeModel = active.modelUrl ?? 'tshirt';
  const [readyModel, setReadyModel] = useState<string | null>(null);
  const isSceneReady = readyModel === activeModel;

  // rootMargin — щоб сцена почала вантажитись трохи раніше, ніж блок
  // з'явиться на екрані, і не «клацала» вже на видимому місці
  const { ref, inView } = useInView({ triggerOnce: true, rootMargin: '200px' });
  // Драг-обертання: обробники на stage, сцена читає ref покадрово
  const { dragRef, handlers: dragHandlers } = useDragRotation();

  const shouldLoadScene = inView;

  const handleSceneReady = useCallback(() => setReadyModel(activeModel), [activeModel]);

  // Префетч решти мап і моделей після першої готовності: свопи без пауз
  useEffect(() => {
    if (!readyModel) return;
    for (const { mapUrl, modelUrl } of Object.values(designs)) {
      if (mapUrl) new window.Image().src = mapUrl;
      if (modelUrl) fetch(modelUrl).catch(() => undefined);
    }
  }, [readyModel, designs]);

  return (
    <div className={styles.visual}>
      <div ref={ref} className={styles.stage} {...dragHandlers}>
        {/* Підсвітка-«стенд» під об'єктом: предмет стоїть на поверхні,
          а не висить у порожнечі */}
        <span className={styles.spotlight} aria-hidden="true" />
        <span className={styles.shadow} aria-hidden="true" />

        <Image
          src={active.fallback}
          alt={`Футболка «Ніжна Оксана», ${active.label} дизайн — офіційний мерч Є.Дріл`}
          width={1200}
          height={1200}
          priority
          className={`${styles.still} ${isSceneReady ? styles.stillHidden : ''}`}
        />

        {shouldLoadScene && (
          <div className={`${styles.scene} ${isSceneReady ? styles.sceneReady : ''}`}>
            <Suspense fallback={null}>
              {/* key: зміна МОДЕЛІ ремонтує сцену (гарантований onReady і рефіт
                камери), свопи текстур key не змінюють — граються без ремонту */}
              <TshirtScene
                key={active.modelUrl ?? 'tshirt'}
                onReady={handleSceneReady}
                mapUrl={active.mapUrl}
                modelUrl={active.modelUrl}
                dragRef={dragRef}
              />
            </Suspense>
          </div>
        )}
      </div>

      <div className={styles.designSwitcher} role="group" aria-label="Дизайн футболки">
        {Object.keys(designs).map((key) => (
          <button
            key={key}
            type="button"
            className={switcher === 'thumbs' ? styles.thumb : styles.swatch}
            style={{ '--swatch-color': designs[key].swatch } as CSSProperties}
            aria-label={`Дизайн: ${designs[key].label}`}
            aria-pressed={design === key}
            onClick={() => setDesign(key)}>
            {switcher === 'thumbs' && (
              <Image src={designs[key].fallback} alt="" width={56} height={56} loading="lazy" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
