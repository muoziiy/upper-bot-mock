import React from 'react';
import { useAppData } from '../context/AppDataContext';
import { Section } from '../components/ui/Section';
import StreakCard from '../components/dashboard/StreakCard';
import QuickStats from '../components/dashboard/QuickStats';
import TodaysTasks from '../components/dashboard/TodaysTasks';
import { motion } from 'framer-motion';

const StudentDashboard: React.FC = () => {
    const { dashboardData, loading } = useAppData();

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

                <Section title="Your Streak 🔥">
                    <StreakCard
                        currentStreak={dashboardData?.streak.current_streak || 0}
                        longestStreak={dashboardData?.streak.longest_streak || 0}
                        totalActiveDays={dashboardData?.streak.total_active_days || 0}
                    />
                </Section>

                <Section title="Quick Stats">
                    <QuickStats
                        totalTests={dashboardData?.total_stats.total_tests || 0}
                        totalQuestions={dashboardData?.total_stats.total_questions || 0}
                        averageScore={dashboardData?.average_score || 0}
                    />
                </Section>

                <Section title="Upcoming Exams">
                    <TodaysTasks upcomingExams={dashboardData?.upcoming_exams || []} />
                </Section>
            </motion.div>
        </div>
    );
};

export default StudentDashboard;
