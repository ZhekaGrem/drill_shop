'use client';
// Лабораторія героїв: приклади карток героя (стилі HomeHeroes) з 3D-моделями
// поза БД. Кожен запис EXAMPLES — окремий hero зі своєю сценою (сцени
// вантажаться ліниво самим HeroVisual при попаданні у вʼюпорт).
import { BobyOksanaPreview } from './BobyOksanaPreview';
import { HoodieComparison } from './HoodieComparison';
import { Page } from '@/shared/components/Page/Page';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { useDesign } from '@/shared/hooks/useDesign';
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
    key: 'terytyi-kalach',
    title: 'Тертий калач (тест розгортки, v5)',
    capsule: 'тест',
    capsuleColor: '#8fbf6e',
    description:
      'Тестова UV-розгортка «теритий калач тест v5.png» на бойовій моделі футболки: «КАЛАЧ» на зеленому переді, «ТЕРТИЙ» на рожевій спині, рожева окантовка коміра; рукави в файлі не зафарбовані — білі.',
    facts:
      'дефолтна tshirt.glb · своп текстури 2048² · джерело: 3d/artists/varyatstvo/теритий калач тест v5.png (8K)',
    design: {
      label: 'Тертий калач',
      swatch: 'linear-gradient(135deg,#b6d39a 50%,#f2b8c0 50%)',
      fallback: '/assets/img/kalach-test-fallback.webp',
      mapUrl: '/3d/textures/lab/tshirt-kalach-test.jpg',
    },
  },
  {
    key: 'hoodie-brock',
    title: 'BrockCreative',
    capsule: 'вже в проді',
    capsuleColor: '#101413',
    description:
      'Мокап з 3d/source/Hoodie Mockup BrockCreative: стояча A-pose, принт BROCK CREATIVE. Ця сама модель вже живе на головній як худі колекції «Гонорове варʼятство».',
    facts: '84k полігонів · 0.8 МБ GLB · чинний public/3d/models/hoodie.glb — без дубля файла',
    design: {
      label: 'BrockCreative',
      swatch: '#101413',
      fallback: '/assets/img/hoodie-brock-fallback.webp',
      modelUrl: '/3d/models/hoodie.glb',
    },
  },
];

export const LabHero = () => {
  const design = useDesign();
  // К2/К3 перефарбовують .designCapsule повністю самі (globals.css) — той
  // самий фікс, що й у capsuleStyle() (widgets/ProductV2/collections.ts):
  // без інлайнового background нема з чим битись, і клас керує капсулою сам,
  // без !important.
  const skinOwnsCapsule = design === 'streetwear' || design === 'tactile';

  return (
    <Page>
      <PageHeader
        title="Hero Lab · худі №3"
        description="Приміряння колекції «Боби Оксана», обрана модель худі та два твої дизайни на ній — у hero магазину. Сторінка доступна лише в DEV_MODE."
      />

      <BobyOksanaPreview />
      <HoodieComparison />
      <details className={styles.legacy}>
        <summary>Попередні тести: футболка й чинне худі</summary>
        {EXAMPLES.map((ex) => (
          <section key={ex.key} className={heroStyles.hero}>
            <div className={heroStyles.heroText}>
              <h2 className={heroStyles.heroTitle}>
                {ex.title}
                <span
                  className={`${heroStyles.capsule} designCapsule`}
                  style={skinOwnsCapsule ? undefined : { background: ex.capsuleColor }}>
                  {ex.capsule}
                </span>
              </h2>
              <p className={heroStyles.heroSubtitle}>{ex.description}</p>
              <p className={styles.facts}>{ex.facts}</p>
            </div>
            <div className={heroStyles.heroVisualWrap}>
              <HeroVisual designs={{ [ex.key]: ex.design }} switcher="dots" />
            </div>
          </section>
        ))}
      </details>
    </Page>
  );
};
