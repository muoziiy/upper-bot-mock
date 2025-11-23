import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { Section } from '../components/ui/Section';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';
import { Trophy, Flame, BookOpen, Award, Settings, ChevronRight, User, Bell, Shield, LogOut } from 'lucide-react';
import PaymentHistory from '../components/profile/PaymentHistory';
import AttendanceHistory from '../components/profile/AttendanceHistory';

const Profile: React.FC = () => {
    const { dashboardData, achievementsData, paymentHistory, attendanceHistory, loading } = useAppData();
    const [showSettings, setShowSettings] = useState(false);

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

    if (showSettings) {
        return (
            <div className="min-h-screen bg-tg-secondary pb-24 pt-4 text-tg-text">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="px-4"
                >
                    <header className="mb-6 flex items-center gap-3">
                        <Button variant="secondary" size="sm" onClick={() => setShowSettings(false)}>
                            Back
                        </Button>
                        <h1 className="text-2xl font-bold">Settings</h1>
                    </header>

                    <Section title="Account">
                        <div className="space-y-2">
                            <Card className="flex items-center justify-between p-3">
                                <div className="flex items-center gap-3">
                                    <User className="h-5 w-5 text-tg-hint" />
                                    <span>Edit Profile</span>
                                </div>
                                <ChevronRight className="h-5 w-5 text-tg-hint" />
                            </Card>
                            <Card className="flex items-center justify-between p-3">
                                <div className="flex items-center gap-3">
                                    <Bell className="h-5 w-5 text-tg-hint" />
                                    <span>Notifications</span>
                                </div>
                                <ChevronRight className="h-5 w-5 text-tg-hint" />
                            </Card>
                            <Card className="flex items-center justify-between p-3">
                                <div className="flex items-center gap-3">
                                    <Shield className="h-5 w-5 text-tg-hint" />
                                    <span>Privacy & Security</span>
                                </div>
                                <ChevronRight className="h-5 w-5 text-tg-hint" />
                            </Card>
                        </div>
                    </Section>

                    <Section title="App Info">
                        <Card className="p-3">
                            <p className="text-sm text-tg-hint">Version 1.0.0</p>
                            <p className="text-xs text-tg-hint mt-1">Education Center Bot</p>
                        </Card>
                    </Section>

                    <div className="mt-8">
                        <Button variant="destructive" className="w-full flex items-center justify-center gap-2">
                            <LogOut className="h-4 w-4" />
                            Log Out
                        </Button>
                    </div>
                </motion.div>
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

                {/* Payment History */}
                <Section title="Payment History">
                    <PaymentHistory payments={paymentHistory} />
                </Section>

                {/* Attendance History */}
                <Section title="Attendance History">
                    <AttendanceHistory attendance={attendanceHistory} />
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
                    <Card
                        className="flex items-center justify-between p-4 cursor-pointer active:scale-95 transition-transform"
                        onClick={() => setShowSettings(true)}
                    >
                        <div className="flex items-center gap-3">
                            <Settings className="h-5 w-5 text-tg-hint" />
                            <span>Account Settings</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-tg-hint" />
                    </Card>
                </Section>
            </motion.div>
        </div>
    );
};

export default Profile;
