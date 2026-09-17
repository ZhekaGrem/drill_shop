// src/widgets/Header/MenuSlot.tsx
// Слот правої групи хедера: кнопка меню і кнопка чату лежать одна на одній,
// видима — одна, за фазою такту (useSlotAlternation, спека
// docs/superpowers/specs/2026-09-17-wishes-chat-slot-design.md).
//
// Прихована кнопка отримує inert: випадає з табу й дерева доступності і не
// ловить кліки, тож тап у перехідні 220 мс не потрапляє в «привида».
// Окремих aria-hidden/tabIndex не треба — inert робить усе разом.
// Live-region свідомо нема: оголошувати зміну кожні 5 с — шум для скрінрідера.
'use client';

import Link from 'next/link';
import styles from './header.module.scss';
import { IconChat, MenuIcon } from '@/shared/components/Svg';
import { content } from '@/shared/config/content';
import { useSlotAlternation, type SlotPhase } from './useSlotAlternation';

export type { SlotPhase };

interface MenuSlotProps {
  /** Шторка побажань відкрита — такт стоїть на паузі */
  paused: boolean;
  onOpenWishes: () => void;
}

export function MenuSlot({ paused, onOpenWishes }: MenuSlotProps) {
  const { phase, holdHandlers } = useSlotAlternation(paused);
  const menuShown = phase === 'menu';

  return (
    <div className={styles.slot} {...holdHandlers}>
      <Link
        href="/menu"
        className={`${styles.iconButton} ${styles.slotItem}`}
        data-shown={menuShown}
        inert={!menuShown}
        aria-label="Меню">
        <MenuIcon />
      </Link>
      <button
        type="button"
        className={`${styles.iconButton} ${styles.slotItem}`}
        data-shown={!menuShown}
        inert={menuShown}
        aria-label={content.wishes.triggerLabel}
        onClick={onOpenWishes}>
        <IconChat />
      </button>
    </div>
  );
}
