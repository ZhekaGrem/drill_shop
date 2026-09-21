'use client';
// Приміряння колекції «Боби Оксана» поза БД: той самий hero, що на головній,
// спільний крій hoodie-3.glb і шість текстур, які міняються свопом (texture3dUrl).
// Назви, свотчі й порядок — як у scripts/boby-oksana/create-boby-oksana.cjs.
import { HeroVisual } from '@/widgets/HeroVisual/HeroVisual';
import type { Design } from '@/widgets/HeroVisual/designs';
import heroStyles from '@/widgets/HomeHeroes/HomeHeroes.module.scss';
import styles from './lab.module.scss';

const MODEL_URL = '/3d/models/hoodie-3.glb';

const SERIES: [name: string, file: string, swatch: string][] = [
  ['Боба Червона Оксана', 'chervona', '#c8102e'],
  ['Боба Філовето Оксана', 'fioletova', '#8b2fc9'],
  ['Боба Зелена Оксана', 'zelena', '#35d221'],
  ['Боба Жовта Оксана', 'zhovta', '#f5d800'],
  ['Боба Білонька Оксана', 'bilonka', '#f4f2f7'],
  ['Боба Рунічна Оксана', 'runichna', '#74ad40'],
];

const DESIGNS: Record<string, Design> = Object.fromEntries(
  SERIES.map(([label, file, swatch]) => [
    file,
    {
      label,
      swatch,
      fallback: `/assets/img/lab/boby-oksana-${file}.webp`,
      modelUrl: MODEL_URL,
      mapUrl: `/3d/textures/dril/hoodie-oksana-${file}.webp`,
    },
  ])
);

export function BobyOksanaPreview() {
  return (
    <section className={heroStyles.hero} aria-labelledby="boby-oksana-title">
      <div className={heroStyles.heroText}>
        <p className={styles.eyebrow}>Приміряння колекції / у продажу з 2026-09-21</p>
        <h2 id="boby-oksana-title" className={heroStyles.heroTitle}>
          Боби Оксана
        </h2>
        <p className={heroStyles.heroSubtitle}>
          Шість худі з принтами «Ніжної Оксани» і «Батятичі Блек Метал Туром» на всю спину.
        </p>
        <p className={styles.facts}>
          hoodie-3.glb · своп текстури 2048² WebP без втрат · джерело: 3d/серія боб ніжна оксана /дизайни.pdf
        </p>
        <p className={styles.hint}>Крапки перемикають дизайн. Потягни модель, щоб глянути на спину.</p>
      </div>
      <div className={heroStyles.heroVisualWrap}>
        <HeroVisual designs={DESIGNS} switcher="dots" />
      </div>
    </section>
  );
}
