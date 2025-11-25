import React from 'react';
import { useAppData } from '../context/AppDataContext';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import LottieAnimation from '../components/ui/LottieAnimation';
import loadingAnimation from '../assets/animations/loading.json';
import { Card } from '../components/ui/Card';
import { Trophy, Award, Star, Target, Flame, Zap, Crown, Medal, Lock } from 'lucide-react';

const Achievements: React.FC = () => {
    const { t } = useTranslation();
    const { loading } = useAppData();

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

    // Mock achievements data - will be replaced with real data from achievementsData
    const achievements = [
        {
            id: '1',
            icon: Flame,
            name: 'Fire Streak',
            description: '7 days of consecutive learning',
            unlocked: true,
            unlockedDate: '2024-01-15',
            color: '#f97316',
            points: 50
        },
        {
            id: '2',
            icon: Trophy,
            name: 'First Victory',
            description: 'Complete your first exam with 80%+',
            unlocked: true,
            unlockedDate: '2024-01-10',
            color: '#eab308',
            points: 100
        },
        {
            id: '3',
            icon: Star,
            name: 'Perfect Score',
            description: 'Score 100% on any exam',
            unlocked: true,
            unlockedDate: '2024-01-20',
            color: '#fbbf24',
            points: 150
        },
        {
            id: '4',
            icon: Target,
            name: 'Sharp Shooter',
            description: 'Maintain 90%+ average for a month',
            unlocked: false,
            color: '#3b82f6',
            points: 200
        },
        {
            id: '5',
            icon: Crown,
            name: 'Top of Class',
            description: 'Rank #1 in leaderboard',
            unlocked: false,
            color: '#a855f7',
            points: 300
        },
        {
            id: '6',
            icon: Medal,
            name: 'Marathon Runner',
            description: '30 day learning streak',
            unlocked: false,
            color: '#06b6d4',
            points: 250
        },
        {
            id: '7',
            icon: Zap,
            name: 'Speed Demon',
            description: 'Complete 5 lessons in one day',
            unlocked: false,
            color: '#f59e0b',
            points: 75
        },
        {
            id: '8',
            icon: Award,
            name: 'Dedicated Student',
            description: 'Complete 50 lessons',
            unlocked: false,
            color: '#10b981',
            points: 500
        },
    ];

    const unlockedAchievements = achievements.filter(a => a.unlocked);
    const lockedAchievements = achievements.filter(a => !a.unlocked);
    const totalPoints = unlockedAchievements.reduce((sum, a) => sum + a.points, 0);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: "spring" as const, stiffness: 300, damping: 24 }
        }
    };

    return (
        <div className="min-h-screen bg-tg-secondary pb-24 pt-4 text-tg-text">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="px-4 space-y-6"
            >
                {/* Header */}
                <motion.header variants={itemVariants} className="space-y-2">
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Trophy className="text-tg-button" size={32} />
                        {t('achievements.title')}
                    </h1>
                    <p className="text-tg-hint">{t('achievements.subtitle')}</p>
                </motion.header>

                {/* Stats Summary */}
                <motion.div variants={itemVariants}>
                    <Card className="p-6 bg-gradient-to-br from-tg-button/10 to-tg-accent/10 border-tg-button/20">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-tg-button">{unlockedAchievements.length}</p>
                                <p className="text-xs text-tg-hint mt-1">Unlocked</p>
                            </div>
                            <div className="text-center border-x border-tg-hint/20">
                                <p className="text-3xl font-bold text-tg-button">{achievements.length}</p>
                                <p className="text-xs text-tg-hint mt-1">Total</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-tg-accent">{totalPoints}</p>
                                <p className="text-xs text-tg-hint mt-1">Points</p>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Progress Bar */}
                <motion.div variants={itemVariants}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-tg-text font-medium">Overall Progress</span>
                        <span className="text-tg-button font-bold">
                            {Math.round((unlockedAchievements.length / achievements.length) * 100)}%
                        </span>
                    </div>
                    <div className="h-3 bg-tg-bg rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(unlockedAchievements.length / achievements.length) * 100}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="h-full bg-gradient-to-r from-tg-button to-tg-accent rounded-full"
                        />
                    </div>
                </motion.div>

                {/* Unlocked Achievements */}
                {unlockedAchievements.length > 0 && (
                    <motion.div variants={itemVariants} className="space-y-3">
                        <h2 className="text-xl font-bold text-tg-text">Unlocked</h2>
                        {unlockedAchievements.map((achievement, index) => {
                            const Icon = achievement.icon;
                            return (
                                <motion.div
                                    key={achievement.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ y: -2 }}
                                >
                                    <Card className="p-4 relative overflow-hidden border-2" style={{ borderColor: `${achievement.color}40` }}>
                                        {/* Background decoration */}
                                        <div
                                            className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20"
                                            style={{ backgroundColor: achievement.color }}
                                        />

                                        <div className="relative z-10 flex items-start gap-4">
                                            {/* Icon */}
                                            <div
                                                className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                                                style={{ backgroundColor: `${achievement.color}20` }}
                                            >
                                                <Icon size={32} style={{ color: achievement.color }} />
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <h3 className="font-bold text-lg text-tg-text">
                                                        {achievement.name}
                                                    </h3>
                                                    <span
                                                        className="px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap"
                                                        style={{
                                                            backgroundColor: `${achievement.color}20`,
                                                            color: achievement.color
                                                        }}
                                                    >
                                                        +{achievement.points} pts
                                                    </span>
                                                </div>
                                                <p className="text-sm text-tg-hint mb-2">{achievement.description}</p>
                                                <p className="text-xs text-tg-hint">
                                                    ✓ Unlocked on {new Date(achievement.unlockedDate!).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}

                {/* Locked Achievements */}
                {lockedAchievements.length > 0 && (
                    <motion.div variants={itemVariants} className="space-y-3">
                        <h2 className="text-xl font-bold text-tg-text">Locked</h2>
                        {lockedAchievements.map((achievement, index) => {
                            const Icon = achievement.icon;
                            return (
                                <motion.div
                                    key={achievement.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Card className="p-4 relative overflow-hidden opacity-60 border-tg-hint/20">
                                        <div className="relative z-10 flex items-start gap-4">
                                            {/* Icon */}
                                            <div className="w-16 h-16 rounded-2xl bg-tg-hint/10 flex items-center justify-center flex-shrink-0 relative">
                                                <Icon size={32} className="text-tg-hint opacity-40" />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Lock size={20} className="text-tg-hint" />
                                                </div>
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <h3 className="font-bold text-lg text-tg-hint">
                                                        {achievement.name}
                                                    </h3>
                                                    <span className="px-2 py-1 bg-tg-hint/10 text-tg-hint rounded-full text-xs font-bold whitespace-nowrap">
                                                        +{achievement.points} pts
                                                    </span>
                                                </div>
                                                <p className="text-sm text-tg-hint">{achievement.description}</p>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default Achievements;
