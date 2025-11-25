import React, { useState, useMemo } from 'react';
import type { ExamSchedule } from '../../types/journey.types';
import { Card } from '../ui/Card';
import { Calendar, MapPin, Video, Clock, Users, Timer } from 'lucide-react';
import SegmentedControl from '../ui/SegmentedControl';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface ExamsListProps {
    exams: {
        upcoming: ExamSchedule[];
        old: ExamSchedule[];
        overall: ExamSchedule[];
    };
}

const ExamsList: React.FC<ExamsListProps> = ({ exams }) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'old' | 'current' | 'upcoming'>('current');

    // Calculate current exams (today + next 3 days)
    const categorizedExams = useMemo(() => {
        const now = new Date();
        const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

        const currentExams: ExamSchedule[] = [];
        const upcomingExams: ExamSchedule[] = [];
        const oldExams: ExamSchedule[] = [];

        exams.overall.forEach(exam => {
            const examDate = new Date(exam.scheduled_date);

            if (examDate < now) {
                oldExams.push(exam);
            } else if (examDate <= threeDaysFromNow) {
                currentExams.push(exam);
            } else {
                upcomingExams.push(exam);
            }
        });

        return {
            old: oldExams.sort((a, b) => new Date(b.scheduled_date).getTime() - new Date(a.scheduled_date).getTime()),
            current: currentExams.sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime()),
            upcoming: upcomingExams.sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime())
        };
    }, [exams]);

    const getExams = () => {
        return categorizedExams[activeTab];
    };

    const currentExams = getExams();

    // Calculate countdown for current exams
    const getCountdown = (scheduledDate: string) => {
        const now = new Date();
        const examDate = new Date(scheduledDate);
        const diff = examDate.getTime() - now.getTime();

        if (diff < 0) return 'Now';

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    return (
        <div className="space-y-4">
            <SegmentedControl
                options={[
                    { label: t('exams.old'), value: 'old' },
                    { label: t('exams.current'), value: 'current' },
                    { label: t('exams.upcoming'), value: 'upcoming' }
                ]}
                value={activeTab}
                onChange={(val) => setActiveTab(val as any)}
                className="mb-4"
            />

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3"
                >
                    {currentExams.length > 0 ? (
                        currentExams.map((exam) => (
                            <Card key={exam.id} className="p-4 relative overflow-hidden">
                                {/* Current exam highlight */}
                                {activeTab === 'current' && (
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
                                )}

                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg flex-1">{exam.exam?.title}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${exam.exam_type === 'online'
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-orange-100 text-orange-700'
                                            }`}>
                                            {exam.exam_type === 'online' ? t('exams.online') : t('exams.offline')}
                                        </span>
                                        {/* Countdown for current exams */}
                                        {activeTab === 'current' && (
                                            <span className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-bold">
                                                <Timer size={12} />
                                                {getCountdown(exam.scheduled_date)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <p className="text-sm text-tg-hint mb-3">{exam.exam?.description}</p>

                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="flex items-center gap-2 text-tg-text">
                                        <Calendar className="w-4 h-4 text-tg-hint" />
                                        <span>{new Date(exam.scheduled_date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-tg-text">
                                        <Clock className="w-4 h-4 text-tg-hint" />
                                        <span>{new Date(exam.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    {exam.location && (
                                        <div className="flex items-center gap-2 text-tg-text col-span-2">
                                            <MapPin className="w-4 h-4 text-tg-hint" />
                                            <span>{exam.location}</span>
                                        </div>
                                    )}
                                    {exam.meeting_link && (
                                        <div className="flex items-center gap-2 text-blue-500 col-span-2">
                                            <Video className="w-4 h-4" />
                                            <a href={exam.meeting_link} target="_blank" rel="noopener noreferrer" className="underline">
                                                {t('exams.join_meeting')}
                                            </a>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-tg-text col-span-2">
                                        <Users className="w-4 h-4 text-tg-hint" />
                                        <span>{exam.current_participants} / {exam.max_participants || '∞'} {t('exams.participants')}</span>
                                    </div>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-8 text-tg-hint">
                            <p className="text-lg font-medium mb-1">
                                {activeTab === 'current' && t('exams.no_current')}
                                {activeTab === 'upcoming' && t('exams.no_upcoming')}
                                {activeTab === 'old' && t('exams.no_old')}
                            </p>
                            <p className="text-sm">{t('exams.check_later')}</p>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default ExamsList;
