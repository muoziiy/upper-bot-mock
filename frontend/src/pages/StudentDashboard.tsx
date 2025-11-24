import React from 'react';
import { useAppData } from '../context/AppDataContext';
import { Section } from '../components/ui/Section';
import LevelCard from '../components/journey/LevelCard';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const StudentDashboard: React.FC = () => {
    const { t } = useTranslation();
    const { dashboardData, journeyData, loading } = useAppData();

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-tg-secondary text-tg-text">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-tg-secondary pb-24 pt-4 text-tg-text">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4"
            >
                <header className="mb-6">
                    <h1 className="text-3xl font-bold">Hello, {dashboardData?.user.first_name} 👋</h1>
                    <p className="text-tg-hint">Ready to learn something new today?</p>
                </header>

                {journeyData && (
                    <Section title={t('journey.current_level')}>
                        <LevelCard userLevel={journeyData.userLevel} />
                    </Section>
                )}
            </motion.div>
        </div>
    );
};

export default StudentDashboard;
