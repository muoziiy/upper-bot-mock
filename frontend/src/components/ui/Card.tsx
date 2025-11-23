import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

const Card: React.FC<CardProps> = ({ children, className }) => {
    return (
        <div
            className={cn(
                'rounded-xl bg-tg-bg/70 backdrop-blur-md p-4 shadow-sm border border-tg-hint/5',
                className
            )}
        >
            {children}
        </div>
    );
};

Card.displayName = "Card";
export { Card };
