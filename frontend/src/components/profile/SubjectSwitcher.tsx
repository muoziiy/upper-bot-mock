import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';

interface Subject {
    id: string;
    name: string;
    teacher_name: string;
    progress?: number;
    color?: string;
}

interface SubjectSwitcherProps {
    subjects: Subject[];
    selectedSubjectId: string | null;
    onSubjectChange: (subjectId: string) => void;
}

const SubjectSwitcher: React.FC<SubjectSwitcherProps> = ({
    subjects,
    selectedSubjectId,
    onSubjectChange
}) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const selectedItemRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to selected item
    useEffect(() => {
        if (selectedItemRef.current && scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const item = selectedItemRef.current;

            const containerWidth = container.offsetWidth;
            const itemLeft = item.offsetLeft;
            const itemWidth = item.offsetWidth;

            // Center the selected item
            const scrollPosition = itemLeft - (containerWidth / 2) + (itemWidth / 2);

            container.scrollTo({
                left: scrollPosition,
                behavior: 'smooth'
            });
        }
    }, [selectedSubjectId]);

    return (
        <div className="relative">
            <div
                ref={scrollContainerRef}
                className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
                style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    WebkitOverflowScrolling: 'touch'
                }}
            >
                {subjects.map((subject) => {
                    const isSelected = selectedSubjectId === subject.id;
                    const color = subject.color || '#3390EC';
                    const progress = subject.progress || 0;

                    return (
                        <motion.div
                            key={subject.id}
                            ref={isSelected ? selectedItemRef : null}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onSubjectChange(subject.id)}
                            className="flex-shrink-0 cursor-pointer"
                        >
                            <motion.div
                                initial={false}
                                animate={{
                                    backgroundColor: isSelected
                                        ? 'var(--tg-theme-button-color)'
                                        : 'var(--tg-theme-secondary-bg-color)',
                                    scale: isSelected ? 1 : 0.95
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 25
                                }}
                                className="rounded-2xl p-3 min-w-[100px] flex flex-col items-center gap-2"
                            >
                                {/* Progress Ring around Icon */}
                                <div className="relative">
                                    <svg className="absolute inset-0 w-14 h-14 -rotate-90">
                                        {/* Background circle */}
                                        <circle
                                            cx="28"
                                            cy="28"
                                            r="24"
                                            fill="none"
                                            stroke={isSelected ? 'rgba(255,255,255,0.2)' : 'var(--tg-theme-hint-color)'}
                                            strokeWidth="2"
                                            opacity="0.3"
                                        />
                                        {/* Progress circle */}
                                        <motion.circle
                                            cx="28"
                                            cy="28"
                                            r="24"
                                            fill="none"
                                            stroke={isSelected ? '#ffffff' : color}
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            initial={{ pathLength: 0 }}
                                            animate={{ pathLength: progress / 100 }}
                                            transition={{
                                                duration: 1,
                                                ease: "easeOut",
                                                delay: 0.2
                                            }}
                                            style={{
                                                strokeDasharray: "0 1",
                                            }}
                                        />
                                    </svg>

                                    {/* Icon */}
                                    <motion.div
                                        className="w-14 h-14 rounded-full flex items-center justify-center relative z-10"
                                        style={{
                                            backgroundColor: isSelected
                                                ? 'rgba(255,255,255,0.15)'
                                                : `${color}15`
                                        }}
                                    >
                                        <BookOpen
                                            size={24}
                                            style={{
                                                color: isSelected ? '#ffffff' : color
                                            }}
                                        />
                                    </motion.div>
                                </div>

                                {/* Subject Name */}
                                <motion.span
                                    initial={false}
                                    animate={{
                                        color: isSelected
                                            ? 'var(--tg-theme-button-text-color)'
                                            : 'var(--tg-theme-text-color)'
                                    }}
                                    className="text-xs font-medium text-center line-clamp-2 leading-tight"
                                >
                                    {subject.name}
                                </motion.span>

                                {/* Progress Percentage (optional) */}
                                {progress > 0 && (
                                    <motion.span
                                        initial={false}
                                        animate={{
                                            color: isSelected
                                                ? 'var(--tg-theme-button-text-color)'
                                                : 'var(--tg-theme-hint-color)'
                                        }}
                                        className="text-[10px] font-semibold"
                                    >
                                        {progress}%
                                    </motion.span>
                                )}
                            </motion.div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Scroll Indicator - subtle gradient fade on sides */}
            <div className="absolute left-0 top-0 bottom-2 w-8 bg-gradient-to-r from-tg-bg to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-tg-bg to-transparent pointer-events-none" />
        </div>
    );
};

export default SubjectSwitcher;
