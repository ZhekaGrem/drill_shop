// src/widgets/Header/useSlotAlternation.ts
// Такт слота меню/чат: 5 с меню, 5 с чат, по колу, без зупинки (рішення
// власника, спека 2026-09-17-wishes-chat-slot-design.md).
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

export type SlotPhase = 'menu' | 'chat';

export const SLOT_PERIOD_MS = 5000;

export const useSlotAlternation = (paused: boolean) => {
  const [phase, setPhase] = useState<SlotPhase>('menu');
  // Ref, а не стан: зміна утримання не має перерендерювати хедер,
  // вона лише впливає на наступний тік.
  const heldRef = useRef(false);
  // Інкремент перезапускає інтервал (повернення у вкладку)
  const [epoch, setEpoch] = useState(0);

  const [seenPaused, setSeenPaused] = useState(paused);
  if (seenPaused !== paused) {
    setSeenPaused(paused);
    if (!paused) setPhase('menu');
  }

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      if (heldRef.current) return;
      setPhase((p) => (p === 'menu' ? 'chat' : 'menu'));
    }, SLOT_PERIOD_MS);
    return () => window.clearInterval(id);
  }, [paused, epoch]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState !== 'visible') return;
      setPhase('menu');
      setEpoch((e) => e + 1);
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const hold = () => {
    heldRef.current = true;
  };
  const release = () => {
    heldRef.current = false;
  };

  return {
    phase,
    holdHandlers: { onPointerEnter: hold, onPointerLeave: release, onFocus: hold, onBlur: release },
  };
};
