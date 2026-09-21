'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useInView } from 'react-intersection-observer';
import { HeroVisual } from '@/widgets/HeroVisual/HeroVisual';
import { ErrorBoundary } from '@/shared/providers/ErrorBoundary';
import heroStyles from '@/widgets/HomeHeroes/HomeHeroes.module.scss';
import visualStyles from '@/widgets/HeroVisual/HeroVisual.module.scss';
import models from './hoodie-metrics.json';
import textureDesigns from './hoodie-designs.json';
import styles from './lab.module.scss';

const description = {
  shape: 'Біле худі без шнурків, з об’ємними рукавами та м’якими складками.',
  workflow:
    'Один матеріал і вихідний PSD-шаблон для принта. Обрана модель: на ній зібрано худі «Культурний Фронт».',
};
const number = (value: number) => value.toLocaleString('uk-UA');
const size = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(2).replace('.', ',')} МіБ`;

const [model] = models;
type TextureDesign = (typeof textureDesigns)[number];

function HoodieHero({ textureDesign }: { textureDesign?: TextureDesign }) {
  const { ref, inView } = useInView({ rootMargin: '80px 0px' });
  const [show3d, setShow3d] = useState(true);
  const [revision, setRevision] = useState(0);
  const title = textureDesign ? `Худі 3 · Дизайн ${textureDesign.id}` : `Нове худі ${model.id}`;
  const sectionId = textureDesign ? `hoodie-3-design-${textureDesign.id}` : `hoodie-${model.id}`;
  const poster = textureDesign?.poster ?? model.poster;
  const design = {
    label: title,
    swatch: '#e8e5df',
    fallback: poster,
    modelUrl: model.url,
    mapUrl: textureDesign?.mapUrl,
  };
  return (
    <section
      ref={ref}
      id={sectionId}
      className={`${heroStyles.hero} ${styles.hoodieHero}`}
      aria-labelledby={`${sectionId}-title`}>
      <div className={heroStyles.heroText}>
        <p className={styles.eyebrow}>
          {textureDesign ? `Твій дизайн 0${textureDesign.id} / модель №3` : 'Обрана модель / власний hero'}
        </p>
        <h2 id={`${sectionId}-title`} className={heroStyles.heroTitle}>
          {title}
        </h2>
        <p className={heroStyles.heroSubtitle}>
          {textureDesign
            ? textureDesign.id === 1
              ? 'Біла основа з кольоровими принтами на корпусі, рукавах і капюшоні.'
              : 'Темна основа з кольоровими принтами на корпусі, рукавах і капюшоні.'
            : description.shape}
        </p>
        <dl className={styles.metrics}>
          <div>
            <dt>Файл GLB</dt>
            <dd>{size(model.bytes)}</dd>
          </div>
          <div>
            <dt>Трикутники</dt>
            <dd>{number(model.triangles)}</dd>
          </div>
          <div>
            <dt>Матеріали / примітиви</dt>
            <dd>
              {model.materials} / {model.primitives}
            </dd>
          </div>
          <div>
            <dt>{textureDesign ? 'Файл дизайну' : 'Текстури'}</dt>
            <dd>{textureDesign ? size(textureDesign.bytes) : model.textures}</dd>
          </div>
        </dl>
        <p className={styles.facts}>
          Геометрія: {number(model.originalTriangles)} → {number(model.triangles)} трикутників.
        </p>
        <p className={styles.workflow}>
          {textureDesign
            ? `Текстура «дизайн ${textureDesign.id}.png», 2048 × 2048. Та сама модель №3, світло й керування — порівняй посадку принта з усіх боків.`
            : description.workflow}
        </p>
        <div className={styles.controls} aria-label={`Перегляд: ${title}`}>
          <button type="button" aria-pressed={show3d} onClick={() => setShow3d(true)}>
            3D
          </button>
          <button type="button" aria-pressed={!show3d} onClick={() => setShow3d(false)}>
            Постер
          </button>
          <button type="button" disabled={!show3d} onClick={() => setRevision((v) => v + 1)}>
            Скинути ракурс
          </button>
        </div>
        <p className={styles.hint}>Потягни модель убік, щоб оглянути спину й рукави.</p>
      </div>
      <div className={heroStyles.heroVisualWrap}>
        {inView && show3d ? (
          <ErrorBoundary key={revision}>
            <HeroVisual designs={{ [model.id]: design }} switcher="none" />
          </ErrorBoundary>
        ) : (
          <div className={visualStyles.visual}>
            <div className={visualStyles.stage}>
              <Image
                src={poster}
                alt={title}
                fill
                sizes="(max-width: 768px) 90vw, 480px"
                className={styles.poster}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export function HoodieComparison() {
  return (
    <>
      <section className={styles.comparison} aria-labelledby="hoodie-comparison-title">
        <h2 id="hoodie-comparison-title">Худі №3 — обрана модель</h2>
        <p>
          Камера, світло й керування — ті самі, що в герої магазину. Поза екраном 3D вимикається, щоб сцени не
          навантажували пристрій.
        </p>
        <p>
          Принти на ній: <a href="#hoodie-3-design-1">Дизайн 1 — білий</a> ·{' '}
          <a href="#hoodie-3-design-2">Дизайн 2 — темний</a>
        </p>
        <p className={styles.hint}>
          Статична вебмодель з обертанням на сайті. Вихідна анімація Blender залишена в оригіналі. Розмір GLB
          означає обсяг завантаження, а не виміряний FPS.
        </p>
      </section>
      <HoodieHero />
      <section className={styles.comparison} aria-labelledby="hoodie-designs-title">
        <h2 id="hoodie-designs-title">Твої дизайни на худі №3</h2>
        <p>
          Два окремі hero для порівняння білої й темної основи. Потягни модель, щоб роздивитися принти на
          спині, рукавах і капюшоні.
        </p>
      </section>
      {textureDesigns.map((textureDesign) => (
        <HoodieHero key={`design-${textureDesign.id}`} textureDesign={textureDesign} />
      ))}
    </>
  );
}
