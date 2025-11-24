import React from 'react';
import { useAppData } from '../context/AppDataContext';
import { Section } from '../components/ui/Section';
import LessonsList from '../components/journey/LessonsList';
import ExamsList from '../components/journey/ExamsList';
import SegmentedControl from '../components/ui/SegmentedControl';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const Journey: React.FC = () => {
    const { t } = useTranslation();
    const { journeyData, loading } = useAppData();
    const [activeTab, setActiveTab] = React.useState<'curriculum' | 'exams'>('curriculum');

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-tg-secondary text-tg-text">
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

    return (
        <div className="min-h-screen bg-tg-secondary pb-24 pt-4 text-tg-text">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4"
            >
                <header className="mb-6">
                    <h1 className="text-3xl font-bold">{t('journey.title')}</h1>
                    <p className="text-tg-hint">{t('journey.subtitle')}</p>
                </header>

                {/* Tabs */}
                <SegmentedControl
                    options={[
                        { label: t('journey.lesson_curriculum'), value: 'curriculum' },
                        { label: t('journey.exams'), value: 'exams' }
                    ]}
                    value={activeTab}
                    onChange={(val) => setActiveTab(val as any)}
                    className="mb-6"
                />

                {/* Content */}
                <AnimatePresence mode="wait">
                    {activeTab === 'curriculum' ? (
                        <motion.div
                            key="curriculum"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Section title={t('journey.curriculum_lessons')}>
                                <LessonsList lessons={journeyData.lessons} />
                            </Section>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="exams"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Section title={t('journey.exams')}>
                                <ExamsList exams={journeyData.exams} />
                            </Section>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default Journey;
