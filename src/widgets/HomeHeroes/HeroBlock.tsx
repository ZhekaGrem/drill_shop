// src/widgets/HomeHeroes/HeroBlock.tsx
// Герой ОДНІЄЇ колекції: текст (назва+капсула, опис, CTA) і візуал (крапка
// поверх сцени, 3D або постер). Спільна цеглинка всіх геройських механік —
// стек Дії, карусель К1, плитки К2, таби К3 лише розставляють ці блоки.
'use client';

import { useEffect, useState } from 'react';
import { IconCheck, IconCopy } from '@tabler/icons-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/components/Button/Button';
import { ArrowRight } from '@/shared/components/Svg';
import { RichDescription } from '@/shared/components/RichDescription/RichDescription';
import { useDesign } from '@/shared/hooks/useDesign';
import { switcherForCollection } from '@/shared/config/collection-switcher';
import { HeroVisual } from '@/widgets/HeroVisual/HeroVisual';
import { capsuleStyle, type CollectionDef } from '@/widgets/ProductV2/collections';
import styles from './HomeHeroes.module.scss';
import windows from '@/shared/components/Windows98/windows-hero.module.scss';
import { Windows98WindowBar } from '@/shared/components/Windows98/Windows98';

interface HeroBlockProps {
  col: CollectionDef;
  /** Перший герой сторінки — h1, решта — h2 */
  titleTag?: 'h1' | 'h2';
  /** Slug вибраного дизайну колекції */
  active: string;
  onPick: (slug: string) => void;
  onShare: () => Promise<void>;
  /** Кнопка «Про бренд» (лише в першого героя) */
  showAbout?: boolean;
  /** false — статичний постер замість 3D (бічні картки каруселі К1) */
  live?: boolean;
}

export const HeroBlock = ({
  col,
  titleTag = 'h2',
  active,
  onPick,
  onShare,
  showAbout = false,
  live = true,
}: HeroBlockProps) => {
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
  const design = useDesign();
  const TitleTag = titleTag;
  // Механіка перемикача залежить від колекції: там, де колір і є суттю товару
  // («Ніжна Оксана»), лишаються кольорові свотчі; де товари різняться графікою
  // («Щільний Дріл») — компас із картками. Мапа: config/collection-switcher.
  const switcher = switcherForCollection(col.key);
  const activeDesign = col.designs[active] ?? col.items[0]?.design;
  const shareControl = (
    <div className={`${styles.heroShare} ${design === 'win98' ? windows.heroShare : ''}`}>
      <button
        type="button"
        className={`${styles.heroShareButton} ${design === 'win98' ? windows.heroShareButton : ''}`}
        data-win98-copy={design === 'win98' ? '' : undefined}
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

  return (
    <section
      id={`collection-${col.key}`}
      className={`${styles.hero} ${design === 'win98' ? windows.hero : ''}`}
      data-store-window={design === 'win98' ? '' : undefined}>
      <Windows98WindowBar title={col.title} action={design === 'win98' ? shareControl : undefined} />
      {design !== 'win98' && shareControl}
      <div className={`${styles.heroText} ${design === 'win98' ? windows.heroText : ''}`}>
        <TitleTag className={`${styles.heroTitle} ${design === 'win98' ? windows.heroTitle : ''}`}>
          {col.title}
          {col.labelText && (
            <span className={`${styles.capsule} designCapsule`} style={capsuleStyle(col.labelColor, design)}>
              {col.labelText}
            </span>
          )}
        </TitleTag>
        <p className={`${styles.heroSubtitle} ${design === 'win98' ? windows.heroSubtitle : ''}`}>
          <RichDescription text={col.description} />
        </p>
        <div className={`${styles.heroActions} ${design === 'win98' ? windows.heroActions : ''}`}>
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
      <div className={`${styles.heroVisualWrap} ${design === 'win98' ? windows.heroVisualWrap : ''}`}>
        {col.badgeText && (
          <span
            className={styles.heroBadgeOnStage}
            data-win98-badge={design === 'win98' ? '' : undefined}
            style={{ '--badge-color': col.badgeColor ?? '#1c8a37' } as React.CSSProperties}>
            <span
              className={styles.heroPulseDot}
              data-win98-pulse={design === 'win98' ? '' : undefined}
              aria-hidden="true"
            />
            {col.badgeText}
          </span>
        )}
        {live ? (
          <HeroVisual designs={col.designs} switcher={switcher} value={active} onChange={onPick} />
        ) : (
          activeDesign && (
            <div className={styles.heroPoster}>
              <Image src={activeDesign.fallback} alt={col.title} fill sizes="88vw" loading="lazy" />
            </div>
          )
        )}
      </div>
    </section>
  );
};
