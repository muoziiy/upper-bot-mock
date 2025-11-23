import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

const Card: React.FC<CardProps> = ({ children, className }) => {
    return (
        <div
            className={cn('rounded-xl bg-tg-button/30 backdrop-blur-xl p-4 border border-tg-hint/20 shadow-2xl', className)}
        >
            {children}
        </div>
    );
};

Card.displayName = "Card";
export { Card };
