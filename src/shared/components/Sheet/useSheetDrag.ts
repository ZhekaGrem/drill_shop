// src/shared/components/Sheet/useSheetDrag.ts
// Жест «потягнути вниз, щоб закрити». Винесений із розмітки, бо це єдина
// частина шторки з власним станом і крайніми випадками.
import { useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

// Поріг швидкості (px/ms). Швидкий короткий кидок має закривати шторку так само,
// як повільне протягування через пів екрана: користувач висловив намір.
const VELOCITY_THRESHOLD = 0.11;
// Частка висоти шторки, після якої відпускання закриває її.
const DISTANCE_RATIO = 0.35;

export function useSheetDrag(onClose: () => void) {
  const [offset, setOffset] = useState(0);
  // isDragging — саме стан, а не читання ref: ref не викликає перерендер,
  // тому data-dragging (який вимикає transition) вішався б із запізненням
  // на кадр, і перший рух пальця йшов би через 300-мілісекундну анімацію.
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const startTime = useRef(0);
  const pointerId = useRef<number | null>(null);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    // Другий дотик під час перетягування ігноруємо: інакше шторка
    // стрибне до позиції нового пальця.
    if (pointerId.current !== null) return;

    pointerId.current = e.pointerId;
    startY.current = e.clientY;
    startTime.current = e.timeStamp;
    setIsDragging(true);
    // Захоплюємо вказівник, щоб перетягування не обірвалось,
    // коли палець вийде за межі ручки.
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerId.current !== e.pointerId) return;

    const delta = e.clientY - startY.current;
    // Вгору тягнути можна, але з опором: різка стінка відчувається як поломка,
    // а сповільнення читається як межа.
    setOffset(delta < 0 ? delta / 4 : delta);
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerId.current !== e.pointerId) return;

    const delta = e.clientY - startY.current;
    const elapsed = e.timeStamp - startTime.current;
    const velocity = elapsed > 0 ? delta / elapsed : 0;
    const height = e.currentTarget.closest('[data-sheet-content]')?.clientHeight ?? 0;

    pointerId.current = null;
    setIsDragging(false);
    setOffset(0);

    if (velocity > VELOCITY_THRESHOLD || delta > height * DISTANCE_RATIO) {
      onClose();
    }
  };

  return { offset, isDragging, onPointerDown, onPointerMove, onPointerUp };
}
