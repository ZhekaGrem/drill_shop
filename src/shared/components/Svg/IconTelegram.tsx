import React from 'react';

// 1. Добавляем size в интерфейс (он может быть числом или строкой)
interface IconProps extends React.ComponentPropsWithoutRef<'svg'> {
  size?: number | string;
}

// 2. Деструктурируем size и задаем значение по умолчанию (например, 17)
export function IconTelegram({ className, size = 24, ...props }: IconProps) {
  return (


    <svg className={className}
      {...props}
      width={size}
      height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g>
        <path
          d="M20 22H22V2H20V4H16V6H18V8H20V18H16V20H20V22ZM0 14H4V12H0V14ZM8 24H10V22H12V20H10V16H12V14H4V16H8V24ZM4 12H8V10H4V12ZM12 20H14V18H16V16H12V20ZM12 14H14V12H12V14ZM8 10H12V8H8V10ZM14 12H16V10H14V12ZM12 8H16V6H12V8ZM16 10H18V8H16V10Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="clip0_8_480">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
