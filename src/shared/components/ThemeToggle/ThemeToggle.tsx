// src/shared/components/ThemeToggle/ThemeToggle.tsx
// ТИМЧАСОВИЙ тумблер дарк-моду (власник видалить після обкатки).
// Клік пише явний вибір у localStorage.theme — він перекриває автоправило
// «темна з 18:00 до 6:00» (інлайн-скрипт у layout). Поки вибору нема,
// щохвилини звіряємось із годинником — перемикання о 18:00 живе.
'use client';

import { useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

const byClock = (): Theme => {
  const h = new Date().getHours();
  return h >= 18 || h < 6 ? 'dark' : 'light';
};

const apply = (theme: Theme) => {
  const d = document.documentElement;
  d.setAttribute('data-theme', theme);
  d.setAttribute('data-mantine-color-scheme', theme);
};

export const ThemeToggle = ({ className }: { className?: string }) => {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme((document.documentElement.getAttribute('data-theme') as Theme) ?? 'light');
    const tick = setInterval(() => {
      if (localStorage.getItem('theme')) return; // явний вибір — годинник не втручається
      const auto = byClock();
      apply(auto);
      setTheme(auto);
    }, 60_000);
    return () => clearInterval(tick);
  }, []);

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', next);
    apply(next);
    setTheme(next);
  };

  return (
    <button
      type="button"
      className={className}
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Світла тема' : 'Темна тема'}>
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
};
