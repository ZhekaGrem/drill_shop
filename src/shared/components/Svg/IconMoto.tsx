// Іконка «Дріл Мото» для слота хедера: мотоцикл з колесами й райдером у
// шоломі, на тій самій 24px-сітці, що й решта контурних іконок слота.
import React from 'react';

interface IconProps extends React.ComponentPropsWithoutRef<'svg'> {
  size?: number;
}

export function IconMoto({ className, size = 24, ...props }: IconProps) {
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
      strokeLinejoin="round"
      aria-hidden="true">
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <circle cx="6" cy="17" r="3" />
      <circle cx="18" cy="17" r="3" />
      <path d="M6 17l3.5 -6h4l2 6m-7 -1h6m-3 -5l2.5 -3h2.5l1 3" />
      <path d="M10 11l-1 -3l2 -2h2.5" />
      <path d="M12 6a2.25 2.25 0 1 0 -2.25 -2.25a2.25 2.25 0 0 0 2.25 2.25z" />
      <path d="M10 3.75h2.5" />
    </svg>
  );
}
