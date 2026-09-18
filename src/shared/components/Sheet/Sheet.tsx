// src/shared/components/Sheet/Sheet.tsx
// Розподіл відповідальності: Mantine Drawer.Root тримає портал, focus trap,
// блокування скролу, aria й Escape; рух і жест ведемо самі. Власний перехід
// Mantine вимкнено (duration: 0) — інакше два трансформи билися б за один елемент.
'use client';

import type { ReactNode } from 'react';
import { Drawer } from '@mantine/core';
import { useSheetDrag } from './useSheetDrag';
import styles from './Sheet.module.scss';

interface SheetProps {
  opened: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  /** За замовчуванням true (поведінка Mantine Drawer). Постав false, якщо
   *  тригер шторки може стати нефокусованим (напр. inert) до її закриття —
   *  тоді Drawer повернув би фокус на body, і викликач керує фокусом сам. */
  returnFocus?: boolean;
}

export const Sheet = ({ opened, onClose, title, children, returnFocus = true }: SheetProps) => {
  const drag = useSheetDrag(onClose);

  return (
    <Drawer.Root
      opened={opened}
      onClose={onClose}
      position="bottom"
      size="auto"
      returnFocus={returnFocus}
      transitionProps={{ duration: 0 }}>
      <Drawer.Overlay className={styles.overlay} data-opened={opened || undefined} />
      <Drawer.Content
        data-sheet-content
        className={styles.content}
        data-opened={opened || undefined}
        data-dragging={drag.isDragging || undefined}
        style={{ transform: `translateY(${drag.offset}px)` }}>
        <div
          className={styles.handleZone}
          onPointerDown={drag.onPointerDown}
          onPointerMove={drag.onPointerMove}
          onPointerUp={drag.onPointerUp}
          onPointerCancel={drag.onPointerUp}>
          <span className={styles.handle} />
        </div>
        {title && <Drawer.Title className={styles.title}>{title}</Drawer.Title>}
        <Drawer.Body className={styles.body}>{children}</Drawer.Body>
      </Drawer.Content>
    </Drawer.Root>
  );
};
