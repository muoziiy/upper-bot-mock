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
    disabled?: boolean;
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
    destructive = false,
    disabled = false
}) => {
    return (
        <div
            onClick={!disabled ? onClick : undefined}
            className={cn(
                "relative flex items-center gap-3 px-4 py-2 transition-colors",
                onClick && !disabled && "cursor-pointer active:bg-black/5 dark:active:bg-white/10",
                disabled && "opacity-50 cursor-not-allowed",
                className
            )}
        >
            {/* Icon */}
            {icon && (
                <div className="flex-shrink-0 text-tg-button text-[26px] w-8 flex justify-center">
                    {icon}
                </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0 py-0.5">
                <div className={cn("text-[17px] leading-snug", destructive ? 'text-red-500' : 'text-tg-text')}>
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
                <div className="absolute bottom-0 left-[60px] right-0 h-[0.5px] bg-black/5 dark:bg-white/10" />
            )}
        </div>
    );
};
