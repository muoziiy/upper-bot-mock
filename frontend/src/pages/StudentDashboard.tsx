import React, { useEffect, useState } from 'react';
import { useTelegram } from '../context/TelegramContext';
import { Section } from '../components/ui/Section';
import BottomNav from '../components/BottomNav';
import StreakCard from '../components/dashboard/StreakCard';
import QuickStats from '../components/dashboard/QuickStats';
import TodaysTasks from '../components/dashboard/TodaysTasks';
import { motion } from 'framer-motion';

interface DashboardData {
    user: {
        id: string;
        first_name: string;
        role: string;
    };
    streak: {
        current_streak: number;
        longest_streak: number;
        total_active_days: number;
    };
    total_stats: {
        total_study_minutes: number;
        total_tests: number;
        total_questions: number;
    };
    average_score: number;
    upcoming_exams: any[];
}

const StudentDashboard: React.FC = () => {
    const { user } = useTelegram();
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            if (user?.id) {
                try {
                    const res = await fetch(`${import.meta.env.VITE_API_URL}/students/dashboard`, {
                        headers: { 'x-user-id': user.id.toString() }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setDashboardData(data);
                    }
                } catch (e) {
                    console.error("Failed to fetch dashboard", e);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchDashboard();
    }, [user]);

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
                    <h1 className="text-3xl font-bold">Hello, {dashboardData?.user.first_name || user?.first_name} 👋</h1>
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

            <BottomNav />
        </div>
    );
};

export default StudentDashboard;
