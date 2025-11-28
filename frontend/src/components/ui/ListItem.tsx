import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ListItemProps {
    icon?: React.ReactNode;
    title: string;
    subtitle?: React.ReactNode;
    value?: React.ReactNode;
    onClick?: () => void;
    rightElement?: React.ReactNode;
    showChevron?: boolean;
    className?: string;
    isLast?: boolean;
    destructive?: boolean;
}

export const ListItem: React.FC<ListItemProps> = ({
    icon,
    title,
    subtitle,
    value,
    onClick,
    rightElement,
    showChevron = false,
    className = '',
    isLast = false,
    destructive = false
}) => {
    return (
        <div
            onClick={onClick}
            className={cn(
                "relative flex items-center gap-3 px-4 py-3 transition-colors bg-white dark:bg-tg-secondary",
                onClick && "cursor-pointer active:bg-gray-100 dark:active:bg-white/5",
                className
            )}
        >
            {/* Icon */}
            {icon && (
                <div className="flex-shrink-0 text-tg-button text-xl w-7 flex justify-center">
                    {icon}
                </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0 py-0.5">
                <div className={cn("text-[17px] leading-snug", destructive ? 'text-red-500' : 'text-black dark:text-white')}>
                    {title}
                </div>
                {subtitle && (
                    <div className="text-[15px] text-tg-hint truncate leading-snug">
                        {subtitle}
                    </div>
                )}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2 pl-2">
                {value && (
                    <span className="text-[17px] text-tg-hint">
                        {value}
                    </span>
                )}
                {rightElement}
                {showChevron && (
                    <ChevronRight size={20} className="text-tg-hint/30" />
                )}
            </div>

            {/* Separator (if not last) */}
            {!isLast && (
                <div className="absolute bottom-0 left-[56px] right-0 h-[0.5px] bg-gray-200 dark:bg-white/10" />
            )}
        </div>
    );
};
