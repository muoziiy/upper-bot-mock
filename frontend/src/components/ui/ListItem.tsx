import React from 'react';
import { ChevronRight } from 'lucide-react';

interface ListItemProps {
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
            className={`
                relative flex items-center gap-3 px-4 py-3 transition-colors
                ${onClick ? 'cursor-pointer active:bg-tg-secondary' : ''}
                ${className}
            `}
        >
            {/* Icon */}
            {icon && (
                <div className="flex-shrink-0 text-tg-button">
                    {icon}
                </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium ${destructive ? 'text-red-500' : 'text-tg-text'}`}>
                    {title}
                </div>
                {subtitle && (
                    <div className="text-xs text-tg-hint truncate">
                        {subtitle}
                    </div>
                )}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2">
                {value && (
                    <span className="text-sm text-tg-hint">
                        {value}
                    </span>
                )}
                {rightElement}
                {showChevron && (
                    <ChevronRight size={16} className="text-tg-hint/50" />
                )}
            </div>

            {/* Separator (if not last) */}
            {!isLast && (
                <div className="absolute bottom-0 left-[52px] right-0 h-[0.5px] bg-tg-hint/20" />
            )}
        </div>
    );
};
