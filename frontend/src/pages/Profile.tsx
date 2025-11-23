import React from 'react';
import { useAppData } from '../context/AppDataContext';
import { Section } from '../components/ui/Section';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import BottomNav from '../components/BottomNav';
import { motion } from 'framer-motion';
import { Trophy, Flame, BookOpen, Award, Settings } from 'lucide-react';

const Profile: React.FC = () => {
    const { dashboardData, achievementsData, loading } = useAppData();

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-tg-secondary text-tg-text">
                <p>Loading...</p>
            </div>
        );
    }

    const unlockedBadges = achievementsData?.stats.unlocked || 0;
    const totalBadges = achievementsData?.stats.total || 0;
    const totalPoints = achievementsData?.stats.total_points || 0;

    return (
        <div className="min-h-screen bg-tg-secondary pb-24 pt-4 text-tg-text">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4"
            >
                {/* Header */}
                <header className="mb-6 text-center">
                    <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-tg-button to-tg-accent text-4xl font-bold text-white">
                        {dashboardData?.user.first_name?.[0] || 'U'}
                    </div>
                    <h1 className="text-2xl font-bold">{dashboardData?.user.first_name}</h1>
                    <p className="text-sm text-tg-hint capitalize">{dashboardData?.user.role}</p>
                </header>

                {/* Stats Overview */}
                <Section title="Overview">
                    <div className="grid grid-cols-2 gap-3">
                        <Card className="flex flex-col items-center p-4">
                            <Flame className="mb-2 h-8 w-8 text-orange-500" />
                            <span className="text-2xl font-bold">{dashboardData?.streak.current_streak || 0}</span>
                            <span className="text-xs text-tg-hint">Day Streak</span>
                        </Card>
                        <Card className="flex flex-col items-center p-4">
                            <Trophy className="mb-2 h-8 w-8 text-yellow-500" />
                            <span className="text-2xl font-bold">{totalPoints}</span>
                            <span className="text-xs text-tg-hint">Total Points</span>
                        </Card>
                        <Card className="flex flex-col items-center p-4">
                            <BookOpen className="mb-2 h-8 w-8 text-blue-500" />
                            <span className="text-2xl font-bold">{dashboardData?.total_stats.total_tests || 0}</span>
                            <span className="text-xs text-tg-hint">Tests Taken</span>
                        </Card>
                        <Card className="flex flex-col items-center p-4">
                            <Award className="mb-2 h-8 w-8 text-purple-500" />
                            <span className="text-2xl font-bold">{unlockedBadges}/{totalBadges}</span>
                            <span className="text-xs text-tg-hint">Achievements</span>
                        </Card>
                    </div>
                </Section>

                {/* Achievements Preview */}
                <Section title="Recent Achievements">
                    {achievementsData && Object.keys(achievementsData.achievements || {}).length > 0 ? (
                        <div className="grid grid-cols-4 gap-2">
                            {Object.values(achievementsData.achievements)
                                .flat()
                                .filter((a: any) => a.unlocked)
                                .slice(0, 8)
                                .map((achievement: any, index: number) => (
                                    <div
                                        key={index}
                                        className="flex flex-col items-center rounded-lg bg-tg-bg p-2"
                                    >
                                        <span className="text-2xl">{achievement.icon}</span>
                                        <span className="mt-1 text-[10px] text-center text-tg-hint line-clamp-2">
                                            {achievement.name}
                                        </span>
                                    </div>
                                ))}
                        </div>
                    ) : (
                        <Card className="py-8 text-center">
                            <p className="text-tg-hint">No achievements unlocked yet</p>
                            <Button variant="secondary" className="mt-3" size="sm">
                                Start Learning
                            </Button>
                        </Card>
                    )}
                </Section>

                {/* Settings */}
                <Section title="Settings">
                    <Card className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Settings className="h-5 w-5 text-tg-hint" />
                            <span>Account Settings</span>
                        </div>
                        <span className="text-tg-hint">›</span>
                    </Card>
                </Section>
            </motion.div>

            <BottomNav />
        </div>
    );
};

export default Profile;
