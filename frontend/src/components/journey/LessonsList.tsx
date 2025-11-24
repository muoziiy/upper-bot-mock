import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Check, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import type { LessonWithProgress } from '../../types/journey.types';
import { cn } from '../../lib/utils';

interface LessonsListProps {
    lessons: LessonWithProgress[];
}

const LessonsList: React.FC<LessonsListProps> = ({ lessons }) => {
    const [expandedLesson, setExpandedLesson] = useState<string | null>(null);

    if (!lessons || lessons.length === 0) {
        return (
            <div className="text-center py-12 text-tg-hint">
                <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
                <p>No lessons available yet.</p>
                <p className="text-sm mt-2">Check back soon for new content!</p>
            </div>
        );
    }

    const completedCount = lessons.filter(l => l.progress?.is_completed).length;
    const totalCount = lessons.length;

    return (
        <div className="space-y-4">
            {/* Progress Summary */}
            <div className="flex items-center justify-between p-4 bg-tg-bg/50 rounded-xl border border-tg-hint/10">
                <div>
                    <p className="text-sm text-tg-hint">Your Progress</p>
                    <p className="text-lg font-bold text-tg-text">
                        {completedCount} of {totalCount} lessons completed
                    </p>
                </div>
                <div className="text-3xl font-bold text-tg-button">
                    {Math.round((completedCount / totalCount) * 100)}%
                </div>
            </div>

            {/* Lessons List */}
            {lessons.map((lesson, index) => {
                const isCompleted = lesson.progress?.is_completed || false;
                const isExpanded = expandedLesson === lesson.id;

                return (
                    <motion.div
                        key={lesson.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                            "bg-tg-bg rounded-xl border overflow-hidden transition-all",
                            isCompleted ? "border-green-500/30" : "border-tg-hint/10",
                            "hover:border-tg-button/30"
                        )}
                    >
                        <button
                            onClick={() => setExpandedLesson(isExpanded ? null : lesson.id)}
                            className="w-full p-4 text-left"
                        >
                            <div className="flex items-start gap-3">
                                {/* Status Icon */}
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                                    isCompleted ? "bg-green-500/20" : "bg-tg-button/20"
                                )}>
                                    {isCompleted ? (
                                        <Check size={20} className="text-green-500" />
                                    ) : (
                                        <span className="text-tg-button font-bold">{index + 1}</span>
                                    )}
                                </div>

                                {/* Lesson Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-tg-text mb-1 line-clamp-1">
                                        {lesson.title}
                                    </h3>
                                    {lesson.description && (
                                        <p className="text-sm text-tg-hint line-clamp-2">
                                            {lesson.description}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-3 mt-2 text-xs text-tg-hint">
                                        <span className="flex items-center gap-1">
                                            <Clock size={12} />
                                            {lesson.duration_minutes} min
                                        </span>
                                        {lesson.topics && lesson.topics.length > 0 && (
                                            <span className="flex items-center gap-1">
                                                <BookOpen size={12} />
                                                {lesson.topics.length} topics
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Expand Icon */}
                                <div className="flex-shrink-0 text-tg-hint">
                                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                            </div>
                        </button>

                        {/* Expanded Content */}
                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="border-t border-tg-hint/10"
                                >
                                    <div className="p-4 space-y-3">
                                        {lesson.topics && lesson.topics.length > 0 && (
                                            <div>
                                                <p className="text-sm font-medium text-tg-text mb-2">Topics Covered:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {lesson.topics.map((topic, i) => (
                                                        <span
                                                            key={i}
                                                            className="px-2 py-1 bg-tg-button/20 text-tg-button text-xs rounded-full"
                                                        >
                                                            {topic}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {lesson.progress?.completion_date && (
                                            <p className="text-xs text-green-500">
                                                ✓ Completed on {new Date(lesson.progress.completion_date).toLocaleDateString()}
                                            </p>
                                        )}

                                        {lesson.status !== 'coming' && (
                                            <div className="flex gap-2">
                                                <button
                                                    className="flex-1 py-2 px-4 rounded-lg font-medium transition-all bg-tg-button/20 text-tg-button hover:bg-tg-button/30"
                                                >
                                                    More Info
                                                </button>
                                                {lesson.status === 'completed' && (
                                                    <button
                                                        className="flex-1 py-2 px-4 rounded-lg font-medium transition-all bg-tg-secondary text-tg-text hover:bg-tg-secondary/80"
                                                    >
                                                        Homeworks
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {lesson.status === 'coming' && (
                                            <p className="text-xs text-tg-hint italic text-center">
                                                This lesson is coming soon.
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
