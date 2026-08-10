// Іконка з Tabler Icons (outline, MIT) — єдина іконографіка в мові Дії.
// Згенеровано з @tabler/icons/icons/outline/clock.svg
import React from 'react';
interface IconProps extends React.ComponentPropsWithoutRef<'svg'> {
  size?: number;
}
export function IconClock({ className, size = 24, ...props }: IconProps) {
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
      <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}
