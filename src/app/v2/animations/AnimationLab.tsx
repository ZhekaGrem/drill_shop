'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useInView } from 'react-intersection-observer';
import { Page } from '@/shared/components/Page/Page';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { ErrorBoundary } from '@/shared/providers/ErrorBoundary';
import { HeroVisual } from '@/widgets/HeroVisual/HeroVisual';
import type { Design } from '@/widgets/HeroVisual/designs';
import type { MotionPreset } from '@/widgets/HeroVisual/motionPresets';
import models from '../lab/hoodie-metrics.json';
import designs from '../lab/hoodie-designs.json';
import styles from './animations.module.scss';

const GARMENTS: { id: string; title: string; design: Design }[] = [
  {
    id: 'shirt',
    title: 'Футболка',
    design: {
      label: 'Футболка · Тертий калач',
      swatch: '#b6d39a',
      modelUrl: '/3d/models/tshirt.glb?v=2',
      mapUrl: '/3d/textures/lab/tshirt-kalach-test.jpg',
      fallback: '/assets/img/kalach-test-fallback.webp',
    },
  },
  {
    id: 'hoodie',
    title: 'Худі №3',
    design: {
      label: 'Худі №3 · Темний дизайн',
      swatch: '#292b29',
      modelUrl: models.find((model) => model.id === 3)!.url,
      mapUrl: designs.find((design) => design.id === 2)!.mapUrl,
      fallback: designs.find((design) => design.id === 2)!.poster,
    },
  },
];

const PRESETS: { id: MotionPreset; title: string; timing: string; description: string; use: string }[] = [
  {
    id: 'turntable',
    title: 'Чистий оберт 360°',
    timing: '12 с / оберт',
    description: 'Рівномірний оберт лише навколо вертикальної осі. Без нахилів і руху вгору-вниз.',
    use: 'Для спокійної демонстрації крою та принта з усіх боків.',
  },
  {
    id: 'showcase',
    title: 'Перед → спина',
    timing: '12 с / цикл',
    description: 'Зупинка на переді й спині, між ними — плавні півоберти з розгоном і гальмуванням.',
    use: 'Для моделей із принтами з обох боків: дає час прочитати дизайн.',
  },
  {
    id: 'pendulum',
    title: 'Маятник',
    timing: '8 с / цикл · ±35°',
    description: 'Повороти ліворуч і праворуч. Передній принт увесь час залишається в полі зору.',
    use: 'Для hero, де головний акцент — принт на грудях.',
  },
  {
    id: 'float',
    title: 'Легке зависання',
    timing: '8 с / цикл',
    description: 'Невеликий рух угору-вниз із м’якими нахилами та поворотом на ±12°.',
    use: 'Для виразнішого hero: модель рухається, але не відвертається від глядача.',
  },
  {
    id: 'current',
    title: 'Початковий рух',
    timing: 'Мінлива швидкість',
    description:
      'Постійний оберт із нерівномірною швидкістю, маятниковими нахилами й легким вертикальним дрейфом.',
    use: 'Початковий рух для порівняння; тепер використовується в концепції «Стрітвір».',
  },
];

function GarmentPreview({
  garment,
  preset,
  paused,
}: {
  garment: (typeof GARMENTS)[number];
  preset: MotionPreset;
  paused: boolean;
}) {
  const { ref, inView } = useInView({ rootMargin: '0px' });
  return (
    <div ref={ref} className={styles.garment}>
      <h3>{garment.title}</h3>
      <div className={styles.stage}>
        {inView ? (
          <ErrorBoundary>
            <HeroVisual
              designs={{ [garment.id]: garment.design }}
              switcher="none"
              motionPreview={{ preset, paused }}
            />
          </ErrorBoundary>
        ) : (
          <Image
            src={garment.design.fallback}
            alt={garment.design.label}
            fill
            sizes="(max-width: 760px) 90vw, 440px"
            className={styles.poster}
          />
        )}
      </div>
    </div>
  );
}

function AnimationExample({ preset, index }: { preset: (typeof PRESETS)[number]; index: number }) {
  const [paused, setPaused] = useState(false);
  const [revision, setRevision] = useState(0);
  return (
    <section id={preset.id} className={styles.example} aria-labelledby={`${preset.id}-title`}>
      <div className={styles.heading}>
        <div>
          <p className={styles.kicker}>
            {String(index + 1).padStart(2, '0')} / {preset.timing}
          </p>
          <h2 id={`${preset.id}-title`}>{preset.title}</h2>
        </div>
        <div className={styles.controls} role="group" aria-label={`Керування: ${preset.title}`}>
          <button type="button" aria-pressed={paused} onClick={() => setPaused((value) => !value)}>
            {paused ? 'Продовжити' : 'Пауза'}
          </button>
          <button
            type="button"
            onClick={() => {
              setRevision((value) => value + 1);
              setPaused(false);
            }}>
            Почати спочатку
          </button>
        </div>
      </div>
      <p>{preset.description}</p>
      <p className={styles.use}>{preset.use}</p>
      <div key={revision} className={styles.pair}>
        {GARMENTS.map((garment) => (
          <GarmentPreview key={garment.id} garment={garment} preset={preset.id} paused={paused} />
        ))}
      </div>
      <p className={styles.hint}>
        Потягни модель убік, щоб змінити ракурс. «Почати спочатку» повертає початковий показ.
      </p>
    </section>
  );
}

export function AnimationLab() {
  return (
    <Page>
      <PageHeader
        title="Лабораторія анімацій 3D"
        description="Чотири нові рухи й початковий варіант. Кожен — на футболці та худі з однаковою камерою й освітленням."
      />
      <Link href="/v2/dev" className={styles.back}>
        ← Dev-панель
      </Link>
      <nav className={styles.navigation} aria-label="Варіанти анімацій">
        {PRESETS.map((preset) => (
          <a key={preset.id} href={`#${preset.id}`}>
            {preset.title}
          </a>
        ))}
      </nav>
      <details className={styles.analysis}>
        <summary>Як працює початковий рух</summary>
        <p>
          Базова швидкість — 0,22 рад/с (близько 29 секунд на оберт), дві хвилі змінюють її темп. Модель
          нахиляється до 3,2° вперед-назад та до 2,6° убік. Ручний оберт має інерцію. Вітер тканини й стрибок
          по кліку зараз вимкнені.
        </p>
        <p>
          Нові варіанти тут змінюють положення всієї моделі. Крій і тканина не деформуються. На сайті рух
          обирається разом із дизайном, а тут кожен приклад показує свій фіксований варіант.
        </p>
      </details>
      <p className={styles.hint}>
        Поза екраном показуємо постер, а 3D-сцену вимикаємо. При поверненні анімація починається спочатку.
      </p>
      {PRESETS.map((preset, index) => (
        <AnimationExample key={preset.id} preset={preset} index={index} />
      ))}
    </Page>
  );
}
