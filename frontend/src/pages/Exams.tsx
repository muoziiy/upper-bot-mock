import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { Section } from '../components/ui/Section';
import ExamsList from '../components/journey/ExamsList';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import LottieAnimation from '../components/ui/LottieAnimation';
import loadingAnimation from '../assets/animations/loading.json';

const Exams: React.FC = () => {
    const { t } = useTranslation();
    const { journeyData, loading } = useAppData();
    const [selectedSubjectId, setSelectedSubjectId] = useState('1');

    // Mock Subjects Data (Should be consistent with StudentDashboard)
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
                <p>{t('journey.loading')}</p>
            </div>
        );
    }

    if (!journeyData) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-tg-secondary text-tg-text">
                <p>{t('journey.unable_to_load')}</p>
            </div>
        );
    }

    // Mocking 'current' exams since it's not in the original type
    const examsData = {
        ...journeyData.exams,
        current: [] // Mock empty current exams for now
    };

    return (
        <div className="min-h-screen bg-tg-secondary pb-24 pt-4 text-tg-text">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4"
            >
                <header className="mb-6">
                    <h1 className="text-3xl font-bold">{t('exams.title')}</h1>
                    <p className="text-tg-hint">{t('exams.subtitle')}</p>
                </header>

                {/* Subject Switcher */}
                <div className="mb-6">
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

                {/* Content */}
                <Section title={t('journey.exams')}>
                    <ExamsList exams={examsData} />
                </Section>
            </motion.div>
        </div>
    );
};

export default Exams;
