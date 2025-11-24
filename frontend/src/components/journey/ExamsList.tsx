import React, { useState } from 'react';
import type { ExamSchedule } from '../../types/journey.types';
import { Calendar, MapPin, Video, Clock, Users, ChevronRight } from 'lucide-react';
import SegmentedControl from '../ui/SegmentedControl';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTelegram } from '../../context/TelegramContext';
import { cn } from '../../lib/utils';

interface ExamsListProps {
    exams: {
        upcoming: ExamSchedule[];
        old: ExamSchedule[];
        overall: ExamSchedule[];
    };
}

const ExamsList: React.FC<ExamsListProps> = ({ exams }) => {
    const { t } = useTranslation();
    const { webApp } = useTelegram();
    const [activeTab, setActiveTab] = useState<'upcoming' | 'old' | 'overall'>('upcoming');

    const handleTabChange = (val: 'upcoming' | 'old' | 'overall') => {
        webApp.HapticFeedback.impactOccurred('light');
        setActiveTab(val);
    };

    const getExams = () => {
        switch (activeTab) {
            case 'upcoming': return exams.upcoming;
            case 'old': return exams.old;
            case 'overall': return exams.overall;
            default: return [];
        }
    };

    const currentExams = getExams();

    return (
        <div className="space-y-6">
            <SegmentedControl
                options={[
                    { label: t('exams.upcoming'), value: 'upcoming' },
                    { label: t('exams.old'), value: 'old' },
                    { label: t('exams.overall'), value: 'overall' }
                ]}
                value={activeTab}
                onChange={(val) => handleTabChange(val as any)}
                className="mb-6"
            />

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                >
                    {currentExams.length > 0 ? (
                        currentExams.map((exam, index) => (
                            <motion.div
                                key={exam.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-tg-secondary rounded-2xl p-5 shadow-sm border border-tg-hint/10 relative overflow-hidden group"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <ChevronRight size={48} />
                                </div>

                                <div className="flex justify-between items-start mb-3 relative z-10">
                                    <h3 className="font-bold text-lg text-tg-text leading-tight pr-8">{exam.exam?.title}</h3>
                                    <span className={cn(
                                        "px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider",
                                        exam.exam_type === 'online'
                                            ? "bg-blue-500/10 text-blue-500"
                                            : "bg-orange-500/10 text-orange-500"
                                    )}>
                                        {exam.exam_type === 'online' ? t('exams.online') : t('exams.offline')}
                                    </span>
                                </div>

                                {exam.exam?.description && (
                                    <p className="text-sm text-tg-hint mb-4 line-clamp-2 relative z-10">{exam.exam?.description}</p>
                                )}

                                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm relative z-10">
                                    <div className="flex items-center gap-2.5 text-tg-text">
                                        <div className="p-1.5 rounded-md bg-tg-bg/50 text-tg-hint">
                                            <Calendar size={14} />
                                        </div>
                                        <span className="font-medium">{new Date(exam.scheduled_date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2.5 text-tg-text">
                                        <div className="p-1.5 rounded-md bg-tg-bg/50 text-tg-hint">
                                            <Clock size={14} />
                                        </div>
                                        <span className="font-medium">{new Date(exam.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>

                                    {exam.location && (
                                        <div className="flex items-center gap-2.5 text-tg-text col-span-2">
                                            <div className="p-1.5 rounded-md bg-tg-bg/50 text-tg-hint">
                                                <MapPin size={14} />
                                            </div>
                                            <span className="font-medium">{exam.location}</span>
                                        </div>
                                    )}

                                    {exam.meeting_link && (
                                        <div className="flex items-center gap-2.5 col-span-2">
                                            <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500">
                                                <Video size={14} />
                                            </div>
                                            <a
                                                href={exam.meeting_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500 font-medium hover:underline truncate"
                                                onClick={() => webApp.HapticFeedback.impactOccurred('medium')}
                                            >
                                                {t('exams.join_meeting')}
                                            </a>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2.5 text-tg-text col-span-2 mt-1">
                                        <div className="p-1.5 rounded-md bg-tg-bg/50 text-tg-hint">
                                            <Users size={14} />
                                        </div>
                                        <div className="flex-1 h-2 bg-tg-bg rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-tg-button rounded-full"
                                                style={{ width: `${Math.min(100, (exam.current_participants / (exam.max_participants || 100)) * 100)}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-medium text-tg-hint whitespace-nowrap">
                                            {exam.current_participants} / {exam.max_participants || '∞'}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-12 text-tg-hint bg-tg-secondary/30 rounded-2xl border border-dashed border-tg-hint/20">
                            <p>{t('exams.no_exams')}</p>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default ExamsList;
