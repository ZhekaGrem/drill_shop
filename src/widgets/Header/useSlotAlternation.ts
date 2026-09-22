// src/widgets/Header/useSlotAlternation.ts
// Такт слота: 5 с на фазу, по колу, без зупинки (рішення власника, спека
// 2026-09-17-wishes-chat-slot-design.md).
//
// Кіл два (slot-cycle.ts), і вибирає між ними наявність новин:
//   новин нема   меню → чат → Дріл Мото → Галичина
//   новини є     меню → чат → Дріл Мото → Галичина → меню → дзвіночок
// Прочитаність на коло НЕ впливає — вона лише вмикає червону крапку на
// кнопці (рішення власника 2026-09-20).
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

import { slotPhaseAt, type SlotPhase } from './slot-cycle';

export type { SlotPhase };

export const SLOT_PERIOD_MS = 5000;

export const useSlotAlternation = (paused: boolean, hasNews = false) => {
  // Фаза — це ІНДЕКС у колі, а не сама назва: коло може змінити довжину
  // (новини зникли з конфіга), і зберігати треба саме позицію.
  const [step, setStep] = useState(0);
  const phase = slotPhaseAt(step, hasNews);
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
