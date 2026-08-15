// src/widgets/ProductV2/VersionSwitch.tsx
// ТИМЧАСОВО (демо-дослідження): перемикач репрезентацій A|B|C того самого
// товару. Видалити після вибору фінальної версії.
'use client';

import Link from 'next/link';
import styles from './ProductV2.module.scss';

const VERSIONS = ['a', 'b', 'c'] as const;

export const VersionSwitch = ({ current, slug }: { current: string; slug: string }) => (
  <div className={styles.versionSwitch}>
    <span>версія:</span>
    {VERSIONS.map((v) => (
      <Link
        key={v}
        href={`/v2/${v}/${slug}`}
        className={styles.versionLink}
        aria-current={v === current ? 'page' : undefined}>
        {v.toUpperCase()}
      </Link>
    ))}
  </div>
);
