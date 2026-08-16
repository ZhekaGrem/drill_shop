// src/app/v2/audit/AuditFindings.tsx
// Автоматичні перевірки даних колекцій: конфлікти нумерації, відсутні
// звʼязки (текстура/рендер/свотч), дубльовані текстури, чернетки, архів.
// Джерело — той самий GET /collections, що й списки нижче.
'use client';

import styles from './audit.module.scss';

interface FindingsImage {
  kind: string;
}

interface FindingsProduct {
  slug: string;
  name: string;
  collectionOrder: number;
  texture3dUrl: string | null;
  switcherSwatch: string | null;
  model3dPath: string | null;
  images: FindingsImage[];
}

export interface FindingsCollection {
  slug: string;
  title: string;
  archivedAt: string | null;
  products: FindingsProduct[];
}

type Level = 'warn' | 'info';
interface Finding {
  level: Level;
  text: string;
}

const computeFindings = (collections: FindingsCollection[]): Finding[] => {
  const out: Finding[] = [];

  for (const col of collections) {
    const orders = col.products.map((p) => p.collectionOrder);
    const maxOrder = Math.max(...orders, -1);

    // Пропуски нумерації: ендпоінт віддає лише активні товари, тож діра
    // означає деактивований/видалений товар, який досі тримає позицію
    const missing = [];
    for (let i = 0; i <= maxOrder; i++) if (!orders.includes(i)) missing.push('#' + i);
    if (missing.length)
      out.push({
        level: 'warn',
        text: `«${col.title}»: пропущені позиції ${missing.join(', ')} — товар прихований або видалений, порядок у героя має дірку`,
      });

    const dupes = orders.filter((o, i) => orders.indexOf(o) !== i);
    if (dupes.length)
      out.push({
        level: 'warn',
        text: `«${col.title}»: дубльовані позиції ${[...new Set(dupes)].map((d) => '#' + d).join(', ')}`,
      });

    for (const p of col.products) {
      // Текстура обовʼязкова лише для базової футболки; у власних моделей
      // (худі/вішак/walking) дизайн запечений у GLB — null легітимний
      const needsTexture = p.model3dPath === '/3d/models/tshirt.glb';
      const gaps = [
        needsTexture && !p.texture3dUrl && 'текстури',
        !p.images.some((i) => i.kind === 'render3d') && 'рендера',
        !p.switcherSwatch && 'свотча',
        !p.model3dPath && 'моделі',
      ].filter(Boolean);
      if (gaps.length) out.push({ level: 'warn', text: `${p.slug}: не вистачає ${gaps.join(', ')}` });
    }

    const drafts = col.products.filter((p) => p.name.includes('чернетка'));
    if (drafts.length)
      out.push({
        level: 'info',
        text: `«${col.title}»: ${drafts.length} чернеток чекають редагування (${drafts.map((d) => '#' + d.collectionOrder).join(', ')})`,
      });

    if (col.archivedAt) out.push({ level: 'info', text: `«${col.title}»: архівна — вітрина без продажу` });
  }

  // Конфлікт текстур: два товари вказують на той самий файл
  const byTexture = new Map<string, string[]>();
  for (const col of collections)
    for (const p of col.products)
      if (p.texture3dUrl) byTexture.set(p.texture3dUrl, [...(byTexture.get(p.texture3dUrl) ?? []), p.slug]);
  for (const [, slugs] of byTexture)
    if (slugs.length > 1)
      out.push({ level: 'warn', text: `одна текстура на кількох товарах: ${slugs.join(' і ')}` });

  return out;
};

export const AuditFindings = ({ collections }: { collections: FindingsCollection[] | undefined }) => {
  if (!collections) return null;
  const findings = computeFindings(collections);

  return (
    <section className={styles.collection}>
      <h2 className={styles.collectionTitle}>Перевірки · {findings.length || '✓'}</h2>
      {findings.length === 0 ? (
        <p className={styles.findOk}>Конфліктів не знайдено — всі звʼязки на місці.</p>
      ) : (
        <ul className={styles.findings}>
          {findings.map((f, i) => (
            <li key={i} className={f.level === 'warn' ? styles.findWarn : styles.findInfo}>
              {f.level === 'warn' ? '⚠️' : 'ℹ️'} {f.text}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
