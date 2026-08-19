'use client';
// «Компас» — перемикач товарів колекції барабаном: активний товар завжди по
// осі симетрії, стрічка примагнічується (scroll-snap), периферія меншає й
// гасне, під центром стоїть назва.
//
// Ключове: сцена НЕ переписується. HeroVisual уже контрольований
// (value + onChange), тож компас просто викликає onChange — так само, як це
// робив клік по свотчу. Джерело зміни для 3D неістотне.
//
// Дві незалежні механіки навмисно розведені:
//   • який товар активний — IntersectionObserver з вузькою смугою по центру
//     (семантика, спрацьовує рівно на перетині осі);
//   • наскільки елемент зменшений і згаслий — rAF на скролі (візуал, потребує
//     плавності кожного кадру, тому лише transform/opacity).
import { useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from './CompassSwitcher.module.scss';

export interface CompassItem {
  key: string;
  label: string;
  image: string;
}

interface CompassSwitcherProps {
  items: CompassItem[];
  value: string;
  onChange: (key: string) => void;
  /** Діаметр активної плитки; периферія масштабується від нього */
  size?: number;
  /**
   * true — кадр наближений на груди (видно графіку принта),
   * false — повна картка-мініатюра (видно силует і колір тканини).
   */
  crop?: boolean;
}

// Наскільки далеко (в ширинах плитки) елемент згасає до мінімуму
const FALLOFF = 2.2;
const MIN_SCALE = 0.66;
const MIN_OPACITY = 0.35;

export const CompassSwitcher = ({
  items,
  value,
  onChange,
  size = 60,
  crop = true,
}: CompassSwitcherProps) => {
  const trackRef = useRef<HTMLDivElement>(null);
  // Останнє значення, віддане назовні: захист від зациклення
  // «скрол → onChange → проп value → програмний скрол → скрол…»
  const emitted = useRef(value);
  const frame = useRef(0);

  // Візуальний барабан: перерахунок масштабу й прозорості за відстанню до осі
  const paint = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const axis = track.getBoundingClientRect().left + track.clientWidth / 2;
    for (const el of Array.from(track.children) as HTMLElement[]) {
      const box = el.getBoundingClientRect();
      const distance = Math.abs(box.left + box.width / 2 - axis) / (box.width * FALLOFF);
      const t = Math.min(1, distance);
      el.style.setProperty('--scale', String(1 - (1 - MIN_SCALE) * t));
      el.style.setProperty('--dim', String(1 - (1 - MIN_OPACITY) * t));
    }
  }, []);

  const onScroll = useCallback(() => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(paint);
  }, [paint]);

  // Активний товар = той, що перетнув вісь. rootMargin стискає область
  // спостереження до вертикальної смужки шириною ~2% по центру стрічки, тож
  // подія приходить рівно тоді, коли плитка стала центральною.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const key = (entry.target as HTMLElement).dataset.key;
          if (key && key !== emitted.current) {
            emitted.current = key;
            onChange(key);
          }
        }
      },
      { root: track, rootMargin: '0px -49% 0px -49%', threshold: 0 }
    );
    Array.from(track.children).forEach((el) => io.observe(el));
    paint();
    return () => io.disconnect();
  }, [items, onChange, paint]);

  // Зміна ззовні (клік у списку, глибокий лінк) — підвести стрічку до осі.
  // Якщо значення прийшло від власного скролу, нічого не робимо.
  useEffect(() => {
    if (value === emitted.current) return;
    emitted.current = value;
    const el = trackRef.current?.querySelector<HTMLElement>(`[data-key="${CSS.escape(value)}"]`);
    el?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, [value]);

  const center = (key: string) => {
    const el = trackRef.current?.querySelector<HTMLElement>(`[data-key="${CSS.escape(key)}"]`);
    el?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  };

  const active = items.find((i) => i.key === value);

  return (
    <div className={styles.compass} style={{ '--tile': `${size}px` } as React.CSSProperties}>
      <div
        ref={trackRef}
        className={styles.track}
        onScroll={onScroll}
        role="listbox"
        aria-label="Товари колекції"
        tabIndex={0}>
        {items.map((it) => (
          <button
            key={it.key}
            data-key={it.key}
            type="button"
            role="option"
            aria-selected={it.key === value}
            aria-label={it.label}
            className={`${styles.tile} ${crop ? styles.cropped : styles.full}`}
            onClick={() => center(it.key)}>
            {/* eager, а не lazy: стрічка гортається швидше, ніж вантажиться
                картинка, і під пальцем зʼявлялися порожні плитки. 300px —
                під 60px-плитку з 2.5× кропом на retina; оптимізатор Next
                віддає саме такий розмір, а не вихідні 1600². */}
            <Image src={it.image} alt="" width={300} height={300} loading="eager" />
          </button>
        ))}
      </div>

      {/* Стрілка компаса: назва зʼявляється тільки під центральним товаром
          і робить безлике зображення зрозумілим */}
      <p className={styles.needle} aria-live="polite">
        {active?.label}
      </p>
    </div>
  );
};
