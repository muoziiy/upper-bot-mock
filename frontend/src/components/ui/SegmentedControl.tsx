import React from 'react';
import { motion } from 'framer-motion';

interface SegmentedControlProps {
    options: { label: string; value: string }[];
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

const SegmentedControl: React.FC<SegmentedControlProps> = ({ options, value, onChange, className = '' }) => {
    return (
        <div className={`relative flex w-full rounded-lg bg-tg-bg p-1 ${className}`}>
            {options.map((option) => {
                const isActive = value === option.value;
                return (
                    <button
                        key={option.value}
                        onClick={() => onChange(option.value)}
                        className={`relative z-10 flex-1 py-2 text-sm font-medium transition-colors duration-200 ${isActive ? 'text-tg-text' : 'text-tg-hint'
                            }`}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="segmented-control-active"
                                className="absolute inset-0 z-[-1] rounded-md bg-tg-secondary shadow-sm"
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            />
                        )}
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
};

export default SegmentedControl;
