// src/shared/hooks/useSwipePager.ts
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
/**
 * Але не на БУДЬ-ЯКІЙ короткій. Швидкість рахується з крихітних дельт за
 * крихітний час, тож пара пікселів дрейфу за 8 мс уже дає «кидок». Кидку
 * потрібен ще й мінімальний пройдений шлях.
 */
const MIN_FLICK_DIST = 24;
/**
 * Абсолютна нижня межа дистанції коміту, хоч би яким малим виявився крок.
 * Крок рахується з виміряної ширини панелі, а вимір може бути ще не готовий:
 * ResizeObserver не працює у невидимій вкладці, тож там ширина лишається
 * нулем. Заміряно: при кроці 24px поріг падав до 6.7px, і будь-який
 * мікрорух пальця перекидав на інший розділ.
 */
const MIN_COMMIT_DIST = 40;
/** Менший зсув — це тап, а не свайп (гасимо клік по посиланню) */
const TAP = 6;
/** Після якого зсуву вирішуємо, жест горизонтальний чи вертикальний */
const AXIS_LOCK = 8;
/** Скільки після жесту клік ще вважається його відлунням, мс */
const CLICK_WINDOW = 350;

interface Args {
  /** Крок доріжки в пікселях (ширина панелі + проміжок) */
  step: number;
  /** Куди зсунутись: -1 назад, +1 вперед. Кільце/межі — справа викликача */
  onStep: (dir: -1 | 1) => void;
}

export const useSwipePager = ({ step, onStep }: Args) => {
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);

  const active = useRef(false);
  const start = useRef({ x: 0, y: 0 });
  const dxRef = useRef(0);
  const last = useRef({ x: 0, t: 0 });
  const velocity = useRef(0);
  /**
   * Вісь жесту. Поки null — ще вирішуємо; 'y' означає, що людина гортає
   * СТОРІНКУ, просто почала з хедера, і чіпати доріжку не можна взагалі.
   *
   * Без цього замка вертикальний скрол пальцем по шапці перекидав на сторінку
   * іншого розділу: у нього завжди є кілька пікселів горизонтального дрейфу,
   * а поділені на 8 мс вони дають швидкість вище порогу кидка. Заміряно:
   * 16px дрейфу вистачало, щоб піти з головної на /v2/a/olko.
   */
  const axis = useRef<null | 'x' | 'y'>(null);
  /** Чи був рух — читає onClickCapture, щоб свайп не спрацював як клік */
  const moved = useRef(false);
  /** Коли жест завершився — щоб гасити лише той клік, що йде слідом за ним */
  const endedAt = useRef(0);

  const reset = useCallback(() => {
    active.current = false;
    axis.current = null;
    dxRef.current = 0;
    setDx(0);
    setDragging(false);
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    // Праву й середню кнопки миші ігноруємо — це не жест
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    active.current = true;
    axis.current = null;
    moved.current = false;
    start.current = { x: e.clientX, y: e.clientY };
    dxRef.current = 0;
    velocity.current = 0;
    last.current = { x: e.clientX, t: e.timeStamp };
    // dragging вмикаємо не тут, а коли вісь виявиться горизонтальною: інакше
    // на час вертикального скролу знімався б перехід доріжки
    setDragging(false);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!active.current) return;
    const rawX = e.clientX - start.current.x;
    const rawY = e.clientY - start.current.y;

    if (axis.current === null) {
      const ax = Math.abs(rawX);
      const ay = Math.abs(rawY);
      if (Math.max(ax, ay) < AXIS_LOCK) return; // ще зарано вирішувати
      axis.current = ax > ay ? 'x' : 'y';
      if (axis.current === 'x') setDragging(true);
    }
    if (axis.current !== 'x') return; // це скрол сторінки, не наш жест

    const d = rawX;
    if (Math.abs(d) > TAP) moved.current = true;

    const dt = e.timeStamp - last.current.t;
    if (dt > 0) velocity.current = (e.clientX - last.current.x) / dt;
    last.current = { x: e.clientX, t: e.timeStamp };

    dxRef.current = d;
    setDx(d);
  }, []);

  const finish = useCallback(() => {
    if (!active.current) return;
    endedAt.current = performance.now();
    const horizontal = axis.current === 'x';
    const d = dxRef.current;
    reset();
    if (!horizontal) return; // вертикальний жест нічого не комітить

    const far = Math.abs(d) > Math.max(step * COMMIT_RATIO, MIN_COMMIT_DIST);
    const flick = Math.abs(velocity.current) > FLICK && Math.abs(d) > MIN_FLICK_DIST;
    if (!far && !flick) return;

    // Напрям беремо з того сигналу, який спрацював: при короткому різкому
    // кидку зміщення ще майже нульове і його знак нічого не означає
    onStep((far ? d : velocity.current) < 0 ? 1 : -1);
  }, [onStep, reset, step]);

  /**
   * Скасування — це НЕ завершення. Браузер шле pointercancel, коли забирає
   * жест собі (найчастіше під скрол сторінки), і зараховувати такий жест як
   * гортання не можна: саме через це скрол по хедеру відкривав інший розділ.
   */
  const abort = useCallback(() => {
    if (!active.current) return;
    endedAt.current = performance.now();
    reset();
  }, [reset]);

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
      onPointerCancel: abort,
      onClickCapture,
    },
  };
};
