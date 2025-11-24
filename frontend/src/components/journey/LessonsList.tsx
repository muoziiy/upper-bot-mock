import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Check, Clock, ChevronDown, PlayCircle, Lock } from 'lucide-react';
import type { LessonWithProgress, Curriculum } from '../../types/journey.types';
import { getLevelColor } from '../../types/journey.types';
import { cn } from '../../lib/utils';
import { useTranslation } from 'react-i18next';
import { useTelegram } from '../../context/TelegramContext';

interface LessonsListProps {
    lessons: LessonWithProgress[];
    curriculum: Curriculum[];
}

const LessonsList: React.FC<LessonsListProps> = ({ lessons, curriculum }) => {
    const { t } = useTranslation();
    const { webApp } = useTelegram();
    const [expandedLesson, setExpandedLesson] = useState<string | null>(null);

    const handleLessonClick = (lessonId: string) => {
        webApp.HapticFeedback.impactOccurred('light');
        setExpandedLesson(expandedLesson === lessonId ? null : lessonId);
    };

    const getLessonLevelColor = (curriculumId: string) => {
        const curr = curriculum.find(c => c.id === curriculumId);
        return curr ? getLevelColor(curr.level) : 'var(--tg-theme-button-color)';
    };

    if (!lessons || lessons.length === 0) {
        return (
            <div className="text-center py-12 text-tg-hint">
                <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
                <p>{t('lessons.no_lessons')}</p>
                <p className="text-sm mt-2">{t('lessons.check_back')}</p>
            </div>
        );
    }

    const completedCount = lessons.filter(l => l.progress?.is_completed).length;
    const totalCount = lessons.length;
    const progressPercentage = Math.round((completedCount / totalCount) * 100);

    return (
        <div className="space-y-4">
            {/* Progress Summary */}
            <div className="flex items-center justify-between p-5 bg-tg-secondary rounded-2xl shadow-sm border border-tg-hint/10">
                <div>
                    <p className="text-sm font-medium text-tg-hint mb-1">{t('lessons.your_progress')}</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-tg-text">{completedCount}</span>
                        <span className="text-sm text-tg-hint">/ {totalCount} {t('lessons.completed')}</span>
                    </div>
                </div>
                <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="transparent"
                            className="text-tg-hint/20"
                        />
                        <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="transparent"
                            strokeDasharray={2 * Math.PI * 28}
                            strokeDashoffset={2 * Math.PI * 28 * (1 - progressPercentage / 100)}
                            className="text-tg-button transition-all duration-1000 ease-out"
                            strokeLinecap="round"
                        />
                    </svg>
                    <span className="absolute text-sm font-bold text-tg-text">{progressPercentage}%</span>
                </div>
            </div>

            {/* Lessons List */}
            <div className="space-y-3">
                {lessons.map((lesson, index) => {
                    const isCompleted = lesson.progress?.is_completed || false;
                    const isLocked = lesson.status === 'locked';
                    const isExpanded = expandedLesson === lesson.id;
                    const levelColor = getLessonLevelColor(lesson.curriculum_id);

                    return (
                        <motion.div
                            key={lesson.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={cn(
                                "bg-tg-secondary rounded-2xl overflow-hidden transition-all duration-300",
                                isExpanded ? "shadow-md ring-1 ring-opacity-50" : "shadow-sm"
                            )}
                            style={{
                                borderColor: isExpanded ? levelColor : 'transparent',
                                '--level-color': levelColor
                            } as any}
                        >
                            <button
                                onClick={() => !isLocked && handleLessonClick(lesson.id)}
                                disabled={isLocked}
                                className={cn(
                                    "w-full p-4 text-left flex items-center gap-4 transition-colors",
                                    isLocked ? "opacity-60 cursor-not-allowed" : "active:bg-tg-bg/50"
                                )}
                            >
                                {/* Status Icon / Number */}
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner transition-colors duration-300"
                                    style={{
                                        backgroundColor: isCompleted ? `${levelColor}20` : 'var(--tg-theme-bg-color)',
                                        color: isCompleted ? levelColor : 'var(--tg-theme-hint-color)'
                                    }}
                                >
                                    {isCompleted ? (
                                        <Check size={24} strokeWidth={3} />
                                    ) : isLocked ? (
                                        <Lock size={20} />
                                    ) : (
                                        <span className="font-bold text-lg" style={{ color: levelColor }}>{index + 1}</span>
                                    )}
                                </div>

                                {/* Lesson Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-tg-text text-base mb-1 line-clamp-1">
                                        {lesson.title}
                                    </h3>
                                    <div className="flex items-center gap-3 text-xs text-tg-hint">
                                        <span className="flex items-center gap-1">
                                            <Clock size={12} />
                                            {lesson.duration_minutes} {t('lessons.min')}
                                        </span>
                                        {lesson.topics && lesson.topics.length > 0 && (
                                            <span className="flex items-center gap-1">
                                                <BookOpen size={12} />
                                                {lesson.topics.length} {t('lessons.topics')}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Expand Icon */}
                                {!isLocked && (
                                    <div
                                        className="flex-shrink-0 transition-transform duration-300"
                                        style={{
                                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                            color: isExpanded ? levelColor : 'var(--tg-theme-hint-color)'
                                        }}
                                    >
                                        <ChevronDown size={20} />
                                    </div>
                                )}
                            </button>

                            {/* Expanded Content */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                    >
                                        <div className="px-4 pb-4 pt-0">
                                            <div className="h-px w-full bg-tg-hint/10 mb-4" />

                                            {lesson.description && (
                                                <p className="text-sm text-tg-hint mb-4 leading-relaxed">
                                                    {lesson.description}
                                                </p>
                                            )}

                                            {lesson.topics && lesson.topics.length > 0 && (
                                                <div className="mb-4">
                                                    <div className="flex flex-wrap gap-2">
                                                        {lesson.topics.map((topic, i) => (
                                                            <span
                                                                key={i}
                                                                className="px-2.5 py-1 rounded-lg text-xs font-medium border"
                                                                style={{
                                                                    borderColor: `${levelColor}30`,
                                                                    backgroundColor: `${levelColor}10`,
                                                                    color: levelColor
                                                                }}
                                                            >
                                                                {topic}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex gap-3 mt-4">
                                                {lesson.status !== 'coming' && (
                                                    <>
                                                        <button
                                                            className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                                                            style={{
                                                                backgroundColor: `${levelColor}15`,
                                                                color: levelColor
                                                            }}
                                                        >
                                                            <PlayCircle size={18} />
                                                            {t('lessons.more_info')}
                                                        </button>
                                                        {lesson.status === 'completed' && (
                                                            <button
                                                                className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all active:scale-95 bg-tg-bg text-tg-text border border-tg-hint/10"
                                                            >
                                                                {t('lessons.homeworks')}
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default LessonsList;
