// src/widgets/Header/MenuSlot.tsx
// Слот правої групи хедера: кнопки меню, чату і новин лежать одна на одній,
// видима — одна, за фазою такту (useSlotAlternation, спеки
// 2026-09-17-wishes-chat-slot-design.md і 2026-09-20-news-bell-slot-design.md).
//
// Дзвіночок узагалі не бере участі в такті, поки всі новини прочитані:
// коло тоді коротше (меню ↔ чат), а сама кнопка лишається в розмітці
// прихованою — так не треба ані ремоунтити слот, ані ловити стрибок.
//
// Прихована кнопка отримує inert: випадає з табу й дерева доступності і не
// ловить кліки, тож тап у перехідні 220 мс не потрапляє в «привида».
// Окремих aria-hidden/tabIndex не треба — inert робить усе разом.
// Live-region свідомо нема: оголошувати зміну кожні 5 с — шум для скрінрідера.
'use client';

import Link from 'next/link';
import styles from './header.module.scss';
import { IconBell, IconChat, MenuIcon } from '@/shared/components/Svg';
import { content } from '@/shared/config/content';
import { useSlotAlternation, type SlotPhase } from './useSlotAlternation';

export type { SlotPhase };

interface MenuSlotProps {
  /** Шторка (побажання або новини) відкрита — такт стоїть на паузі */
  paused: boolean;
  /** Є непрочитана новина: дзвіночок входить у такт і світить крапкою */
  unreadNews: boolean;
  onOpenWishes: () => void;
  onOpenNews: () => void;
}

export function MenuSlot({ paused, unreadNews, onOpenWishes, onOpenNews }: MenuSlotProps) {
  const { phase, slotRef, holdHandlers } = useSlotAlternation(paused, unreadNews);

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
      <button
        type="button"
        className={`${styles.iconButton} ${styles.slotItem}`}
        data-shown={phase === 'chat'}
        inert={phase !== 'chat'}
        aria-label={content.wishes.triggerLabel}
        onClick={onOpenWishes}>
        <IconChat />
      </button>
      <button
        type="button"
        className={`${styles.iconButton} ${styles.slotItem}`}
        data-shown={phase === 'news'}
        inert={phase !== 'news'}
        aria-label={unreadNews ? content.news.triggerUnreadLabel : content.news.triggerLabel}
        onClick={onOpenNews}>
        <IconBell />
        {/* Крапка дублює те, що вже сказано в aria-label кнопки, тож для
            читалки вона зайва */}
        {unreadNews && <span className={styles.slotDot} aria-hidden="true" />}
      </button>
    </div>
  );
}
