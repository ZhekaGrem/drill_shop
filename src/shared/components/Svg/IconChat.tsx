// Бульбашка повідомлення для слота «Запропонувати ідею» в хедері — та сама
// сітка й товщина лінії, що в MenuIcon (24, stroke 1.75, круглі кінці).
// Контур узято з tabler/message-circle: мʼякий хвостик знизу зліва, без
// «трикутника» під обріз, оптичний розмір як у трьох ліній бургера.
import React from 'react';

interface IconProps extends React.ComponentPropsWithoutRef<'svg'> {
  size?: number;
}

export function IconChat({ className, size = 24, ...props }: IconProps) {
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
      <path d="M3 20l1.3 -3.9c-2.324 -3.437 -1.426 -7.872 2.1 -10.374c3.526 -2.501 8.59 -2.296 11.845 .48c3.255 2.777 3.695 7.266 1.029 10.501c-2.666 3.235 -7.615 4.215 -11.574 2.293l-4.7 1" />
    </svg>
  );
}
