'use client';
// Лабораторія героїв: приклади карток героя (стилі HomeHeroes) з 3D-моделями
// поза БД. Кожен запис EXAMPLES — окремий hero зі своєю сценою (сцени
// вантажаться ліниво самим HeroVisual при попаданні у в'юпорт).
import { Page } from '@/shared/components/Page/Page';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { HeroVisual } from '@/widgets/HeroVisual/HeroVisual';
import type { Design } from '@/widgets/HeroVisual/designs';
import heroStyles from '@/widgets/HomeHeroes/HomeHeroes.module.scss';
import styles from './lab.module.scss';

interface LabExample {
  key: string;
  title: string;
  capsule: string;
  capsuleColor: string;
  description: string;
  facts: string;
  design: Design;
}

const EXAMPLES: LabExample[] = [
  {
    key: 'hoodie-mockup',
    title: 'Hoodie Mockup',
    capsule: 'приклад',
    capsuleColor: '#2ea8e0',
    description:
      '«Hoodie Mockup Final Template» у живому 3D: драпірована поза з Alembic-кешу, шаблонний принт FRONT. Покрути пальцем або мишею.',
    facts: '96k полігонів · 0.87 МБ GLB (meshopt+квантизація) · текстури 2048² · джерело в 3d/ (поза git)',
    design: {
      label: 'Hoodie Mockup',
      swatch: '#2ea8e0',
      fallback: '/assets/img/hoodie-mockup-fallback.webp',
      modelUrl: '/3d/models/hoodie-mockup.glb',
    },
  },
  {
    key: 'hoodie-brock',
    title: 'BrockCreative',
    capsule: 'вже в проді',
    capsuleColor: '#101413',
    description:
      'Другий мокап з 3d/ — «Hoodie Mockup BrockCreative»: стояча A-pose, принт BROCK CREATIVE. Ця сама модель вже живе на головній як худі колекції «Гонорове варʼятство».',
    facts: '84k полігонів · 0.8 МБ GLB · чинний public/3d/models/hoodie.glb — без дубля файла',
    design: {
      label: 'BrockCreative',
      swatch: '#101413',
      fallback: '/assets/img/hoodie-brock-fallback.webp',
      modelUrl: '/3d/models/hoodie.glb',
    },
  },
];

export const LabHero = () => (
  <Page>
    <PageHeader
      title="Hero Lab"
      description="Приклади героїв з моделями поза колекціями БД. Сторінка існує лише в DEV_MODE."
    />

    {EXAMPLES.map((ex, i) => (
      <section key={ex.key} className={heroStyles.hero}>
        <div className={heroStyles.heroText}>
          {i === 0 ? (
            <h1 className={heroStyles.heroTitle}>
              {ex.title}
              <span className={`${heroStyles.capsule} designCapsule`} style={{ background: ex.capsuleColor }}>
                {ex.capsule}
              </span>
            </h1>
          ) : (
            <h2 className={heroStyles.heroTitle}>
              {ex.title}
              <span className={`${heroStyles.capsule} designCapsule`} style={{ background: ex.capsuleColor }}>
                {ex.capsule}
              </span>
            </h2>
          )}
          <p className={heroStyles.heroSubtitle}>{ex.description}</p>
          <p className={styles.facts}>{ex.facts}</p>
        </div>
        <div className={heroStyles.heroVisualWrap}>
          <HeroVisual designs={{ [ex.key]: ex.design }} switcher="dots" />
        </div>
      </section>
    ))}
  </Page>
);
