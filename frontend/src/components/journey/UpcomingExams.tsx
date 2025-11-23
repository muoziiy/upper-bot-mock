import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Monitor, Users } from 'lucide-react';
import type { ExamSchedule } from '../../types/journey.types';
import { cn } from '../../lib/utils';

interface UpcomingExamsProps {
    exams: ExamSchedule[];
}

const UpcomingExams: React.FC<UpcomingExamsProps> = ({ exams }) => {
    if (!exams || exams.length === 0) {
        return (
            <div className="text-center py-12 text-tg-hint">
                <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                <p>No upcoming exams scheduled.</p>
                <p className="text-sm mt-2">Stay tuned for new exam announcements!</p>
            </div>
        );
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTimeUntil = (dateString: string) => {
        const examDate = new Date(dateString);
        const now = new Date();
        const diffMs = examDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Tomorrow';
        if (diffDays < 7) return `In ${diffDays} days`;
        if (diffDays < 30) return `In ${Math.ceil(diffDays / 7)} weeks`;
        return `In ${Math.ceil(diffDays / 30)} months`;
    };

    return (
        <div className="space-y-4">
            {exams.map((exam, index) => {
                const isOnline = exam.exam_type === 'online';
                const isFull = exam.max_participants && exam.current_participants >= exam.max_participants;

                return (
                    <motion.div
                        key={exam.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={cn(
                            "bg-tg-bg rounded-xl border p-4 hover:border-tg-button/30 transition-all",
                            isFull ? "border-red-500/30" : "border-tg-hint/10"
                        )}
                    >
                        <div className="space-y-3">
                            {/* Header */}
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-tg-text mb-1 line-clamp-1">
                                        {exam.exam?.title || 'Exam'}
                                    </h3>
                                    {exam.exam?.description && (
                                        <p className="text-sm text-tg-hint line-clamp-2">
                                            {exam.exam.description}
                                        </p>
                                    )}
                                </div>

                                {/* Exam Type Badge */}
                                <div className={cn(
                                    "px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 flex-shrink-0",
                                    isOnline
                                        ? "bg-blue-500/20 text-blue-500"
                                        : "bg-orange-500/20 text-orange-500"
                                )}>
                                    {isOnline ? <Monitor size={12} /> : <MapPin size={12} />}
                                    {isOnline ? 'Online' : 'Offline'}
                                </div>
                            </div>

                            {/* Exam Details */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="flex items-center gap-2 text-tg-hint">
                                    <Calendar size={14} className="text-tg-button" />
                                    <span>{formatDate(exam.scheduled_date)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-tg-hint">
                                    <Clock size={14} className="text-tg-button" />
                                    <span>{formatTime(exam.scheduled_date)}</span>
                                </div>
                            </div>

                            {/* Location or Link */}
                            {isOnline ? (
                                exam.meeting_link && (
                                    <div className="text-xs text-tg-hint truncate">
                                        <Monitor size={12} className="inline mr-1" />
                                        Meeting link will be available
                                    </div>
                                )
                            ) : (
                                exam.location && (
                                    <div className="text-xs text-tg-hint flex items-start gap-1">
                                        <MapPin size={12} className="flex-shrink-0 mt-0.5" />
                                        <span>{exam.location}</span>
                                    </div>
                                )
                            )}

                            {/* Participants */}
                            {exam.max_participants && (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm text-tg-hint">
                                        <Users size={14} />
                                        <span>
                                            {exam.current_participants} / {exam.max_participants} registered
                                        </span>
                                    </div>
                                    {isFull && (
                                        <span className="text-xs text-red-500 font-medium">Full</span>
                                    )}
                                </div>
                            )}

                            {/* Time Until */}
                            <div className="flex items-center justify-between pt-2 border-t border-tg-hint/10">
                                <span className="text-xs font-medium text-tg-button">
                                    {getTimeUntil(exam.scheduled_date)}
                                </span>
                                <button
                                    disabled={!!isFull}
                                    className={cn(
                                        "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                        isFull
                                            ? "bg-gray-500/20 text-gray-500 cursor-not-allowed"
                                            : "bg-tg-button text-tg-button-text hover:opacity-90"
                                    )}
                                >
                                    {isFull ? 'Full' : 'Register'}
                                </button>
                            </div>

                            {/* Duration */}
                            {exam.exam?.duration_minutes && (
                                <div className="text-xs text-tg-hint">
                                    Duration: {exam.exam.duration_minutes} minutes
                                </div>
                            )}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};

export default UpcomingExams;
