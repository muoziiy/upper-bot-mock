import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
}

const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
    return (
        <div
            className={cn('rounded-xl bg-tg-button/10 backdrop-blur-xl p-4 border border-white/5', className)}
            {...props}
        >
            {children}
        </div>
    );
};

Card.displayName = "Card";
export { Card };
