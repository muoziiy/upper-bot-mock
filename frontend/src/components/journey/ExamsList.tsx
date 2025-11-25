import React from 'react';
import type { ExamSchedule } from '../../types/journey.types';
import { Card } from '../ui/Card';
import { Calendar, MapPin, Video, Clock, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface ExamsListProps {
    exams: ExamSchedule[];
}

const ExamsList: React.FC<ExamsListProps> = ({ exams }) => {
    const { t } = useTranslation();

    return (
        <div className="space-y-4">
            <AnimatePresence mode="wait">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3"
                >
                    {exams.length > 0 ? (
                        exams.map((exam) => (
                            <Card key={exam.id} className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg">{exam.exam?.title}</h3>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${exam.exam_type === 'online' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                                        }`}>
                                        {exam.exam_type === 'online' ? t('exams.online') : t('exams.offline')}
                                    </span>
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
                            {t('exams.no_exams')}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default ExamsList;
