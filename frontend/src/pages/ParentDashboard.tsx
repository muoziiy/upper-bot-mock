import React, { useState, useEffect } from 'react';
import { useAppData } from '../context/AppDataContext';
import { useTelegram } from '../context/TelegramContext';
import { Section } from '../components/ui/Section';
import { Card } from '../components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Lottie from 'lottie-react';
import LottieAnimation from '../components/ui/LottieAnimation';
import loadingAnimation from '../assets/animations/loading.json';
import { getLevelDisplayName, getLevelColor, getLevelOrder } from '../types/journey.types';
import LessonsList from '../components/journey/LessonsList';
import { ChevronDown } from 'lucide-react';

const ParentDashboard: React.FC = () => {
    const { t } = useTranslation();
    const { } = useTelegram();
    const { parentData, loading } = useAppData();
    const [selectedChildId, setSelectedChildId] = useState<string>('');
    const [selectedSubjectId, setSelectedSubjectId] = useState('1');
    const [hiAnimation, setHiAnimation] = useState<any>(null);
    const [showChildSelector, setShowChildSelector] = useState(false);

    // Load the .tgs hi animation
    useEffect(() => {
        fetch('/assets/emojis/hi.tgs')
            .then(response => response.arrayBuffer())
            .then(buffer => {
                const decompressed = new Blob([buffer]);
                return decompressed.text();
            })
            .then(text => {
                setHiAnimation(JSON.parse(text));
            })
            .catch(err => console.error('Failed to load hi animation:', err));
    }, []);

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
    const currentLevel = selectedChild?.userLevel;
    const levelColor = currentLevel ? getLevelColor(currentLevel.current_level) : '#3390ec';
    const levelName = currentLevel ? getLevelDisplayName(currentLevel.current_level) : 'Beginner';
    const levelOrder = currentLevel ? getLevelOrder(currentLevel.current_level) : 1;
    const progressPercentage = currentLevel?.progress_percentage || 0;

    // Get lessons for selected child
    const currentLessons = selectedChild?.lessons || [];

    return (
        <div className="min-h-screen bg-tg-secondary pb-24 pt-4 text-tg-text">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4 space-y-6"
            >
                {/* Personalized Greeting */}
                <header className="flex flex-col gap-1 mb-2">
                    <div className="flex items-center gap-2">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-tg-button to-tg-accent bg-clip-text text-transparent">
                            {t('parent.hello')} {parentData?.parent.first_name}
                        </h1>
                        {hiAnimation && (
                            <motion.div
                                className="w-10 h-10"
                            >
                                <Lottie animationData={hiAnimation} loop={true} />
                            </motion.div>
                        )}
                    </div>
                    <p className="text-tg-hint text-lg">{t('parent.track_ children_progress')}</p>
                </header>

                {/* Child Selector */}
                {parentData?.children && parentData.children.length > 0 && (
                    <div className="relative">
                        <button
                            onClick={() => setShowChildSelector(!showChildSelector)}
                            className="w-full bg-tg-bg rounded-xl p-4 flex items-center justify-between hover:bg-tg-bg/80 active:bg-tg-bg/60 transition-colors shadow-sm"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-tg-button to-tg-accent flex items-center justify-center text-white text-lg font-bold">
                                    {selectedChild?.first_name?.[0] || '?'}
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-tg-text">
                                        {selectedChild?.first_name} {selectedChild?.last_name}
                                    </p>
                                    <p className="text-xs text-tg-hint">{t('parent.selected_child')}</p>
                                </div>
                            </div>
                            <ChevronDown 
                                size={20} 
                                className={`text-tg-hint transition-transform ${showChildSelector ? 'rotate-180' : ''}`} 
                            />
                        </button>

                        {/* Dropdown */}
                        <AnimatePresence>
                            {showChildSelector && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute top-full left-0 right-0 mt-2 bg-tg-bg rounded-xl shadow-lg overflow-hidden z-10"
                                >
                                    {parentData.children.map((child) => (
                                        <button
                                            key={child.id}
                                            onClick={() => {
                                                setSelectedChildId(child.id);
                                                setShowChildSelector(false);
                                            }}
                                            className={`w-full p-4 flex items-center gap-3 transition-colors ${
                                                selectedChildId === child.id
                                                    ? 'bg-tg-button/10'
                                                    : 'hover:bg-tg-secondary/50'
                                            }`}
                                        >
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-tg-button to-tg-accent flex items-center justify-center text-white text-lg font-bold">
                                                {child.first_name?.[0] || '?'}
                                            </div>
                                            <div className="text-left">
                                                <p className="font-semibold text-tg-text">
                                                    {child.first_name} {child.last_name}
                                                </p>
                                                <p className="text-xs text-tg-hint capitalize">{child.role}</p>
                                            </div>
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {/* Current Level Section */}
                {currentLevel && (
                    <Section title={t('parent.current_level')}>
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
                                        <p className="text-sm text-tg-hint">{t('parent.child_progress')}</p>
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
                                        <span className="text-tg-hint">{t('parent.progress_to_next')}</span>
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
                        <Section title={t('parent.lesson_curriculum')}>
                            <LessonsList lessons={currentLessons} />
                        </Section>
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default ParentDashboard;
