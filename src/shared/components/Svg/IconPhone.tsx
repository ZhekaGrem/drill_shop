import React from 'react';

// 1. Добавляем size в интерфейс (он может быть числом или строкой)
interface IconProps extends React.ComponentPropsWithoutRef<'svg'> {
  size?: number | string;
}

// 2. Деструктурируем size и задаем значение по умолчанию (например, 17)
export function IconPhone({ className, size = 24, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none">
      <path d="M4 24H18V2H4V24ZM6 22V4H8V6H14V4H16V22H6Z" fill="#33603B" />
    </svg>
  );
}
