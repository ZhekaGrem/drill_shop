// Сумка в геометрії таб-бара Дії: симетричне тіло з великими радіусами,
// ручка-дуга закінчується на краю сумки, а не заходить усередину
// (в іконках Дії деталі не перетинаються). Починалось із tabler/shopping-bag.
import React from 'react';
interface IconProps extends React.ComponentPropsWithoutRef<'svg'> {
  size?: number;
}
export function IconCart({ className, size = 24, ...props }: IconProps) {
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
      <path d="M6.2 8.5h11.6a1.6 1.6 0 0 1 1.59 1.8l-.9 7.2a3 3 0 0 1 -2.98 2.63h-7.02a3 3 0 0 1 -2.98 -2.63l-.9 -7.2a1.6 1.6 0 0 1 1.59 -1.8z" />
      <path d="M8.8 8.5v-1.3a3.2 3.2 0 0 1 6.4 0v1.3" />
    </svg>
  );
}
