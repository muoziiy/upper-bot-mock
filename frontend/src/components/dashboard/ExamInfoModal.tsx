import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTelegram } from '../../context/TelegramContext';
import { Section } from '../ui/Section';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Calendar, Clock, AlertCircle, CheckCircle } from 'lucide-react';

interface Exam {
    id: string;
    title: string;
    description: string;
    start_time: string;
    end_time: string;
}

interface ExamInfoModalProps {
    exam: Exam | null;
    onClose: () => void;
}

const ExamInfoModal: React.FC<ExamInfoModalProps> = ({ exam, onClose }) => {
    const { webApp } = useTelegram();

    useEffect(() => {
        if (exam) {
            webApp.BackButton.show();
            webApp.BackButton.onClick(onClose);

            return () => {
                webApp.BackButton.offClick(onClose);
                webApp.BackButton.hide();
            };
        }
    }, [exam, onClose, webApp]);

    if (!exam) return null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Example Data
    const topics = ['Advanced Grammar', 'Reading Comprehension', 'Essay Writing'];
    const duration = 90; // minutes
    const passingScore = 75;

    return (
        <AnimatePresence>
            {exam && (
                <motion.div
                    initial={{ opacity: 0, y: '100%' }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed inset-0 z-50 bg-tg-secondary overflow-y-auto"
                >
                    <div className="min-h-screen pb-24 pt-4 px-4 text-tg-text">
                        <header className="mb-6 text-center">
                            <h1 className="text-2xl font-bold">{exam.title}</h1>
                            <p className="text-sm text-tg-hint mt-1">Exam Details</p>
                        </header>

                        <Section title="General Info">
                            <Card className="p-4 space-y-4">
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-blue-500" />
                                    <div>
                                        <p className="text-sm font-medium">Date</p>
                                        <p className="text-xs text-tg-hint">{formatDate(exam.start_time)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Clock className="h-5 w-5 text-orange-500" />
                                    <div>
                                        <p className="text-sm font-medium">Time & Duration</p>
                                        <p className="text-xs text-tg-hint">
                                            {formatTime(exam.start_time)} - {formatTime(exam.end_time)} ({duration} mins)
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="h-5 w-5 text-purple-500" />
                                    <div>
                                        <p className="text-sm font-medium">Passing Score</p>
                                        <p className="text-xs text-tg-hint">{passingScore}% required to pass</p>
                                    </div>
                                </div>
                            </Card>
                        </Section>

                        <Section title="Topics Covered">
                            <Card className="p-4">
                                <ul className="space-y-2">
                                    {topics.map((topic, index) => (
                                        <li key={index} className="flex items-center gap-2 text-sm">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            {topic}
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        </Section>

                        <Section title="Description">
                            <Card className="p-4">
                                <p className="text-sm text-tg-hint leading-relaxed">
                                    {exam.description || "This exam covers the material learned in the last 4 weeks. Make sure to review your notes and complete all practice exercises before starting."}
                                </p>
                            </Card>
                        </Section>

                        <div className="mt-8">
                            <Button className="w-full" size="lg">
                                Start Exam
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ExamInfoModal;
