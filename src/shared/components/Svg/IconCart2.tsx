import React from 'react'
interface IconProps extends React.ComponentPropsWithoutRef<'svg'> { }
export function IconCart({ className, ...props }: IconProps) {
    return (
        <svg className={className}
            {...props} width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 0H12V2H6V0ZM12 4V2H14V4H18V20H0V4H4V2H6V4H12ZM12 6H6V8H4V6H2V18H16V6H14V8H12V6Z" fill="#33603B" />
        </svg>

    )
}

