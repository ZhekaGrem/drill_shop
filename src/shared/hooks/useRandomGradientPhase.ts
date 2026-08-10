// src/shared/hooks/useRandomGradientPhase.ts
'use client';

import { useEffect } from 'react';

/** Має збігатися з --gradient-btn-cycle у globals.css. */
const CYCLE_SECONDS = 10;

const SELECTOR = [
  '[data-gradient-btn]',
  '.mantine-Button-root[data-variant="filled"]:not([data-plain]):not([data-ds-button])',
].join(', ');

/**
 * Робить градієнтний hover кнопок по-справжньому випадковим.
 *
 * Сама анімація (`granimate`) крутиться безперервно під чорною маскою, тож
 * кожне наведення й так відкриває інший кадр — так це зроблено в Дії. Але два
 * наведення підряд за секунду потрапляють майже в ту саму точку циклу. Тому на
 * вхід курсора виставляємо негативний `animation-delay`: анімація миттєво
 * перестрибує у випадкову точку тих самих 10 секунд і пливе далі.
 *
 * Слухач один, делегований на document — інакше довелося б вішати обробник на
 * кожну кнопку, а до Mantine-кнопок через тему події не прив'яжеш. Заразом
 * працює для кнопок, що з'явилися після рендеру: модалки, пагінація, підвантажені списки.
 *
 * `Math.random()` викликається ТІЛЬКИ всередині обробника події, ніколи під час
 * рендеру, тому hydration mismatch неможливий.
 */
export function useRandomGradientPhase() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const handleMouseOver = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const button = target?.closest<HTMLElement>(SELECTOR);
      if (!button) return;

      // mouseover спливає, тому він стріляє і на переходах між дітьми кнопки
      // (label, іконка). Без цієї перевірки градієнт смикався б посеред наведення.
      const from = event.relatedTarget as Node | null;
      if (from && button.contains(from)) return;

      button.style.animationDelay = `-${Math.random() * CYCLE_SECONDS}s`;
    };

    document.addEventListener('mouseover', handleMouseOver);
    return () => document.removeEventListener('mouseover', handleMouseOver);
  }, []);
}
