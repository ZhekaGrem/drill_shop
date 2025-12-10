import React from 'react';

// 1. Добавляем size в интерфейс (он может быть числом или строкой)
interface IconProps extends React.ComponentPropsWithoutRef<'svg'> {
  size?: number | string;
}

// 2. Деструктурируем size и задаем значение по умолчанию (например, 17)
export function IconInstagram({ className, size = 24, ...props }: IconProps) {
  return (

    <svg className={className}
      {...props} width={size}
      height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g>
        <path
          d="M2 4H0V22H2V4ZM2 4H20V2H2V4ZM2 24H20V22H2V24ZM6 16H8V10H6V16ZM8 18H14V16H8V18ZM8 10H14V8H8V10ZM14 16H16V10H14V16ZM20 22H22V4H20V22ZM16 8H18V6H16V8Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="clip0_8_476">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
