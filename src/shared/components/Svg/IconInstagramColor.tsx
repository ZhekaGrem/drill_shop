// Кольорова інстаграм-іконка: ті самі контури Tabler, але обведення —
// фірмовий градієнт Instagram (жовтий → червоний → фіолетовий). Для місць,
// де іконка мусить впадати в око (лінк автора в описі колекції).
// useId — щоб id градієнта не конфліктували між кількома іконками на сторінці.
import React, { useId } from 'react';

interface IconProps extends React.ComponentPropsWithoutRef<'svg'> {
  size?: number;
}

export function IconInstagramColor({ className, size = 24, ...props }: IconProps) {
  const gradientId = useId();
  return (
    <svg
      className={className}
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={`url(#${gradientId})`}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round">
      <defs>
        <radialGradient id={gradientId} cx="30%" cy="107%" r="150%">
          <stop offset="0%" stopColor="#fdf497" />
          <stop offset="10%" stopColor="#fdf497" />
          <stop offset="45%" stopColor="#fd5949" />
          <stop offset="65%" stopColor="#d6249f" />
          <stop offset="90%" stopColor="#285aeb" />
        </radialGradient>
      </defs>
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M4 8a4 4 0 0 1 4 -4h8a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-8a4 4 0 0 1 -4 -4z" />
      <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
      <path d="M16.5 7.5v.01" />
    </svg>
  );
}
