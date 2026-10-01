'use client';

import { useEffect, useRef, useState, type FocusEvent, type PointerEvent } from 'react';

import { slotCycle, slotPhaseAt, type SlotPhase } from './slot-cycle';
import { createSlotTimer } from './slot-timer';

export type { SlotPhase };

// Початкове меню однакове в SSR і браузері. Одне коло — всі фази з
// slot-cycle.ts; кожне наступне коло отримує 1, 1, 2, 3, 5, 8… с на фазу.
export const useSlotAlternation = (paused: boolean, hasNews = false) => {
  const [step, setStep] = useState(0);
  const [seenNews, setSeenNews] = useState(hasNews);
  if (seenNews !== hasNews) {
    setSeenNews(hasNews);
    setStep(0);
  }
  const phase = slotPhaseAt(step, hasNews);
  const slotRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof createSlotTimer> | null>(null);
  const wasPausedRef = useRef(false);
  const pointerHeldRef = useRef(false);

  useEffect(() => {
    const timer = createSlotTimer(slotCycle(false).length, setStep, {
      now: () => performance.now(),
      schedule: (callback, delay) => window.setTimeout(callback, delay),
      cancel: (id) => window.clearTimeout(id),
    });
    timerRef.current = timer;

    const syncVisibility = () => {
      const hidden = document.visibilityState !== 'visible';
      // Спершу зупиняємо відлік; утримання переглядаємо до відновлення.
      timer.hold('hidden', true);
      if (!hidden) {
        const slot = slotRef.current;
        pointerHeldRef.current = pointerHeldRef.current && !!slot?.matches(':hover');
        timer.hold('pointer', pointerHeldRef.current);
        timer.hold('focus', !!slot?.contains(document.activeElement) && document.activeElement !== slot);
        timer.hold('touch', false);
        timer.hold('hidden', false);
      }
    };
    const releaseTouch = () => timer.hold('touch', false);
    syncVisibility();
    document.addEventListener('visibilitychange', syncVisibility);
    document.addEventListener('pointerup', releaseTouch);
    document.addEventListener('pointercancel', releaseTouch);
    timer.start();

    return () => {
      timer.dispose();
      timerRef.current = null;
      document.removeEventListener('visibilitychange', syncVisibility);
      document.removeEventListener('pointerup', releaseTouch);
      document.removeEventListener('pointercancel', releaseTouch);
    };
  }, []);

  useEffect(() => {
    // Зміна списку починає новий прохід, зберігаючи поточний час Фібоначчі.
    timerRef.current?.setPhaseCount(slotCycle(hasNews).length);
  }, [hasNews]);

  useEffect(() => {
    const timer = timerRef.current;
    if (paused) {
      wasPausedRef.current = true;
      timer?.hold('panel', true);
      return;
    }
    if (wasPausedRef.current) {
      wasPausedRef.current = false;
      // Програмний фокус обгортки не утримує таймер; Tab на дії — утримує.
      slotRef.current?.focus({ preventScroll: true });
      timer?.hold('focus', false);
    }
    timer?.hold('panel', false);
  }, [paused]);

  return {
    phase,
    slotRef,
    holdHandlers: {
      onPointerEnter: (event: PointerEvent<HTMLDivElement>) => {
        if (event.pointerType === 'touch') return;
        pointerHeldRef.current = true;
        timerRef.current?.hold('pointer', true);
      },
      onPointerLeave: (event: PointerEvent<HTMLDivElement>) => {
        if (event.pointerType === 'touch') return;
        pointerHeldRef.current = false;
        timerRef.current?.hold('pointer', false);
      },
      onPointerDown: (event: PointerEvent<HTMLDivElement>) => {
        if (event.pointerType === 'touch') timerRef.current?.hold('touch', true);
      },
      onFocus: (event: FocusEvent<HTMLDivElement>) => {
        timerRef.current?.hold('focus', event.target !== event.currentTarget);
      },
      onBlur: (event: FocusEvent<HTMLDivElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget)) timerRef.current?.hold('focus', false);
      },
    },
  };
};
