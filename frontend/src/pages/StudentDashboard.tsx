import React from 'react';
import { useAppData } from '../context/AppDataContext';
import { Section } from '../components/ui/Section';
import LevelCard from '../components/journey/LevelCard';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import LottieAnimation from '../components/ui/LottieAnimation';
import loadingAnimation from '../assets/animations/loading.json';

const StudentDashboard: React.FC = () => {
    const { t } = useTranslation();
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

    return (
        <div className="min-h-screen bg-tg-secondary pb-24 pt-4 text-tg-text">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4 space-y-6"
            >
                <header>
                    <h1 className="text-3xl font-bold mb-1">
                        {t('dashboard.hello')} {dashboardData?.user.first_name} 👋
                    </h1>
                    <p className="text-tg-hint">{t('dashboard.ready_to_learn')}</p>
                </header>

                {journeyData && (
                    <Section title={t('journey.current_level')}>
                        <LevelCard userLevel={journeyData.userLevel} />
                    </Section>
                )}

                {/* Additional dashboard widgets can go here */}
            </motion.div>
        </div>
    );
};

export default StudentDashboard;
