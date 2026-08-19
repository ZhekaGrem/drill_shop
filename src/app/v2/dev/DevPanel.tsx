'use client';
// Дев-панель: дизайн-концепція, тема (світла/темна/авто за правилом
// концепції), стан прапорців середовища і швидкі переходи на внутрішні
// інструменти. Гейт DEV_MODE — у серверному page.tsx поруч (звідти
// справжній 404-статус).
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Page } from '@/shared/components/Page/Page';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { API_BASE } from '@/shared/api/client';
import {
  type Theme,
  type ThemeChoice,
  THEME_KEY,
  readThemeChoice,
  setThemeChoice,
  themeByClock,
} from '@/shared/config/theme';
import { useDesign } from '@/shared/hooks';
import { useCollections } from '@/widgets/ProductV2/useCollections';
import { DesignSection } from './DesignSection';
import styles from './dev.module.scss';

const THEME_OPTIONS: { value: ThemeChoice; label: string }[] = [
  { value: 'light', label: 'Світла' },
  { value: 'dark', label: 'Темна' },
  { value: 'auto', label: 'Авто' },
];

export const DevPanel = () => {
  const { data: collections } = useCollections();
  const design = useDesign();
  const [choice, setChoice] = useState<ThemeChoice | null>(null);
  const [effective, setEffective] = useState<Theme>('light');

  // Стан читаємо після маунта (localStorage і годинник на сервері недоступні),
  // а спостерігач атрибута тримає панель синхронною з ThemeClock (авто о 18:00)
  useEffect(() => {
    const sync = () => {
      setChoice(readThemeChoice());
      setEffective(document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  if (choice === null) {
    return (
      <Page>
        <PageHeader title="Dev mode" description="Читаємо стан застосунку…" />
      </Page>
    );
  }

  const stateRows: [string, string][] = [
    ['DEV_MODE', 'увімкнено — вимикається одним рядком у src/shared/config/dev-mode.ts'],
    ['Десктоп', 'відкритий; при DEV_MODE=false — заглушка (виняток /v2/audit)'],
    ['Перемикач теми', 'лише на цій сторінці; для покупців тема живе на автоматиці годинника'],
    ['Ця сторінка', 'при DEV_MODE=false показує 404-екран — покупці панелі не бачать'],
    ['Середовище', process.env.NODE_ENV ?? '—'],
    [
      'API',
      API_BASE === '/api/v1'
        ? `/api/v1 — dev-проксі на ${process.env.NEXT_PUBLIC_API_URL ?? '?'}`
        : (API_BASE ?? '—'),
    ],
    [
      'Авто-правило теми',
      design === 'streetwear'
        ? 'завжди темна (Стрітвір)'
        : design === 'cupertino'
          ? 'за системною темою пристрою (Cupertino)'
          : `нічне вікно 18:00–06:00 · зараз ${themeByClock() === 'dark' ? 'ніч' : 'день'}`,
    ],
  ];

  const links: [string, string][] = [
    ['/', 'Головна'],
    ['/catalog', 'Каталог'],
    ['/v2/audit', 'Аудит колекцій'],
    ['/v2/lab', 'Hero Lab (приклади моделей)'],
    ['/v2/loaders', 'Завантажувальні екрани (приклади)'],
    ['/v2/motion', 'Motion-пілот каталогу (turntable WebP)'],
    ['/v2/swatches', 'Свотчі (приклади стилів)'],
    ['/v2/switcher', 'Перемикач товарів (чипи, картки)'],
  ];

  return (
    <Page>
      <PageHeader title="Dev mode" description="Налаштування застосунку. Сторінка існує лише в DEV_MODE." />

      <DesignSection />

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Тема</h2>
        <div className={styles.seg} role="group" aria-label="Режим теми">
          {THEME_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={option.value === choice ? styles.segBtnActive : styles.segBtn}
              aria-pressed={option.value === choice}
              onClick={() => setThemeChoice(option.value)}>
              {option.label}
            </button>
          ))}
        </div>
        <p className={styles.mono}>
          на екрані: {effective === 'dark' ? 'темна 🌙' : 'світла ☀️'} · localStorage.{THEME_KEY} ={' '}
          {choice === 'auto' ? '∅ (авто)' : `'${choice}'`}
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Стан застосунку</h2>
        <dl className={styles.rows}>
          {stateRows.map(([term, value]) => (
            <div key={term}>
              <dt>{term}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Швидкі переходи</h2>
        <ul className={styles.links}>
          {links.map(([href, label]) => (
            <li key={href}>
              <Link href={href}>{label}</Link>
            </li>
          ))}
          {collections?.map((col) => (
            <li key={col.key}>
              <Link href={col.href}>
                {col.title} <span className={styles.dim}>· товарів: {col.items.length}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </Page>
  );
};
