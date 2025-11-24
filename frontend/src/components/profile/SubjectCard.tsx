import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ChevronRight } from 'lucide-react';
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
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
        >
            <Card
                className={`p-4 cursor-pointer transition-all ${isSelected
                        ? 'bg-tg-button/5 border-tg-button/20'
                        : 'hover:bg-tg-secondary/50'
                    }`}
            >
                <div className="flex items-center gap-3">
                    {/* Subject Icon */}
                    <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${color}20` }}
                    >
                        <BookOpen size={20} style={{ color }} />
                    </div>

                    {/* Subject Info */}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-tg-text truncate">{subject.name}</h3>
                        <p className="text-xs text-tg-hint truncate">{subject.teacher_name}</p>
                    </div>

                    {/* Chevron Indicator */}
                    <ChevronRight
                        size={20}
                        className={`flex-shrink-0 transition-colors ${isSelected ? 'text-tg-button' : 'text-tg-hint'
                            }`}
                    />
                </div>
            </Card>
        </motion.div>
    );
};

export default SubjectCard;
