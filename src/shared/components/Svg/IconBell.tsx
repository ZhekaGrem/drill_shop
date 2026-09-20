// Дзвіночок для слота новин у хедері — та сама сітка й товщина лінії, що в
// MenuIcon і IconChat (24, stroke 1.75, круглі кінці). Контур із
// tabler/bell: без «язичка» всередині, щоб на 24px не злипалось у пляму.
import React from 'react';

interface IconProps extends React.ComponentPropsWithoutRef<'svg'> {
  size?: number;
}

export function IconBell({ className, size = 24, ...props }: IconProps) {
  return (
    <svg
      className={className}
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M10 5a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6" />
      <path d="M9 17v1a3 3 0 0 0 6 0v-1" />
    </svg>
  );
}
