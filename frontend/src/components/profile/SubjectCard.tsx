import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ChevronRight, CheckCircle } from 'lucide-react';
import { Card } from '../ui/Card';

interface SubjectCardProps {
    subject: {
        id: string;
        name: string;
        teacher_name: string;
        progress?: number;
        color?: string;
    };
    isSelected?: boolean;
    onClick?: () => void;
}

const SubjectCard: React.FC<SubjectCardProps> = ({ subject, isSelected = false, onClick }) => {
    const color = subject.color || '#3390ec';
    const progress = subject.progress || 0;

    return (
        <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            layout
        >
            <Card
                className={`p-4 cursor-pointer transition-all relative overflow-hidden ${isSelected
                        ? 'bg-tg-button/5 border-tg-button/20'
                        : 'hover:bg-tg-secondary/50'
                    }`}
            >
                {/* Accent bar on left side when selected */}
                {isSelected && (
                    <motion.div
                        layoutId="selectedSubjectIndicator"
                        className="absolute left-0 top-0 bottom-0 w-1 rounded-r"
                        style={{ backgroundColor: color }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                )}

                <div className="flex items-center gap-3">
                    {/* Subject Icon with Progress Ring */}
                    <div className="relative flex-shrink-0">
                        <svg className="absolute inset-0 w-12 h-12 -rotate-90">
                            {/* Background circle */}
                            <circle
                                cx="24"
                                cy="24"
                                r="20"
                                fill="none"
                                stroke={`${color}20`}
                                strokeWidth="2"
                            />
                            {/* Progress circle */}
                            <motion.circle
                                cx="24"
                                cy="24"
                                r="20"
                                fill="none"
                                stroke={color}
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 20}`}
                                initial={{ strokeDashoffset: 2 * Math.PI * 20 }}
                                animate={{
                                    strokeDashoffset: 2 * Math.PI * 20 * (1 - progress / 100)
                                }}
                                transition={{ duration: 1, ease: "easeOut" }}
                            />
                        </svg>

                        <div
                            className="w-12 h-12 rounded-full flex items-center justify-center relative"
                            style={{ backgroundColor: `${color}20` }}
                        >
                            <BookOpen size={20} style={{ color }} />
                        </div>
                    </div>

                    {/* Subject Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-tg-text truncate">
                                {subject.name}
                            </h3>
                            {progress === 100 && (
                                <CheckCircle
                                    size={16}
                                    className="flex-shrink-0"
                                    style={{ color: '#10b981' }}
                                />
                            )}
                        </div>
                        <p className="text-xs text-tg-hint truncate mb-1">
                            {subject.teacher_name}
                        </p>
                        {progress > 0 && (
                            <div className="flex items-center gap-2">
                                <div className="flex-1 h-1 bg-tg-hint/20 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full rounded-full"
                                        style={{ backgroundColor: color }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                    />
                                </div>
                                <span
                                    className="text-[10px] font-semibold"
                                    style={{ color }}
                                >
                                    {progress}%
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Chevron Indicator */}
                    <motion.div
                        animate={{
                            x: isSelected ? 2 : 0,
                            color: isSelected ? color : 'var(--tg-theme-hint-color)'
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                        <ChevronRight
                            size={20}
                            className="flex-shrink-0"
                        />
                    </motion.div>
                </div>
            </Card>
        </motion.div>
    );
};

export default SubjectCard;
