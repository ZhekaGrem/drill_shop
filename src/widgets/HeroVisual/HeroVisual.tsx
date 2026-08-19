// src/widgets/HeroVisual/HeroVisual.tsx
// 3D-футболка в герої. Сцена локальна (public/model/tshirt.glb) і рендериться
// через React Three Fiber — раніше вона вантажилась із хостингу Spline, через
// що ми не мали доступу до камери й компенсували кадрування CSS-масштабом.
// Дизайни перемикаються свотчами: сцені передається лише URL мапи, статичному
// фолбеку — своє фото, тож перемикач працює і при reduced-motion без 3D.
//
// Порядок завантаження лишився той самий: сцена підвантажується лише коли блок
// реально потрапив у вʼюпорт, і взагалі не вантажиться, якщо система просить
// менше руху. Статичне фото — не «заглушка на час», а повноцінний фолбек.
'use client';

import { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import Image from 'next/image';
import { useInView } from 'react-intersection-observer';
import { CompassSwitcher } from '@/shared/components/CompassSwitcher/CompassSwitcher';
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
  /**
   * Вигляд перемикача:
   *   `compass` — барабан із картками-мініатюрами, активний товар по осі
   *               (рішення власника 2026-08-19: кольорові свотчі не розрізняли
   *               товари, бо колекція фізично одноколірна — див. дизайн-бриф);
   *   `dots`    — кольорові свотчі (історичний варіант);
   *   `thumbs`  — ряд міні-фото;
   *   `none`    — сцена без власного ряду, перемикач стоїть зовні.
   * Сцена від цього не міняється: вона контрольована через value/onChange,
   * і їй байдуже, хто саме викликав зміну.
   */
  switcher?: 'compass' | 'dots' | 'thumbs' | 'none';
  /**
   * Скільки місця на десктопі має ряд перемикачів.
   * `stage` — рівно під сценою: у герої головної праворуч від тексту ширшати
   * нікуди, а колекція з 16 дизайнами інакше складається в другий ряд і важить
   * більше за саму сцену.
   * `column` — вся колонка: на сторінці товару сцена стоїть у власній картці,
   * і обмеження шириною сцени тільки різало б останню мініатюру.
   */
  switcherWidth?: 'stage' | 'column';
};

export const HeroVisual = ({
  designs = DESIGNS,
  value,
  onChange,
  switcher = 'dots',
  switcherWidth = 'stage',
}: Props) => {
  // Рішення власника (2026-08-12): 3D показуємо всім, ігноруючи
  // prefers-reduced-motion. Компромісний режим (статична 3D + drag) — в історії.
  const [inner, setInner] = useState(() => Object.keys(designs)[0]);
  const design = value ?? inner;
  const setDesign = onChange ?? setInner;
  // Union записів звужуємо до спільного інтерфейсу: modelUrl є не в усіх.
  // Колекція без товарів (designs = {}) — легітимний стан: useCollections.ts
  // окремо його обробляє. Без цієї перевірки active був undefined і перший же
  // доступ до active.modelUrl нижче валив сторінку в білий екран.
  const active: Design | undefined = designs[design];
  // Колекція з одного товару: перемикати нічого, тож ряду немає взагалі —
  // самотня картка з підписом під сценою виглядала як недороблений контрол
  const soloItem = Object.keys(designs).length <= 1 ? design : null;
  // Готовність памʼятаємо ЯК МОДЕЛЬ: перемкнули GLB — активна модель ще не
  // готова, канвас сам ховається за фолбек до onReady нової сцени
  const activeModel = active?.modelUrl ?? 'tshirt';
  const [readyModel, setReadyModel] = useState<string | null>(null);
  const isSceneReady = readyModel === activeModel;

  // rootMargin — щоб сцена почала вантажитись трохи раніше, ніж блок
  // зʼявиться на екрані, і не «клацала» вже на видимому місці
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

  // Ранній вихід ПІСЛЯ всіх хуків (правила хуків): порожня колекція більше не
  // валить сторінку, а просто не малює сцену.
  if (!active) return null;

  return (
    <div className={styles.visual}>
      <div ref={ref} className={styles.stage} {...dragHandlers}>
        {/* Підсвітка-«стенд» під обʼєктом: предмет стоїть на поверхні,
          а не висить у порожнечі */}
        <span className={styles.spotlight} aria-hidden="true" />
        <span className={styles.shadow} aria-hidden="true" />

        <Image
          src={active.fallback}
          // Назва товару приходить з active.label. Раніше тут була захардкоджена
          // «Ніжна Оксана» — компонент став галереєю довільної колекції, і той
          // самий alt віддавався для КОЖНОГО товару сайту.
          alt={`${active.label} — офіційний мерч є.Дріл`}
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

      {switcher === 'compass' && soloItem === null && (
        <CompassSwitcher
          items={Object.keys(designs).map((key) => ({
            key,
            label: designs[key].label,
            image: designs[key].fallback,
          }))}
          value={design}
          onChange={setDesign}
          crop={false}
        />
      )}

      {/* Ряд ховається, коли перемикати нічого (компас, зовнішній перемикач
          або колекція з одного товару). Атрибут hidden тут не працює: власний
          display:flex класу перебиває display:none з UA-стилів. */}
      <div
        className={`${styles.designSwitcher} ${switcherWidth === 'column' ? styles.designSwitcherColumn : ''}`}
        role="group"
        aria-label="Товари колекції"
        style={
          switcher === 'none' || switcher === 'compass' || soloItem !== null
            ? { display: 'none' }
            : undefined
        }>
        {Object.keys(designs).map((key) => (
          <button
            key={key}
            type="button"
            className={switcher === 'thumbs' ? styles.thumb : styles.swatch}
            style={{ '--swatch-color': designs[key].swatch } as CSSProperties}
            aria-label={designs[key].label}
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
