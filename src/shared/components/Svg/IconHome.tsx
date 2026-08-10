// Будинок у геометрії таб-бара Дії: заокруглений гребінь даху, тіло з
// великими радіусами, без дверей і дрібних деталей (в іконках Дії їх немає).
// Починалось із tabler/home — той має гострий дах і двері.
import React from 'react';
interface IconProps extends React.ComponentPropsWithoutRef<'svg'> {
  size?: number;
}
export function IconHome({ className, size = 24, ...props }: IconProps) {
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
      <path d="M3.8 11.3l7.1 -6.1a1.7 1.7 0 0 1 2.2 0l7.1 6.1" />
      <path d="M5.5 12.8v4.7a2.5 2.5 0 0 0 2.5 2.5h8a2.5 2.5 0 0 0 2.5 -2.5v-4.7" />
    </svg>
  );
}
