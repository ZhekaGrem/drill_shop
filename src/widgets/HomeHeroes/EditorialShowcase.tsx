'use client';

import { useState } from 'react';
import Image from '@/shared/components/StoreImage/StoreImage';
import Link from 'next/link';
import { ArrowRight } from '@/shared/components/Svg';
import { Button } from '@/shared/components/Button/Button';
import type { CollectionDef } from '@/widgets/ProductV2/collections';
import { HeroBlock } from './HeroBlock';
import styles from './EditorialShowcase.module.scss';

interface Props {
  collections?: CollectionDef[];
  isPending: boolean;
  isError: boolean;
  isFetching: boolean;
  onRetry: () => void;
}

/** A single interactive stage, followed by lightweight collection covers. */
export const EditorialShowcase = ({ collections, isPending, isError, isFetching, onRetry }: Props) => {
  const [selected, setSelected] = useState<Record<string, string>>({});
  const featured =
    collections?.find((collection) => collection.items.length && !collection.archivedAt) ??
    collections?.find((collection) => collection.items.length);
  const remaining = collections?.filter((collection) => collection.key !== featured?.key) ?? [];

  return (
    <div className={styles.showcase}>
      <div className={styles.masthead}>
        <span>Є.Дріл / Офіційний мерч</span>
        <Link href="/about">
          Зі Львова. Для своїх. <ArrowRight size={16} />
        </Link>
      </div>

      {featured ? (
        <HeroBlock
          col={featured}
          titleTag="h1"
          active={
            featured.items.find((item) => item.slug === selected[featured.key])?.slug ??
            featured.items[0].slug
          }
          onPick={(slug) => setSelected((previous) => ({ ...previous, [featured.key]: slug }))}
        />
      ) : (
        <section className={styles.intro} aria-busy={isPending}>
          <div>
            <p className={styles.eyebrow}>Музика стає одягом</p>
            <h1>
              Свій звук.
              <br />
              Свій мерч.
            </h1>
            <p className={styles.description}>
              Офіційні речі Щільного Drill. Обирай те, що звучить із тобою.
            </p>
            <Link href="/catalog" className={styles.catalogLink}>
              Перейти в каталог <ArrowRight size={20} />
            </Link>
          </div>
          <div className={styles.state} role="status">
            {isPending ? (
              <>
                <span className={styles.skeleton} aria-hidden="true" />
                <p>Завантажуємо колекції…</p>
              </>
            ) : isError ? (
              <>
                <p>Не вдалося завантажити колекції.</p>
                <Button variant="secondary" onClick={onRetry} loading={isFetching}>
                  Спробувати ще раз
                </Button>
              </>
            ) : (
              <p>Нові колекції готуються. Усі доступні речі — у каталозі.</p>
            )}
          </div>
        </section>
      )}

      {!!remaining.length && (
        <section className={styles.collections} aria-labelledby="home-collections-title">
          <div className={styles.sectionHead}>
            <h2 id="home-collections-title">Знайди своє</h2>
            <Link href="/catalog">
              Увесь мерч <ArrowRight size={18} />
            </Link>
          </div>
          <div className={styles.grid}>
            {remaining.map((collection) => (
              <Link key={collection.key} href={collection.href} className={styles.collection}>
                <div className={styles.cover}>
                  <Image
                    src={collection.cover}
                    alt=""
                    fill
                    sizes="(max-width: 600px) 90vw, (max-width: 1000px) 45vw, 30vw"
                  />
                </div>
                <div className={styles.caption}>
                  <div>
                    <h3>{collection.title}</h3>
                    {collection.archivedAt && <p>Архів колекції</p>}
                  </div>
                  <ArrowRight size={22} />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
