// Бургер таба «Меню» — та сама іконка, що в застосунку Дія на цьому табі:
// три однакові лінії з круглими кінцями, трохи щільніше згруповані,
// ніж у tabler/menu-2, звідки іконка починалась.
import React from 'react';
interface IconProps extends React.ComponentPropsWithoutRef<'svg'> {
  size?: number;
}
export function MenuIcon({ className, size = 24, ...props }: IconProps) {
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
      <path d="M4.5 6.75l15 0" />
      <path d="M4.5 12l15 0" />
      <path d="M4.5 17.25l15 0" />
    </svg>
  );
}
