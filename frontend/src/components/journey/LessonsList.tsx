import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Check, Clock, ChevronDown, Play, Lock } from 'lucide-react';
import type { LessonWithProgress } from '../../types/journey.types';
import { cn } from '../../lib/utils';
import { useTranslation } from 'react-i18next';
import LottieAnimation from '../ui/LottieAnimation';
import emptyStateAnimation from '../../assets/animations/empty-state.json';

interface LessonsListProps {
    lessons: LessonWithProgress[];
}

const LessonsList: React.FC<LessonsListProps> = ({ lessons }) => {
    const { t } = useTranslation();
    const [expandedLesson, setExpandedLesson] = useState<string | null>(null);

    if (!lessons || lessons.length === 0) {
        return (
            <div className="text-center py-12 text-tg-hint">
                <LottieAnimation
                    animationData={emptyStateAnimation}
                    className="w-32 h-32 mx-auto mb-4"
                />
                <p>{t('lessons.no_lessons')}</p>
                <p className="text-sm mt-2">{t('lessons.check_back')}</p>
            </div>
        );
    }

    const completedCount = lessons.filter(l => l.progress?.is_completed).length;
    const totalCount = lessons.length;

    return (
        <div className="space-y-4">
            {/* Progress Summary */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-tg-button/10 to-tg-accent/10 rounded-2xl border border-tg-button/20 backdrop-blur-sm"
            >
                <div>
                    <p className="text-sm text-tg-hint mb-1">{t('lessons.your_progress')}</p>
                    <p className="text-xl font-bold text-tg-text">
                        {completedCount} {t('lessons.of')} {totalCount} {t('lessons.completed')}
                    </p>
                </div>
                <div className="relative">
                    {/* Circular progress */}
                    <svg className="w-20 h-20 transform -rotate-90">
                        <circle
                            cx="40"
                            cy="40"
                            r="36"
                            stroke="var(--tg-theme-hint-color)"
                            strokeWidth="6"
                            opacity="0.2"
                            fill="none"
                        />
                        <motion.circle
                            cx="40"
                            cy="40"
                            r="36"
                            stroke="var(--tg-theme-button-color)"
                            strokeWidth="6"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 36}`}
                            initial={{ strokeDashoffset: 2 * Math.PI * 36 }}
                            animate={{
                                strokeDashoffset: 2 * Math.PI * 36 * (1 - completedCount / totalCount)
                            }}
                            transition={{ duration: 1, ease: "easeOut" }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-tg-button">
                            {Math.round((completedCount / totalCount) * 100)}%
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* Lessons List */}
            {lessons.map((lesson, index) => {
                const isCompleted = lesson.progress?.is_completed || false;
                const isExpanded = expandedLesson === lesson.id;
                const isLocked = lesson.status === 'coming';

                return (
                    <motion.div
                        key={lesson.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -2 }}
                        className={cn(
                            "bg-tg-bg rounded-2xl border overflow-hidden transition-all duration-200",
                            isCompleted ? "border-green-500/30 shadow-lg shadow-green-500/10" : "border-tg-hint/10",
                            "hover:border-tg-button/30 hover:shadow-lg hover:shadow-tg-button/10 backdrop-blur-sm relative"
                        )}
                    >
                        {/* Accent bar */}
                        {isCompleted && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-green-400 to-green-600" />
                        )}

                        <button
                            onClick={() => setExpandedLesson(isExpanded ? null : lesson.id)}
                            className="w-full p-4 text-left"
                            disabled={isLocked}
                        >
                            <div className="flex items-start gap-4">
                                {/* Status Icon with  Progress Ring */}
                                <div className="relative flex-shrink-0">
                                    {/* Progress ring */}
                                    {!isCompleted && !isLocked && (
                                        <svg className="absolute -inset-1 w-12 h-12">
                                            <circle
                                                cx="24"
                                                cy="24"
                                                r="22"
                                                stroke="var(--tg-theme-button-color)"
                                                strokeWidth="2"
                                                opacity="0.3"
                                                fill="none"
                                            />
                                        </svg>
                                    )}
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center relative z-10",
                                        isCompleted ? "bg-gradient-to-br from-green-400 to-green-600" :
                                            isLocked ? "bg-tg-hint/20" :
                                                "bg-gradient-to-br from-tg-button to-tg-accent"
                                    )}>
                                        {isCompleted ? (
                                            <Check size={20} className="text-white" />
                                        ) : isLocked ? (
                                            <Lock size={20} className="text-tg-hint" />
                                        ) : (
                                            <span className="text-white font-bold">{index + 1}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Lesson Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <h3 className={cn(
                                            "font-bold text-tg-text line-clamp-1",
                                            isCompleted && "text-green-600"
                                        )}>
                                            {lesson.title}
                                        </h3>
                                        {/* Status Badge */}
                                        {isCompleted && (
                                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full whitespace-nowrap">
                                                ✓ {t('lessons.completed')}
                                            </span>
                                        )}
                                        {isLocked && (
                                            <span className="px-2 py-0.5 bg-tg-hint/20 text-tg-hint text-xs font-medium rounded-full whitespace-nowrap">
                                                🔒 {t('lessons.locked')}
                                            </span>
                                        )}
                                    </div>
                                    {lesson.description && (
                                        <p className="text-sm text-tg-hint line-clamp-2 mb-3">
                                            {lesson.description}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-4 text-xs text-tg-hint">
                                        <span className="flex items-center gap-1.5">
                                            <Clock size={14} />
                                            {lesson.duration_minutes} {t('lessons.min')}
                                        </span>
                                        {lesson.topics && lesson.topics.length > 0 && (
                                            <span className="flex items-center gap-1.5">
                                                <BookOpen size={14} />
                                                {lesson.topics.length} {t('lessons.topics')}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Expand Icon */}
                                <motion.div
                                    className="flex-shrink-0 text-tg-hint"
                                    animate={{ rotate: isExpanded ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <ChevronDown size={20} />
                                </motion.div>
                            </div>
                        </button>

                        {/* Expanded Content */}
                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                    className="border-t border-tg-hint/10 overflow-hidden"
                                >
                                    <div className="p-4 space-y-4 bg-tg-secondary/30">
                                        {lesson.topics && lesson.topics.length > 0 && (
                                            <div>
                                                <p className="text-sm font-semibold text-tg-text mb-2">
                                                    {t('lessons.topics_covered')}
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {lesson.topics.map((topic, i) => (
                                                        <motion.span
                                                            key={i}
                                                            initial={{ opacity: 0, scale: 0.8 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            transition={{ delay: i * 0.05 }}
                                                            className="px-3 py-1.5 bg-gradient-to-r from-tg-button/20 to-tg-accent/20 text-tg-button text-xs font-medium rounded-full border border-tg-button/20"
                                                        >
                                                            {topic}
                                                        </motion.span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {lesson.progress?.completion_date && (
                                            <p className="text-xs text-green-600 font-medium">
                                                ✓ {t('lessons.completed_on')} {new Date(lesson.progress.completion_date).toLocaleDateString()}
                                            </p>
                                        )}

                                        {lesson.status !== 'coming' && (
                                            <div className="flex gap-2">
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className="flex-1 py-2.5 px-4 rounded-xl font-medium transition-all bg-gradient-to-r from-tg-button to-tg-accent text-white hover:shadow-lg hover:shadow-tg-button/30 flex items-center justify-center gap-2"
                                                >
                                                    <Play size={16} />
                                                    {lesson.status === 'completed' ? t('lessons.review') : t('lessons.start')}
                                                </motion.button>
                                                {lesson.status === 'completed' && (
                                                    <motion.button
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        className="flex-1 py-2.5 px-4 rounded-xl font-medium transition-all bg-tg-secondary/50 text-tg-text hover:bg-tg-secondary border border-tg-hint/20"
                                                    >
                                                        {t('lessons.homeworks')}
                                                    </motion.button>
                                                )}
                                            </div>
                                        )}

                                        {lesson.status === 'coming' && (
                                            <p className="text-xs text-tg-hint italic text-center py-2">
                                                🔒 {t('lessons.coming_soon')}
                                            </p>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                );
            })}
        </div>
    );
};

export default LessonsList;
