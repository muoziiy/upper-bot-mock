import React, { useState, useEffect } from 'react';
import type { ExamSchedule } from '../types/journey.types';
import { useAppData } from '../context/AppDataContext';
import { Section } from '../components/ui/Section';
import { Card } from '../components/ui/Card';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import LottieAnimation from '../components/ui/LottieAnimation';
import loadingAnimation from '../assets/animations/loading.json';
import SegmentedControl from '../components/ui/SegmentedControl';
import { ChevronDown, Trophy } from 'lucide-react';

const ParentExams: React.FC = () => {
    const { t } = useTranslation();
    const { parentData, loading } = useAppData();
    const [selectedChildId, setSelectedChildId] = useState<string>('');
    const [selectedSubjectId, setSelectedSubjectId] = useState('1');
    const [activeTab, setActiveTab] = useState<'upcoming' | 'current' | 'old'>('upcoming');

    // Set first child as default
    useEffect(() => {
        if (parentData?.children && parentData.children.length > 0 && !selectedChildId) {
            setSelectedChildId(parentData.children[0].id);
        }
    }, [parentData, selectedChildId]);

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

    const selectedChild = parentData?.children?.find(c => c.id === selectedChildId);
    const examsData = selectedChild?.exams || { upcoming: [], current: [], old: [] };

    const getFilteredExams = () => {
        let list: any[] = [];
        switch (activeTab) {
            case 'upcoming': list = examsData.upcoming || []; break;
            case 'current': list = examsData.current || []; break;
            case 'old': list = examsData.old || []; break;
            default: list = [];
        }

        // Filter by selected subject
        return list.filter((exam) => {
            const examSubjectId = ((list.indexOf(exam)) % 3 + 1).toString();
            return examSubjectId === selectedSubjectId;
        });
    };

    const filteredExams = getFilteredExams();

    // Calculate performance grade
    const getPerformanceGrade = (score: number) => {
        if (score >= 90) return { grade: 'A', color: 'text-green-500' };
        if (score >= 80) return { grade: 'B', color: 'text-blue-500' };
        if (score >= 70) return { grade: 'C', color: 'text-yellow-500' };
        if (score >= 60) return { grade: 'D', color: 'text-orange-500' };
        return { grade: 'F', color: 'text-red-500' };
    };

    return (
        <div className="min-h-screen bg-tg-secondary pb-24 pt-4 text-tg-text">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4"
            >
                <header className="mb-6">
                    <h1 className="text-3xl font-bold">{t('parent.exams_title')}</h1>
                    <p className="text-tg-hint">{t('parent.exams_subtitle')}</p>
                </header>

                {/* Child Selector - Compact */}
                {parentData?.children && parentData.children.length > 0 && (
                    <div className="mb-4">
                        <select
                            value={selectedChildId}
                            onChange={(e) => setSelectedChildId(e.target.value)}
                            className="w-full bg-tg-bg rounded-xl p-3 text-tg-text border border-tg-hint/10 focus:outline-none focus:border-tg-button transition-colors"
                        >
                            {parentData.children.map((child) => (
                                <option key={child.id} value={child.id}>
                                    {child.first_name} {child.last_name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Tabs */}
                <SegmentedControl
                    options={[
                        { label: t('exams.old'), value: 'old' },
                        { label: t('exams.current'), value: 'current' },
                        { label: t('exams.upcoming'), value: 'upcoming' }
                    ]}
                    value={activeTab}
                    onChange={(val) => setActiveTab(val as any)}
                    className="mb-6"
                />

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

                {/* Exams List with Performance */}
                <Section>
                    {filteredExams.length === 0 ? (
                        <Card className="p-8 text-center">
                            <p className="text-tg-hint">{t('exams.no_exams')}</p>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {filteredExams.map((exam, idx) => {
                                // Mock performance data
                                const mockScore = activeTab === 'old' ? Math.floor(Math.random() * 40) + 60 : null;
                                const mockRank = activeTab === 'old' ? Math.floor(Math.random() * 20) + 1 : null;
                                const mockAverage = activeTab === 'old' ? Math.floor(Math.random() * 20) + 70 : null;
                                const performance = mockScore ? getPerformanceGrade(mockScore) : null;

                                return (
                                    <Card key={idx} className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-tg-text mb-1">
                                                    {exam.title || `Exam ${idx + 1}`}
                                                </h3>
                                                <p className="text-sm text-tg-hint mb-2">
                                                    {new Date(exam.scheduled_date).toLocaleDateString()}
                                                </p>

                                                {/* Performance Metrics (for old exams) */}
                                                {activeTab === 'old' && performance && (
                                                    <div className="mt-3 pt-3 border-t border-tg-secondary/50">
                                                        <div className="grid grid-cols-3 gap-2 text-center">
                                                            <div>
                                                                <p className="text-xs text-tg-hint mb-1">{t('parent.score')}</p>
                                                                <p className={`text-lg font-bold ${performance.color}`}>
                                                                    {mockScore}%
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-tg-hint mb-1">{t('parent.rank')}</p>
                                                                <p className="text-lg font-bold text-tg-button">
                                                                    #{mockRank}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-tg-hint mb-1">{t('parent.average')}</p>
                                                                <p className="text-lg font-bold text-tg-hint">
                                                                    {mockAverage}%
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Upcoming/Current indicator */}
                                                {activeTab !== 'old' && (
                                                    <div className="mt-2">
                                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${activeTab === 'current'
                                                                ? 'bg-green-500/10 text-green-500'
                                                                : 'bg-blue-500/10 text-blue-500'
                                                            }`}>
                                                            {activeTab === 'current' ? t('exams.current') : t('exams.upcoming')}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Grade Badge (for old exams) */}
                                            {activeTab === 'old' && performance && (
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl ${performance.color} bg-tg-secondary/50`}>
                                                    {performance.grade}
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </Section>
            </motion.div>
        </div>
    );
};

export default ParentExams;
