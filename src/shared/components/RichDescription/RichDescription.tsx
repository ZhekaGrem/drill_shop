// src/shared/components/RichDescription/RichDescription.tsx
// Опис із БД з підтримкою маркдаун-лінків [текст](url): власник може вплітати
// посилання (інстаграм автора дизайну тощо) прямо в текст без деплою.
// Лінки на instagram.com отримують іконку. Решта тексту — як був.
import type { ReactNode } from 'react';
import { IconInstagramColor } from '@/shared/components/Svg';
import styles from './RichDescription.module.scss';

const LINK_RE = /\[([^\]]+)\]\(([^)\s]+)\)/g;

export const RichDescription = ({ text }: { text: string }) => {
  const nodes: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(LINK_RE)) {
    const [full, label, url] = match;
    if (match.index > last) nodes.push(text.slice(last, match.index));
    nodes.push(
      <a key={match.index} href={url} target="_blank" rel="noreferrer" className={styles.link}>
        {url.includes('instagram.com') && <IconInstagramColor size={16} />}
        {label}
      </a>
    );
    last = match.index + full.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return <>{nodes}</>;
};
