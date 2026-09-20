// src/widgets/Header/useSlotAlternation.ts
// Такт слота: 5 с на фазу, по колу, без зупинки (рішення власника, спека
// 2026-09-17-wishes-chat-slot-design.md).
//
// Кіл два, і вибирає між ними непрочитана новина (рішення власника 2026-09-20):
//   без новин      меню → чат            (як було)
//   є непрочитане  меню → чат → меню → дзвіночок
// Меню лишається «домом» і в довшому колі займає половину часу. Щойно новину
// прочитали, дзвіночок зникає з такту сам: hasNews стає false, а індекс фази
// береться за модулем нової довжини.
//
// Стартова фаза 'menu' однакова на сервері й клієнті, таймер живе лише
// в useEffect — гідрація не розходиться. Три правила поверх такту:
//  • утримання: поки на слоті ховер або фокус, тік пропускається — кнопка
//    не зникає з-під пальця чи курсора; наступна перевірка через 5 с;
//  • пауза (шторка відкрита): інтервалу нема, при знятті — 'menu' і відлік
//    заново, щоб після закриття шторки хедер був звичним;
//  • прихована вкладка: браузер тротлить таймери у фоні, тож на поверненні
//    фаза скидається на 'menu' і інтервал перезапускається.
//
// Скидання фази при знятті паузи зроблено «під час рендера» (той самий
// прийом, що seenRoute у Header.tsx): setState у тілі ефекту — помилка
// правила react-hooks/set-state-in-effect.
'use client';

import { useEffect, useRef, useState } from 'react';

export type SlotPhase = 'menu' | 'chat' | 'news';

const CYCLE_PLAIN: SlotPhase[] = ['menu', 'chat'];
const CYCLE_NEWS: SlotPhase[] = ['menu', 'chat', 'menu', 'news'];

export const SLOT_PERIOD_MS = 5000;

export const useSlotAlternation = (paused: boolean, hasNews = false) => {
  // Фаза — це ІНДЕКС у колі, а не сама назва: коло міняє довжину разом із
  // hasNews, і зберігати треба позицію, інакше після зникнення дзвіночка
  // такт стрибав би з середини.
  const [step, setStep] = useState(0);
  const cycle = hasNews ? CYCLE_NEWS : CYCLE_PLAIN;
  const phase: SlotPhase = cycle[step % cycle.length];
  // Дві модальності утримання окремо: зі спільним прапорцем blur після Tab
  // знімав би утримання, поки курсор досі на слоті (і навпаки). Ref, а не
  // стан: зміна утримання не має перерендерювати хедер, вона лише впливає
  // на наступний тік.
  const pointerHeldRef = useRef(false);
  const focusHeldRef = useRef(false);
  // Інкремент перезапускає інтервал (повернення у вкладку)
  const [epoch, setEpoch] = useState(0);

  const [seenPaused, setSeenPaused] = useState(paused);
  if (seenPaused !== paused) {
    setSeenPaused(paused);
    if (!paused) setStep(0);
  }

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      if (pointerHeldRef.current || focusHeldRef.current) return;
      setStep((i) => i + 1);
    }, SLOT_PERIOD_MS);
    return () => window.clearInterval(id);
  }, [paused, epoch]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState !== 'visible') return;
      // pointerleave не гарантований, коли вікно втрачає фокус із курсором,
      // що лежить на слоті, — застигле утримання інакше заморозило б слот
      // після повернення у вкладку.
      pointerHeldRef.current = false;
      focusHeldRef.current = false;
      setStep(0);
      setEpoch((e) => e + 1);
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  // Після закриття шторки фокус повертаємо на обгортку слота: кнопка, що
  // її відкрила, на цей момент уже inert, і Drawer повернув би фокус на
  // body. Програмний фокус — не утримання, тож focusHeldRef одразу знімаємо.
  const slotRef = useRef<HTMLDivElement>(null);
  const wasPausedRef = useRef(false);
  useEffect(() => {
    if (paused) {
      wasPausedRef.current = true;
      return;
    }
    if (!wasPausedRef.current) return;
    wasPausedRef.current = false;
    slotRef.current?.focus({ preventScroll: true });
    focusHeldRef.current = false;
  }, [paused]);

  return {
    phase,
    slotRef,
    holdHandlers: {
      onPointerEnter: () => {
        pointerHeldRef.current = true;
      },
      onPointerLeave: () => {
        pointerHeldRef.current = false;
      },
      onFocus: () => {
        focusHeldRef.current = true;
      },
      onBlur: () => {
        focusHeldRef.current = false;
      },
    },
  };
};
