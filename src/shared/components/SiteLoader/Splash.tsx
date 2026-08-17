'use client';
// Сплеш першого відкриття: рендериться на сервері, тож приходить у першому ж
// HTML і накриває сторінку фірмовим лоадером, поки застосунок оживає.
// Після гідрації показуємо його ще мить (SHOW_MS, щоб не було смикання на
// швидких з'єднаннях), плавно розчиняємо і прибираємо з DOM. Кліки він не
// блокує вже з початку зникнення (pointer-events: none у .splashOut).
// Якщо JS взагалі не довантажився, CSS-фолбек splashAway (SiteLoader.module)
// ховає сплеш сам — сайт ніколи не лишається накритим назавжди.
import { useEffect, useState } from 'react';
import { SiteLoader } from './SiteLoader';
import styles from './SiteLoader.module.scss';

const SHOW_MS = 500; // мінімальний показ після гідрації
const FADE_MS = 400; // має збігатись із transition у .splashOut

export const Splash = () => {
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const start = setTimeout(() => setLeaving(true), SHOW_MS);
    const end = setTimeout(() => setGone(true), SHOW_MS + FADE_MS);
    return () => {
      clearTimeout(start);
      clearTimeout(end);
    };
  }, []);

  if (gone) return null;
  return (
    <div className={leaving ? `${styles.splash} ${styles.splashOut}` : styles.splash}>
      <SiteLoader fill />
    </div>
  );
};
