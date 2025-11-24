import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { Section } from '../components/ui/Section';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';
import { Trophy, Flame, BookOpen, Award, Settings, ChevronRight, Users, Calendar } from 'lucide-react';
import PaymentHistory from '../components/profile/PaymentHistory';
import AttendanceHistory from '../components/profile/AttendanceHistory';
import SettingsModal from '../components/profile/SettingsModal';

const Profile: React.FC = () => {
    const { dashboardData, achievementsData, paymentHistory, salaryHistory, attendanceHistory, teacherData, loading } = useAppData();
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

    // Settings modal is now handled by the SettingsModal component


    return (
        <div className="min-h-screen bg-tg-secondary pb-24 pt-4 text-tg-text">
            <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />

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
                    {dashboardData?.user.role === 'teacher' ? (
                        <div className="grid grid-cols-3 gap-3">
                            <Card className="flex flex-col items-center p-4">
                                <Users className="mb-2 h-8 w-8 text-blue-500" />
                                <span className="text-2xl font-bold">{teacherData?.stats.total_students || 0}</span>
                                <span className="text-xs text-tg-hint">Students</span>
                            </Card>
                            <Card className="flex flex-col items-center p-4">
                                <BookOpen className="mb-2 h-8 w-8 text-green-500" />
                                <span className="text-2xl font-bold">{teacherData?.stats.active_groups || 0}</span>
                                <span className="text-xs text-tg-hint">Groups</span>
                            </Card>
                            <Card className="flex flex-col items-center p-4">
                                <Calendar className="mb-2 h-8 w-8 text-orange-500" />
                                <span className="text-2xl font-bold">{teacherData?.stats.upcoming_exams_count || 0}</span>
                                <span className="text-xs text-tg-hint">Exams</span>
                            </Card>
                        </div>
                    ) : (
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
                    )}
                </Section>

                {/* Payment/Salary History */}
                <Section title={dashboardData?.user.role === 'teacher' ? "Salary History" : "Payment History"}>
                    <PaymentHistory payments={dashboardData?.user.role === 'teacher' ? (salaryHistory as any) : paymentHistory} />
                </Section>

                {/* Attendance/Schedule History */}
                {dashboardData?.user.role === 'teacher' ? (
                    <Section title="Upcoming Classes">
                        <div className="space-y-3">
                            {teacherData?.groups.map((group) => (
                                <Card key={group.id} className="p-4 flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold">{group.name}</h3>
                                        <p className="text-xs text-tg-hint mt-1">
                                            {group.student_count} Students
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-medium text-tg-button">{group.next_class}</span>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </Section>
                ) : (
                    <Section title="Attendance History">
                        <AttendanceHistory attendance={attendanceHistory} />
                    </Section>
                )}

                {/* Achievements Preview (Only for Students) */}
                {dashboardData?.user.role !== 'teacher' && (
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
                )}

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
