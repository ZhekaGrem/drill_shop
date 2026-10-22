// src/widgets/HomeHeroes/HeroBlockWin98.tsx
// Герой колекції в дизайні Windows 98 — окремий компонент, щоб дизайни до Windows (Дія й похідні, К1–К3)
// рендерив незмінний HeroBlock.tsx. Вікно: синя смуга — заголовок героя (h1/h2) з капсулою і кнопкою «Копіювати»;
// опис і дії ліворуч; 3D праворуч на білій робочій області, крапка колекції («■ класика») — у її куті.
// Стилі: HomeHeroes.module.scss (спільна розкладка героя) + windows-hero.module.scss (лише Windows 98).
'use client';

import { useEffect, useState } from 'react';
import { IconCheck, IconCopy } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/components/Button/Button';
import { ArrowRight } from '@/shared/components/Svg';
import { RichDescription } from '@/shared/components/RichDescription/RichDescription';
import { switcherForCollection } from '@/shared/config/collection-switcher';
import { HeroVisual } from '@/widgets/HeroVisual/HeroVisual';
import { capsuleStyle, type CollectionDef } from '@/widgets/ProductV2/collections';
import styles from './HomeHeroes.module.scss';
import windows from '@/shared/components/Windows98/windows-hero.module.scss';
import { Windows98WindowBar } from '@/shared/components/Windows98/Windows98';

interface HeroBlockWin98Props {
  col: CollectionDef;
  /** Перший герой сторінки — h1, решта — h2 */
  titleTag?: 'h1' | 'h2';
  /** Slug вибраного дизайну колекції */
  active: string;
  onPick: (slug: string) => void;
  onShare: () => Promise<void>;
  /** Кнопка «Про бренд» (лише в першого героя) */
  showAbout?: boolean;
}

export const HeroBlockWin98 = ({
  col,
  titleTag = 'h2',
  active,
  onPick,
  onShare,
  showAbout = false,
}: HeroBlockWin98Props) => {
  const router = useRouter();
  const [shareMessage, setShareMessage] = useState('');
  useEffect(() => {
    if (!shareMessage) return;
    const timer = window.setTimeout(() => setShareMessage(''), 4000);
    return () => window.clearTimeout(timer);
  }, [shareMessage]);
  const copied = shareMessage === 'Посилання скопійовано';
  const copyLink = async () => {
    setShareMessage('');
    try {
      await onShare();
      setShareMessage('Посилання скопійовано');
    } catch {
      setShareMessage('Не вдалося скопіювати. Спробуй ще раз.');
    }
  };
  const TitleTag = titleTag;
  // Механіка перемикача залежить від колекції (config/collection-switcher), як і в HeroBlock
  const switcher = switcherForCollection(col.key);

  const shareControl = (
    <div className={`${styles.heroShare} ${windows.heroShare}`}>
      <button
        type="button"
        className={`${styles.heroShareButton} ${windows.heroShareButton}`}
        data-win98-copy=""
        data-copied={copied}
        onClick={copyLink}
        disabled={!active}
        title="Скопіювати посилання"
        aria-label={
          copied ? `Посилання на ${col.title} скопійовано` : `Скопіювати посилання на ${col.title}`
        }>
        <IconCopy className={styles.heroCopyIcon} size={20} aria-hidden="true" />
        <IconCheck className={styles.heroCheckIcon} size={20} aria-hidden="true" />
      </button>
      <span className={styles.heroShareMessage} role="status" aria-live="polite">
        {copied ? '' : shareMessage}
      </span>
    </div>
  );

  // Крапка колекції («■ класика») — у куті білої робочої області сцени
  const badge = col.badgeText && (
    <span
      className={styles.heroBadgeOnStage}
      data-win98-badge=""
      style={{ '--badge-color': col.badgeColor ?? '#1c8a37' } as React.CSSProperties}>
      <span className={styles.heroPulseDot} data-win98-pulse="" aria-hidden="true" />
      {col.badgeText}
    </span>
  );

  return (
    <section id={`collection-${col.key}`} className={`${styles.hero} ${windows.hero}`} data-store-window="">
      {/* Назва стоїть лише в синій смузі: смуга й є заголовком героя, у тексті вікна назва не повторюється */}
      <Windows98WindowBar action={shareControl}>
        <TitleTag>
          {col.title}
          {col.labelText && (
            <span className={`${styles.capsule} designCapsule`} style={capsuleStyle(col.labelColor, 'win98')}>
              {col.labelText}
            </span>
          )}
        </TitleTag>
      </Windows98WindowBar>
      <div className={`${styles.heroText} ${windows.heroText}`}>
        <p className={`${styles.heroSubtitle} ${windows.heroSubtitle}`}>
          <RichDescription text={col.description} />
        </p>
        <div className={`${styles.heroActions} ${windows.heroActions}`}>
          <Button
            size="lg"
            variant="primary"
            disabled={!active}
            onClick={() => active && router.push(`/v2/a/${active}`)}>
            До колекції <ArrowRight size={20} />
          </Button>
          {showAbout && (
            <Button size="lg" variant="secondary" onClick={() => router.push('/about')}>
              Про бренд
            </Button>
          )}
        </div>
      </div>
      <div className={`${styles.heroVisualWrap} ${windows.heroVisualWrap}`}>
        <HeroVisual
          designs={col.designs}
          switcher={switcher}
          value={active}
          onChange={onPick}
          stageOverlay={badge || undefined}
        />
      </div>
    </section>
  );
};
