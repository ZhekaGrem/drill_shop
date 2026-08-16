// src/widgets/ProductV2/useActionOffscreen.ts
// «Чи вийшла головна кнопка з кадру» — умова появи липкої панелі дії.
// Спостерігаємо саме за кнопкою, а не за позицією скролу: дві однакові головні
// кнопки одночасно на екрані знецінюють обидві (Von Restorff), тому панель
// зʼявляється рівно тоді, коли інлайн-кнопки не видно.
'use client';

import { useEffect, useState } from 'react';

// Нижня навігація лежить `fixed` поверх контенту, тож кнопка під нею
// технічно ще в кадрі, а для ока вже ні. Висоту беремо з того самого токена,
// що й сама панель (`--bottom-nav-height`), а не цифрою: інакше зміна токена
// тихо розсинхронізує CSS і JS.
const navOverlap = () => {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--bottom-nav-height');
  return Number.parseInt(raw, 10) || 0;
};

/**
 * Повертає callback-ref для елемента, за яким стежимо, і прапорець «його не видно».
 * Поки елемента немає (архівна колекція — кнопки не рендеримо) прапорець хибний.
 */
export function useActionOffscreen<T extends Element>() {
  // Саме стан, а не useRef: callback-ref з setState перезапускає ефект тоді,
  // коли вузол справді змінився — ref.current цього не робить.
  const [node, setNode] = useState<T | null>(null);
  const [offscreen, setOffscreen] = useState(false);

  useEffect(() => {
    if (!node) {
      setOffscreen(false);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => setOffscreen(!entry.isIntersecting), {
      rootMargin: `0px 0px -${navOverlap()}px 0px`,
    });
    observer.observe(node);

    return () => observer.disconnect();
  }, [node]);

  return [setNode, offscreen] as const;
}
