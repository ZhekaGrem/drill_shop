import React from 'react';
interface IconProps extends React.ComponentPropsWithoutRef<'svg'> {}
export function MenuIcon({ className, ...props }: IconProps) {
  return (
    <svg
      className={className}
      {...props}
      width="16"
      height="12"
      viewBox="0 0 16 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path d="M0 0H16V2H0V0ZM0 5H16V7H0V5ZM16 10H0V12H16V10Z" fill="#33603B" />
    </svg>
  );
}
