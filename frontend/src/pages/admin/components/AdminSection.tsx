import React from 'react';
import { cn } from '../../../lib/utils';

interface AdminSectionProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string;
    footer?: string;
}

export const AdminSection: React.FC<AdminSectionProps> = ({
    className,
    title,
    footer,
    children,
    ...props
}) => {
    return (
        <div className={cn("mb-6 mx-4", className)} {...props}>
            {title && (
                <div className="mb-2 px-4">
                    <h3 className="text-[13px] font-normal uppercase leading-4 text-[#6D6D72] dark:text-[#8E8E93] tracking-wide">
                        {title}
                    </h3>
                </div>
            )}
            <div className="overflow-hidden rounded-[10px]">
                {children}
            </div>
            {footer && (
                <div className="mt-2 px-4">
                    <p className="text-[13px] text-[#6D6D72] dark:text-[#8E8E93]">
                        {footer}
                    </p>
                </div>
            )}
        </div>
    );
};
