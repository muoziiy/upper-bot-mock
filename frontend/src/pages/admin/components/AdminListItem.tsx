import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface AdminListItemProps {
    icon?: React.ReactNode;
    title: string;
    subtitle?: string;
    value?: React.ReactNode;
    onClick?: () => void;
    rightElement?: React.ReactNode;
    showChevron?: boolean;
    className?: string;
    isLast?: boolean;
    destructive?: boolean;
    disabled?: boolean;
    iconColor?: string; // Tailwind class for background color, e.g., 'bg-blue-500'
}

export const AdminListItem: React.FC<AdminListItemProps> = ({
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
    disabled = false,
    iconColor = 'bg-gray-400'
}) => {
    return (
        <div
            onClick={!disabled ? onClick : undefined}
            className={cn(
                "relative flex items-center gap-3 pl-4 pr-4 py-2.5 transition-colors bg-white dark:bg-[#1C1C1E]",
                onClick && !disabled && "cursor-pointer active:bg-gray-100 dark:active:bg-[#2C2C2E]",
                disabled && "opacity-50 cursor-not-allowed",
                className
            )}
        >
            {/* Icon with colored background */}
            {icon && (
                <div className={cn(
                    "flex-shrink-0 w-[29px] h-[29px] rounded-[7px] flex items-center justify-center text-[18px]",
                    iconColor
                )}>
                    {icon}
                </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0 py-0.5">
                <div className={cn("text-[17px] leading-snug font-normal", destructive ? 'text-red-500' : 'text-black dark:text-white')}>
                    {title}
                </div>
                {subtitle && (
                    <div className="text-[13px] leading-snug text-[#8E8E93] mt-0.5">
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
                <div className="absolute bottom-0 left-[58px] right-0 h-[0.5px] bg-[#C6C6C8] dark:bg-[#38383A]" />
            )}
        </div>
    );
};
