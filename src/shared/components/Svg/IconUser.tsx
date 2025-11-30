import React from 'react'
interface IconProps extends React.ComponentPropsWithoutRef<'svg'> { }
export function IconUser({ className, ...props }: IconProps) {
    return (
 
<svg className={className}
            {...props} width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11 0H5V2H3V8H5V2H11V0ZM11 8H5V10H11V8ZM11 2H13V8H11V2ZM0 14H2V12H14V14H2V18H14V14H16V20H0V14Z" fill="#33603B"/>
</svg>


    )
}

