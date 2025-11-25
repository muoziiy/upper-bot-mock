import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { useTelegram } from '../context/TelegramContext';
import { Section } from '../components/ui/Section';
import { Card } from '../components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import LottieAnimation from '../components/ui/LottieAnimation';
import loadingAnimation from '../assets/animations/loading.json';
import { getLevelDisplayName, getLevelColor, getLevelOrder } from '../types/journey.types';
import LessonsList from '../components/journey/LessonsList';

const StudentDashboard: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useTelegram();
    const { dashboardData, journeyData, loading } = useAppData();
    const [selectedSubjectId, setSelectedSubjectId] = useState('1');

    // Mock Subjects Data
    const subjects = [
        { id: '1', name: 'English Language', icon: '🇬🇧' },
        { id: '2', name: 'Mathematics', icon: '📐' },
        { id: '3', name: 'Physics', icon: '⚛️' },
    ];

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

    const currentLevel = journeyData?.userLevel;
    const levelColor = currentLevel ? getLevelColor(currentLevel.current_level) : '#3390ec';
    const levelName = currentLevel ? getLevelDisplayName(currentLevel.current_level) : 'Beginner';
    const levelOrder = currentLevel ? getLevelOrder(currentLevel.current_level) : 1;
    const progressPercentage = currentLevel?.progress_percentage || 0;

    // Filter lessons based on selected subject (Mocking the filter for now as data doesn't have subject_id)
    // In a real app, we would filter journeyData.lessons by selectedSubjectId
    const currentLessons = journeyData?.lessons || [];

    return (
        <div className="min-h-screen bg-tg-secondary pb-24 pt-4 text-tg-text">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4 space-y-6"
            >
                {/* Personalized Greeting */}
                <header className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-tg-button to-tg-accent flex items-center justify-center text-white text-2xl font-bold overflow-hidden flex-shrink-0">
                        {user?.photo_url ? (
                            <img src={user.photo_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span>{dashboardData?.user.first_name?.[0] || 'U'}</span>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl font-bold mb-0.5">
                            {t('dashboard.hello')} {dashboardData?.user.first_name} 👋
                        </h1>
                        <p className="text-tg-hint text-sm">{t('dashboard.ready_to_learn')}</p>
                    </div>
                </header>

                {/* Current Level Section */}
                {currentLevel && (
                    <Section title={t('dashboard.current_level')}>
                        <Card className="p-6 overflow-hidden relative">
                            {/* Background Gradient */}
                            <div
                                className="absolute inset-0 opacity-10"
                                style={{
                                    background: `linear-gradient(135deg, ${levelColor} 0%, transparent 100%)`
                                }}
                            />

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-2xl font-bold text-tg-text mb-1">
                                            {levelName}
                                        </h3>
                                        <p className="text-sm text-tg-hint">Keep learning to advance!</p>
                                    </div>
                                    <div
                                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold"
                                        style={{ backgroundColor: levelColor }}
                                    >
                                        {levelOrder}
                                    </div>
                                </div>

                                {/* Progress to Next Level */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-tg-hint">Progress to next level</span>
                                        <span className="font-semibold" style={{ color: levelColor }}>
                                            {progressPercentage}%
                                        </span>
                                    </div>
                                    <div className="h-2 bg-tg-secondary rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progressPercentage}%` }}
                                            transition={{ duration: 1, ease: 'easeOut' }}
                                            className="h-full rounded-full"
                                            style={{ backgroundColor: levelColor }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </Section>
                )}

                {/* Subject Switcher */}
                <div>
                    <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {subjects.map((subject) => (
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
                                <span className="text-lg">{subject.icon}</span>
                                <span className="font-medium">{subject.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Lesson Curriculum */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={selectedSubjectId}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Section title={t('journey.lesson_curriculum')}>
                            <LessonsList lessons={currentLessons} />
                        </Section>
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default StudentDashboard;
