import React from 'react';

interface ListGroupProps {
    children: React.ReactNode;
    header?: string;
    className?: string;
}

export const ListGroup: React.FC<ListGroupProps> = ({ children, header, className = '' }) => {
    return (
        <div className={`mb-6 ${className}`}>
            {header && (
                <div className="px-4 pb-2 text-xs font-medium uppercase text-tg-hint">
                    {header}
                </div>
            )}
            <div className="overflow-hidden rounded-xl bg-tg-bg">
                {children}
            </div>
        </div>
    );
};
