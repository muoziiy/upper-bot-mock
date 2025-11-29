import React, { useState, useEffect } from 'react';
import { useAppData } from '../context/AppDataContext';
import { useTelegram } from '../context/TelegramContext';
import { Section } from '../components/ui/Section';
import { Card } from '../components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Lottie from 'lottie-react';
import LottieAnimation from '../components/ui/LottieAnimation';
import loadingAnimation from '../assets/animations/loading.json';

const StudentDashboard: React.FC = () => {
    const { t } = useTranslation();
    const { } = useTelegram();
    const { dashboardData, loading } = useAppData();
    const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
    const [hiAnimation, setHiAnimation] = useState<any>(null);

    // Load the .tgs hi animation
    useEffect(() => {
        fetch('/assets/emojis/hi.tgs')
            .then(response => response.arrayBuffer())
            .then(buffer => {
                const decompressed = new Blob([buffer]);
                return decompressed.text();
            })
            .then(text => {
                setHiAnimation(JSON.parse(text));
            })
            .catch(err => console.error('Failed to load hi animation:', err));
    }, []);

    useEffect(() => {
        if (dashboardData?.subjects && dashboardData.subjects.length > 0 && !selectedSubjectId) {
            setSelectedSubjectId(dashboardData.subjects[0].id);
        }
    }, [dashboardData?.subjects]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-tg-secondary text-tg-text flex-col">
                <LottieAnimation
                    animationData={loadingAnimation}
                    className="w-24 h-24 mb-4"
                />
                <p>{t('common.loading')}</p>
            </div>
        );
    }

    const subjects = dashboardData?.subjects || [];
    const allLessons = dashboardData?.lessons || [];

    // Filter lessons by selected subject
    const currentLessons = selectedSubjectId
        ? allLessons.filter((l: any) => l.subject_id === selectedSubjectId)
        : [];

    return (
        <div className="min-h-screen bg-tg-secondary pb-24 pt-4 text-tg-text">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                {/* Personalized Greeting */}
                <header className="flex flex-col gap-1 mb-2">
                <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-tg-button to-tg-accent bg-clip-text text-transparent">
                        {t('dashboard.hello')} {dashboardData?.user.onboarding_first_name || dashboardData?.user.first_name}
                    </h1>
                    {hiAnimation && (
                        <motion.div
                            className="w-10 h-10"
                        >
                            <Lottie animationData={hiAnimation} loop={true} />
                        </motion.div>
                    )}
                </div>
                <p className="text-tg-hint text-lg">{t('dashboard.ready_to_learn')}</p>
            </header>

            {/* Subject Switcher */}
            {
                subjects.length > 0 ? (
                    <div>
                        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            {subjects.map((subject: any) => (
                                <button
                                    key={subject.id}
                                    onClick={() => setSelectedSubjectId(subject.id)}
                                    className={`
                                        flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all
                                        ${selectedSubjectId === subject.id
                                            ? 'bg-tg-button text-white shadow-md'
                                            : 'bg-tg-bg text-tg-text border border-tg-hint/10'}
                                    `}
                                >
                                    {/* <span className="text-lg">{subject.icon || '📚'}</span> */}
                                    <span className="font-medium">{subject.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-tg-hint py-4">
                        No subjects found. Join a group to see your subjects.
                    </div>
                )
            }

            {/* Lesson Curriculum */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={selectedSubjectId || 'empty'}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                >
                    <Section title={t('journey.lesson_curriculum')}>
                        {currentLessons.length > 0 ? (
                            <div className="space-y-4">
                                {currentLessons.map((lesson: any) => {
                                    const isOverdue = new Date(lesson.scheduled_date) < new Date() && lesson.status !== 'cancelled';
                                    const displayStatus = isOverdue ? 'Done' : lesson.status;

                                    return (
                                        <Card key={lesson.id} className="p-4 flex flex-col gap-2">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-semibold text-lg">{lesson.title}</h3>
                                                <span className={`px-2 py-0.5 rounded text-xs ${displayStatus === 'Done' || displayStatus === 'completed' ? 'bg-green-500/20 text-green-500' :
                                                    displayStatus === 'cancelled' ? 'bg-red-500/20 text-red-500' :
                                                        'bg-blue-500/20 text-blue-500'
                                                    }`}>
                                                    {displayStatus}
                                                </span>
                                            </div>
                                            <p className="text-sm text-tg-hint">{lesson.description}</p>
                                            <div className="flex items-center gap-4 text-xs text-tg-hint mt-2">
                                                <span>📅 {new Date(lesson.scheduled_date).toLocaleDateString()}</span>
                                                {lesson.is_online && <span>🌐 Online</span>}
                                                {lesson.location && <span>📍 {lesson.location}</span>}
                                            </div>
                                        </Card>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="text-center text-tg-hint py-8 bg-tg-bg/50 rounded-xl">
                                No lessons scheduled for this subject.
                            </div>
                        )}
                    </Section>

                    {/* Homework Section */}
                    <Section title="Homework">
                        {dashboardData?.homework && dashboardData.homework.length > 0 ? (
                            <div className="space-y-4">
                                {dashboardData.homework
                                    .filter((h: any) => {
                                        // Optional: filter homework by selected subject if we can link them
                                        // For now, let's show all homework or try to match via lesson->subject
                                        // The homework has a lesson_id, and lesson has a subject_id.
                                        // But in the dashboard.ts we fetched homework with scheduled_lessons(title).
                                        // We might need to check if the homework's lesson belongs to the selected subject.
                                        // Since we don't have the full chain easily here without more data, 
                                        // let's just show all homework for now or assume the user wants to see all relevant homework.
                                        // Or better, let's try to filter if we can find the lesson in currentLessons.
                                        const relatedLesson = currentLessons.find((l: any) => l.id === h.lesson_id);
                                        return relatedLesson !== undefined;
                                    })
                                    .map((hw: any) => (
                                        <Card key={hw.id} className="p-4 flex flex-col gap-2">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-semibold text-lg">{hw.title}</h3>
                                                {hw.due_date && (
                                                    <span className="text-xs text-tg-hint">
                                                        Due: {new Date(hw.due_date).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-tg-hint">{hw.description}</p>
                                            {hw.scheduled_lessons && (
                                                <div className="text-xs text-tg-hint mt-1">
                                                    Lesson: {hw.scheduled_lessons.title}
                                                </div>
                                            )}
                                        </Card>
                                    ))}
                                {/* Show message if no homework for this subject but there is homework overall? 
                                        Or just empty state if the filter removes everything. */}
                                {dashboardData.homework.filter((h: any) => currentLessons.find((l: any) => l.id === h.lesson_id)).length === 0 && (
                                    <div className="text-center text-tg-hint py-4 bg-tg-bg/50 rounded-xl">
                                        No homework for this subject.
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center text-tg-hint py-8 bg-tg-bg/50 rounded-xl">
                                No homework assigned.
                            </div>
                        )}
                    </Section>
                </motion.div>
            </AnimatePresence>
        </motion.div >
        </div >
    );
};

export default StudentDashboard;
