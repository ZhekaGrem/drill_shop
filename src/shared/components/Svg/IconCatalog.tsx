// Сітка 2×2 сильно закруглених квадратів — та сама геометрія, що в таба
// «Сервіси» застосунку Дія (rx 2.4 проти rx 1 у tabler/layout-grid, звідки
// іконка починалась). Сітка, а не бургер: у нижній панелі бургер читається
// як «ще меню», а це таб каталогу — сітка товарів.
import React from 'react';
interface IconProps extends React.ComponentPropsWithoutRef<'svg'> {
  size?: number;
}
export function IconCatalog({ className, size = 24, ...props }: IconProps) {
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
      <rect x="4" y="4" width="7" height="7" rx="2.4" />
      <rect x="13" y="4" width="7" height="7" rx="2.4" />
      <rect x="4" y="13" width="7" height="7" rx="2.4" />
      <rect x="13" y="13" width="7" height="7" rx="2.4" />
    </svg>
  );
}
