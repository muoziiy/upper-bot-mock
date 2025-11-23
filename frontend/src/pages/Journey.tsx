import React from 'react';
import { useAppData } from '../context/AppDataContext';
import { Section } from '../components/ui/Section';
import LevelCard from '../components/journey/LevelCard';
import LessonsList from '../components/journey/LessonsList';
import UpcomingExams from '../components/journey/UpcomingExams';
import { motion } from 'framer-motion';

const Journey: React.FC = () => {
    const { journeyData, loading } = useAppData();

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-tg-secondary text-tg-text">
                <p>Loading your journey...</p>
            </div>
        );
    }

    if (!journeyData) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-tg-secondary text-tg-text">
                <p>Unable to load journey data</p>
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
                    <h1 className="text-3xl font-bold">Your Learning Journey 🗺️</h1>
                    <p className="text-tg-hint">Track your progress and upcoming challenges</p>
                </header>

                {/* Level Card */}
                <Section title="Current Level">
                    <LevelCard userLevel={journeyData.userLevel} />
                </Section>

                {/* Lessons List */}
                <Section title="Curriculum & Lessons">
                    <LessonsList lessons={journeyData.lessons} />
                </Section>

                {/* Upcoming Exams */}
                <Section title="Upcoming Exams">
                    <UpcomingExams exams={journeyData.upcomingExams} />
                </Section>
            </motion.div>
        </div>
    );
};

export default Journey;
