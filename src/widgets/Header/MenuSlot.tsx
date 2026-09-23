// src/widgets/Header/MenuSlot.tsx
// Слот правої групи хедера: меню, Цибуля, чат, гра, Галичина і новини лежать одна на одній,
// видима — одна, за фазою такту (useSlotAlternation, спеки
// 2026-09-17-wishes-chat-slot-design.md і 2026-09-20-news-bell-slot-design.md).
//
// Дзвіночок стоїть у такті, поки новини взагалі є. Прочитаність міняє не
// такт, а лише червону крапку на кнопці й підпис для читалки: прочитане
// теж має бути як перечитати (рішення власника 2026-09-20).
//
// Прихована кнопка отримує inert: випадає з табу й дерева доступності і не
// ловить кліки, тож тап у перехідні 220 мс не потрапляє в «привида».
// Окремих aria-hidden/tabIndex не треба — inert робить усе разом.
// Live-region свідомо нема: оголошувати зміну кожні 5 с — шум для скрінрідера.
'use client';

import Link from 'next/link';
import styles from './header.module.scss';
import { IconBell, IconChat, IconMoto, MenuIcon } from '@/shared/components/Svg';
import { content } from '@/shared/config/content';
import { useSlotAlternation, type SlotPhase } from './useSlotAlternation';
import { GalychynaLogo } from './GalychynaLogo';
import { TsybuliaLogo } from './TsybuliaLogo';

export type { SlotPhase };

interface MenuSlotProps {
  /** Шторка (побажання або новини) відкрита — такт стоїть на паузі */
  paused: boolean;
  /** Новини взагалі є: дзвіночок входить у коло фаз */
  hasNews: boolean;
  /** Серед них є непрочитана: на дзвіночку червона крапка */
  unreadNews: boolean;
  onOpenWishes: () => void;
  onOpenNews: () => void;
}

export function MenuSlot({ paused, hasNews, unreadNews, onOpenWishes, onOpenNews }: MenuSlotProps) {
  const { phase, slotRef, holdHandlers } = useSlotAlternation(paused, hasNews);

  return (
    <div ref={slotRef} className={styles.slot} tabIndex={-1} {...holdHandlers}>
      <Link
        href="/menu"
        className={`${styles.iconButton} ${styles.slotItem}`}
        data-shown={phase === 'menu'}
        inert={phase !== 'menu'}
        aria-label="Меню">
        <MenuIcon />
      </Link>
      <a
        href="https://tsybulia.radio.fm/"
        className={`${styles.iconButton} ${styles.slotItem}`}
        data-shown={phase === 'tsybulia'}
        inert={phase !== 'tsybulia'}
        aria-label="Цибуля — слухати радіо"
        title="Цибуля — слухати радіо">
        <TsybuliaLogo />
      </a>
      <button
        type="button"
        className={`${styles.iconButton} ${styles.slotItem}`}
        data-shown={phase === 'chat'}
        inert={phase !== 'chat'}
        aria-label={content.wishes.triggerLabel}
        onClick={onOpenWishes}>
        <IconChat />
      </button>
      <Link
        href="/moto"
        className={`${styles.iconButton} ${styles.slotItem}`}
        data-shown={phase === 'moto'}
        inert={phase !== 'moto'}
        aria-label={content.moto.openGameLabel}
        title={content.moto.openGameLabel}>
        <IconMoto />
      </Link>
      <a
        href="https://galychyna.online/"
        className={`${styles.iconButton} ${styles.slotItem}`}
        data-shown={phase === 'galychyna'}
        inert={phase !== 'galychyna'}
        aria-label="Галичина — сайт нашої компанії"
        title="Галичина — сайт нашої компанії">
        <GalychynaLogo />
      </a>
      <button
        type="button"
        className={`${styles.iconButton} ${styles.slotItem}`}
        data-shown={phase === 'news'}
        inert={phase !== 'news'}
        aria-label={unreadNews ? content.news.triggerUnreadLabel : content.news.triggerLabel}
        onClick={onOpenNews}>
        <IconBell />
        {/* Крапка — єдиний візуальний знак «є нове»; для читалки те саме
            сказано в aria-label, тож сама крапка від неї схована */}
        {unreadNews && <span className={styles.slotDot} aria-hidden="true" />}
      </button>
    </div>
  );
}
