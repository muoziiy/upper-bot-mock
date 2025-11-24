import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, User } from 'lucide-react';
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

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
        >
            <Card
                className={`p-4 cursor-pointer transition-all ${isSelected
                        ? 'ring-2 shadow-lg'
                        : 'hover:shadow-md'
                    }`}
                style={isSelected ? { borderColor: color, borderWidth: '2px' } : {}}
            >
                <div className="flex items-start gap-3">
                    {/* Subject Icon */}
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${color}20` }}
                    >
                        <BookOpen size={24} style={{ color }} />
                    </div>

                    {/* Subject Info */}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-tg-text mb-1 truncate">{subject.name}</h3>
                        <div className="flex items-center gap-1.5 text-xs text-tg-hint">
                            <User size={12} />
                            <span className="truncate">{subject.teacher_name}</span>
                        </div>

                        {/* Progress Bar */}
                        {subject.progress !== undefined && (
                            <div className="mt-3">
                                <div className="flex items-center justify-between text-xs mb-1">
                                    <span className="text-tg-hint">Progress</span>
                                    <span className="font-medium" style={{ color }}>
                                        {subject.progress}%
                                    </span>
                                </div>
                                <div className="h-1.5 bg-tg-secondary rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${subject.progress}%` }}
                                        transition={{ duration: 0.8, ease: 'easeOut' }}
                                        className="h-full rounded-full"
                                        style={{ backgroundColor: color }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Selection Indicator */}
                    {isSelected && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-6 h-6 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: color }}
                        >
                            <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                                <path
                                    d="M1 5L5 9L13 1"
                                    stroke="white"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </motion.div>
                    )}
                </div>
            </Card>
        </motion.div>
    );
};

export default SubjectCard;
