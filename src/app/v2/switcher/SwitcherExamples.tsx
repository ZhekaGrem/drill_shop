'use client';
// Сім механік перемикача на живих колекціях. Кожна показана двічі: на
// «Щільному Дрілі» (16 товарів — найгірший випадок) і на «Ніжній Оксані»
// (6 товарів). Під кожним рядом — порахована ширина: скільки пікселів
// займе ряд і чи влізе він у 390px екран без скролу.
import { useState } from 'react';
import Image from 'next/image';
import { Page } from '@/shared/components/Page/Page';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { useCollections } from '@/widgets/ProductV2/useCollections';
import type { CollectionDef } from '@/widgets/ProductV2/collections';
import { HeroVisual } from '@/widgets/HeroVisual/HeroVisual';
import { CompassSwitcher } from '@/shared/components/CompassSwitcher/CompassSwitcher';
import styles from './switcher.module.scss';

// Ширина екрана найпоширенішого телефона мінус поля сторінки
const PHONE_CONTENT = 390 - 32;

type Variant =
  | 'swatch'
  | 'chip-full'
  | 'chip-short'
  | 'tile-40'
  | 'tile-48'
  | 'tile-crop-40'
  | 'tile-crop-48'
  | 'tile-vertical'
  | 'tile-caption';

interface VariantDef {
  id: Variant;
  title: string;
  hint: string;
  /** ширина одного елемента + проміжок, для підрахунку ряду */
  step: number;
}

const VARIANTS: VariantDef[] = [
  { id: 'swatch', title: 'Свотчі 28 px (як зараз)', hint: 'базлайн для порівняння', step: 28 + 10 },
  {
    id: 'chip-full',
    title: 'Чипи з повною назвою',
    hint: 'назви товарів як є — видно, скільки місця вони просять',
    step: 150,
  },
  {
    id: 'chip-short',
    title: 'Чипи з першим словом',
    hint: 'скорочення до одного слова: коротко, але «Оксана» повторюється',
    step: 92,
  },
  { id: 'tile-40', title: 'Картки-мініатюри 40 px', hint: 'квадрат, графіка вже вгадується', step: 40 + 8 },
  {
    id: 'tile-48',
    title: 'Картки-мініатюри 48 px',
    hint: 'квадрат, принт читається впевнено',
    step: 48 + 8,
  },
  {
    id: 'tile-crop-40',
    title: 'Картки 40 px, кроп на принт',
    hint: 'той самий рендер, але наближений на груди — видно графіку, а не силует',
    step: 40 + 8,
  },
  {
    id: 'tile-crop-48',
    title: 'Картки 48 px, кроп на принт',
    hint: 'кроп працює для всіх товарів однаково, бо рендери приведені до єдиного масштабу',
    step: 48 + 8,
  },
  {
    id: 'tile-vertical',
    title: 'Вертикальні картки 44 × 56',
    hint: 'пропорція футболки — менше порожнечі по боках',
    step: 44 + 8,
  },
  {
    id: 'tile-caption',
    title: 'Картки 48 px + підпис',
    hint: 'мініатюра і назва разом — найзрозуміліше і найдорожче за місцем',
    step: 76 + 8,
  },
];

const firstWord = (name: string) => name.split(/[\s·]+/)[0];

const Row = ({ col, variant }: { col: CollectionDef; variant: Variant }) => {
  const [active, setActive] = useState(col.items[0]?.slug);

  return (
    <div className={styles.rowScroll}>
      <div className={`${styles.row} ${styles[variant]}`} role="group" aria-label={`Товари: ${col.title}`}>
        {col.items.map((it) => {
          const on = it.slug === active;
          const label = it.design.label;
          const pick = () => setActive(it.slug);

          if (variant === 'swatch') {
            return (
              <button
                key={it.slug}
                type="button"
                aria-pressed={on}
                aria-label={label}
                title={label}
                onClick={pick}
                className={`${styles.swatch} ${on ? styles.on : ''}`}
                style={{ background: it.design.swatch }}
              />
            );
          }

          if (variant === 'chip-full' || variant === 'chip-short') {
            return (
              <button
                key={it.slug}
                type="button"
                aria-pressed={on}
                title={label}
                onClick={pick}
                className={`${styles.chip} ${on ? styles.on : ''}`}>
                {variant === 'chip-short' ? firstWord(label) : label}
              </button>
            );
          }

          const cropped = variant === 'tile-crop-40' || variant === 'tile-crop-48';
          return (
            <button
              key={it.slug}
              type="button"
              aria-pressed={on}
              aria-label={label}
              title={label}
              onClick={pick}
              className={`${styles.tile} ${on ? styles.on : ''}`}>
              {cropped ? (
                <span className={styles.crop}>
                  <Image src={it.design.fallback} alt="" width={220} height={220} unoptimized />
                </span>
              ) : (
                <Image src={it.design.fallback} alt="" width={96} height={120} unoptimized />
              )}
              {variant === 'tile-caption' && <span className={styles.caption}>{label}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const Block = ({ col, v }: { col: CollectionDef; v: VariantDef }) => {
  const width = col.items.length * v.step;
  const fits = width <= PHONE_CONTENT;

  return (
    <div className={styles.block}>
      <div className={styles.blockHead}>
        <span className={styles.collectionName}>{col.title}</span>
        <span className={styles.metrics}>
          {col.items.length} товарів · ряд ≈ {width} px ·{' '}
          <b className={fits ? styles.ok : styles.warn}>
            {fits ? 'влазить у телефон' : 'потрібен горизонтальний скрол'}
          </b>
        </span>
      </div>
      <Row col={col} variant={v.id} />
    </div>
  );
};

// Компас у зборі зі сценою: свайп стрічки перемикає текстуру на 3D-моделі.
// Сцена — той самий HeroVisual, що на головній, без жодної правки логіки:
// вона контрольована (value/onChange), тож компас підставляється замість
// свотчів так само, як підставився б будь-який інший перемикач.
const CompassDemo = ({
  col,
  crop = true,
  size = 60,
}: {
  col: CollectionDef;
  crop?: boolean;
  size?: number;
}) => {
  const [active, setActive] = useState(col.items[0]?.slug);
  const items = col.items.map((it) => ({
    key: it.slug,
    label: it.design.label,
    image: it.design.fallback,
  }));

  return (
    <div className={styles.compassDemo}>
      <HeroVisual designs={col.designs} value={active} onChange={setActive} switcher="none" />
      <CompassSwitcher items={items} value={active} onChange={setActive} size={size} crop={crop} />
    </div>
  );
};

export const SwitcherExamples = () => {
  const { data: collections } = useCollections();
  const dril = collections?.find((c) => c.key === 'shchilnyi-dril');
  const oksana = collections?.find((c) => c.key === 'nizhna-oksana');

  return (
    <Page>
      <PageHeader
        title="Перемикач товарів — приклади"
        description="Варіант «Г» з брифу: компас, чипи й збільшені картки замість дрібних свотчів. Живі колекції з бази. Сторінка існує лише в DEV_MODE."
      />

      {!collections && <p className={styles.loading}>Завантажуємо колекції…</p>}

      {dril && (
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Компас · у зборі з 3D-сценою</h2>
          <p className={styles.cardHint}>
            Свайп стрічки перемикає текстуру на моделі. Активний товар примагнічується до осі, периферія
            меншає й гасне, під центром — назва. Сцену не змінювали жодним рядком.
          </p>
          <CompassDemo col={dril} />
        </section>
      )}

      {dril && (
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Компас · повні картки-мініатюри</h2>
          <p className={styles.cardHint}>
            Та сама механіка, але в кадрі товар цілком: видно силует і колір тканини замість графіки принта.
            Порівняй із кропом вище
          </p>
          <CompassDemo col={dril} crop={false} />
        </section>
      )}

      {dril && (
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Компас · картки 72 px</h2>
          <p className={styles.cardHint}>
            Більший калібр: принт читається впевненіше, але в кадр влазить менше сусідів
          </p>
          <CompassDemo col={dril} size={72} />
        </section>
      )}

      {oksana && (
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Компас · «Ніжна Оксана» (6 товарів)</h2>
          <p className={styles.cardHint}>Та сама механіка на короткій колекції</p>
          <CompassDemo col={oksana} />
        </section>
      )}

      {collections &&
        VARIANTS.map((v) => (
          <section key={v.id} className={styles.card}>
            <h2 className={styles.cardTitle}>{v.title}</h2>
            <p className={styles.cardHint}>{v.hint}</p>
            {dril && <Block col={dril} v={v} />}
            {oksana && <Block col={oksana} v={v} />}
          </section>
        ))}
    </Page>
  );
};
