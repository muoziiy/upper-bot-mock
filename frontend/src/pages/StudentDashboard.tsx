import React from 'react';
import { useAppData } from '../context/AppDataContext';
import { useTelegram } from '../context/TelegramContext';
import { Section } from '../components/ui/Section';
import { Card } from '../components/ui/Card';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import LottieAnimation from '../components/ui/LottieAnimation';
import loadingAnimation from '../assets/animations/loading.json';
import { Flame, Target, TrendingUp } from 'lucide-react';
import { getLevelDisplayName, getLevelColor, getLevelOrder } from '../types/journey.types';

const StudentDashboard: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useTelegram();
    const { dashboardData, journeyData, loading } = useAppData();

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

                {/* Quick Stats Cards */}
                <div className="grid grid-cols-3 gap-3">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Card className="p-3 text-center">
                            <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-2">
                                <Flame size={20} className="text-orange-500" />
                            </div>
                            <p className="text-2xl font-bold text-tg-text">{dashboardData?.streak.current_streak || 0}</p>
                            <p className="text-xs text-tg-hint">Day Streak</p>
                        </Card>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Card className="p-3 text-center">
                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-2">
                                <Target size={20} className="text-blue-500" />
                            </div>
                            <p className="text-2xl font-bold text-tg-text">{dashboardData?.total_stats.total_tests || 0}</p>
                            <p className="text-xs text-tg-hint">Tests</p>
                        </Card>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Card className="p-3 text-center">
                            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-2">
                                <TrendingUp size={20} className="text-green-500" />
                            </div>
                            <p className="text-2xl font-bold text-tg-text">{dashboardData?.average_score || 0}%</p>
                            <p className="text-xs text-tg-hint">Avg Score</p>
                        </Card>
                    </motion.div>
                </div>

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
            </motion.div>
        </div>
    );
};

export default StudentDashboard;
