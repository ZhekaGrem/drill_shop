// src/shared/components/SwipeNav/useSwipePager.ts
// Жест горизонтального пейджера для навбару.
//
// Pointer Events, а не touch: один код на палець, мишу і стилус, і
// setPointerCapture сам доводить жест до кінця, навіть якщо палець зʼїхав за
// межі смуги.
//
// Увесь стан жесту продубльований у ref-ах. Це не перестраховка: обробник
// pointerup читає зміщення й ознаку активності, а стан React оновлюється
// асинхронно — при швидкому русі up встигав прочитати ще торішні значення й
// не докомітити сторінку. Ref завжди актуальний, state потрібен лише щоб
// перемалювати доріжку.
'use client';

import { useCallback, useRef, useState } from 'react';

/** Далі якої частки кроку відпускання рахується як перехід */
const COMMIT_RATIO = 0.28;
/** Різкий кидок комітить навіть на короткій дистанції, px/мс */
const FLICK = 0.45;
/** Опір за краями списку: далі не пускає, але дає зрозуміти, що край є */
const RESIST = 0.35;
/** Менший зсув — це тап, а не свайп (гасимо клік по посиланню) */
const TAP = 6;
/** Скільки після жесту клік ще вважається його відлунням, мс */
const CLICK_WINDOW = 350;

interface Args {
  count: number;
  index: number;
  onChange: (next: number) => void;
  /** Ширина одного кроку доріжки в пікселях */
  step: number;
}

export const useSwipePager = ({ count, index, onChange, step }: Args) => {
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);

  const active = useRef(false);
  const startX = useRef(0);
  const dxRef = useRef(0);
  const last = useRef({ x: 0, t: 0 });
  const velocity = useRef(0);
  /** Чи був рух — читає onClickCapture, щоб свайп не спрацював як клік */
  const moved = useRef(false);
  /** Коли жест завершився — щоб гасити лише той клік, що йде слідом за ним */
  const endedAt = useRef(0);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    // Праву й середню кнопки миші ігноруємо — це не жест
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    active.current = true;
    moved.current = false;
    startX.current = e.clientX;
    dxRef.current = 0;
    velocity.current = 0;
    last.current = { x: e.clientX, t: e.timeStamp };
    setDragging(true);
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!active.current) return;
      let d = e.clientX - startX.current;
      if (Math.abs(d) > TAP) moved.current = true;
      // За краєм списку доріжка йде вʼязко — жест не блокується, але видно,
      // що далі нічого немає
      const beyondStart = index === 0 && d > 0;
      const beyondEnd = index === count - 1 && d < 0;
      if (beyondStart || beyondEnd) d *= RESIST;

      const dt = e.timeStamp - last.current.t;
      if (dt > 0) velocity.current = (e.clientX - last.current.x) / dt;
      last.current = { x: e.clientX, t: e.timeStamp };

      dxRef.current = d;
      setDx(d);
    },
    [count, index]
  );

  const finish = useCallback(() => {
    if (!active.current) return;
    active.current = false;
    endedAt.current = performance.now();
    setDragging(false);

    const d = dxRef.current;
    const far = step > 0 && Math.abs(d) > step * COMMIT_RATIO;
    const flick = Math.abs(velocity.current) > FLICK;
    let next = index;
    if (far || flick) {
      // Напрям беремо з того сигналу, який спрацював: при короткому різкому
      // кидку зміщення ще майже нульове і його знак нічого не означає
      const dir = (far ? d : velocity.current) < 0 ? 1 : -1;
      next = Math.min(count - 1, Math.max(0, index + dir));
    }

    dxRef.current = 0;
    setDx(0);
    if (next !== index) onChange(next);
  }, [count, index, onChange, step]);

  /**
   * Свайп по смузі не має спрацьовувати як клік по логотипу чи посиланню.
   *
   * Гасимо лише той клік, що приходить ОДРАЗУ слідом за жестом, і лише раз.
   * Перша версія просто тримала прапорець «був рух» до наступного
   * pointerdown — і він зʼїдав перший-ліпший клік, що прийшов не від пальця:
   * зокрема активацію посилання з клавіатури, у якої pointerdown немає
   * взагалі. Заміряно на живому хедері: після свайпу клік по «Каталог» не
   * спрацьовував.
   *
   * Самої одноразовості мало: браузери не завжди шлють клік після
   * протягування, і тоді прапорець лишався б піднятим до наступного жесту.
   * Тому ще й вікно часу — поза ним ознака просто скидається.
   */
  const onClickCapture = useCallback((e: React.MouseEvent) => {
    if (!moved.current) return;
    moved.current = false;
    if (performance.now() - endedAt.current > CLICK_WINDOW) return;
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return {
    dx,
    dragging,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: finish,
      onPointerCancel: finish,
      onClickCapture,
    },
  };
};
