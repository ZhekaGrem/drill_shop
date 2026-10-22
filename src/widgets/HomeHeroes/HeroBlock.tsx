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

  return (
    <section id={`collection-${col.key}`} className={styles.hero}>
      <div className={styles.heroShare}>
        <button
          type="button"
          className={styles.heroShareButton}
          data-copied={copied}
          onClick={copyLink}
          disabled={!active}
          title="Поділитися"
          aria-label={copied ? `Скопійовано: ${col.title}` : `Поділитися: ${col.title}`}>
          <IconCopy className={styles.heroCopyIcon} size={20} aria-hidden="true" />
          <IconCheck className={styles.heroCheckIcon} size={20} aria-hidden="true" />
        </button>
        <span className={styles.heroShareMessage} role="status" aria-live="polite">
          {copied ? '' : shareMessage}
        </span>
      </div>
      <div className={styles.heroText}>
        <TitleTag className={styles.heroTitle}>
          {col.title}
          {col.labelText && (
            <span className={`${styles.capsule} designCapsule`} style={capsuleStyle(col.labelColor, design)}>
              {col.labelText}
            </span>
          )}
        </TitleTag>
        <p className={styles.heroSubtitle}>
          <RichDescription text={col.description} />
        </p>
        <div className={styles.heroActions}>
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
      <div className={styles.heroVisualWrap}>
        {col.badgeText && (
          <span
            className={styles.heroBadgeOnStage}
            style={{ '--badge-color': col.badgeColor ?? '#1c8a37' } as React.CSSProperties}>
            <span className={styles.heroPulseDot} aria-hidden="true" />
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
