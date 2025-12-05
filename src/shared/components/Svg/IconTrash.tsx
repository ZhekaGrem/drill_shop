import React from 'react';
interface IconProps extends React.ComponentPropsWithoutRef<'svg'> {}
export function IconTrash({ className, ...props }: IconProps) {
  return (
  
    <svg   className={className}
      {...props} width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11.6667 0V3.33333H16.6667V5H15V16.6667H1.66667V5H0V3.33333H5V0H11.6667ZM10 1.66667H6.66667V3.33333H10V1.66667ZM10 5H3.33333V15H13.3333V5H10ZM5.83333 6.66667H7.5V13.3333H5.83333V6.66667ZM10.8333 6.66667H9.16667V13.3333H10.8333V6.66667Z" fill="#33603B"/>
</svg>

  );
}
