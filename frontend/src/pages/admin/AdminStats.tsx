import React, { useState, useEffect } from 'react';
import SegmentedControl from '../../components/ui/SegmentedControl';
import { AdminSection } from './components/AdminSection';
import { AdminListItem } from './components/AdminListItem';
import { motion } from 'framer-motion';

// Simple CountUp Component
const CountUp: React.FC<{ end: number; duration?: number; prefix?: string; suffix?: string }> = ({ end, duration = 0.8, prefix = '', suffix = '' }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime: number;
        let animationFrame: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / (duration * 1000), 1);

            // Easing function (easeOutQuart)
            const ease = 1 - Math.pow(1 - percentage, 4);

            setCount(Math.floor(ease * end));

            if (percentage < 1) {
                animationFrame = requestAnimationFrame(animate);
            } else {
                setCount(end);
            }
        };

        animationFrame = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrame);
    }, [end, duration]);

    return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
};

import { useAppData } from '../../context/AppDataContext';

const AdminStats: React.FC = () => {
    const { dashboardData } = useAppData();
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(true);
    const [generalStats, setGeneralStats] = useState({
        totalStudents: 0,
        totalTeachers: 0,
        activeGroups: 0,
        totalSubjects: 0,
        newStudents: 0,
        newGroups: 0
    });
    const [financialStats, setFinancialStats] = useState({
        totalRevenue: 0,
        totalOutgoing: 0,
        netIncome: 0,
        pendingPayments: 0,
        recentTransactions: [] as any[]
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const [genRes, finRes] = await Promise.all([
                fetch(`${import.meta.env.VITE_API_URL}/admin/stats/general`),
                fetch(`${import.meta.env.VITE_API_URL}/admin/stats/financial`)
            ]);

            if (genRes.ok) {
                const genData = await genRes.json();
                setGeneralStats(genData);
            }
            if (finRes.ok) {
                const finData = await finRes.json();
                setFinancialStats(finData);
            }
        } catch (e) {
            console.error('Failed to fetch stats', e);
        } finally {
            setLoading(false);
        }
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#000000] pt-4 pb-20 px-4">
                <h1 className="text-3xl font-bold mb-6 text-black dark:text-white">Statistics</h1>
                <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white dark:bg-[#1C1C1E] h-32 rounded-[10px] animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#000000] pt-4 pb-20">
            <h1 className="text-3xl font-bold mb-6 px-4 text-black dark:text-white">Statistics</h1>

            <div className="px-4 mb-6">
                <SegmentedControl
                    options={[
                        { label: 'General', value: 'general' },
                        ...(dashboardData?.user.role !== 'super_admin' ? [{ label: 'Financial', value: 'financial' }] : []),
                    ]}
                    value={activeTab}
                    onChange={setActiveTab}
                />
            </div>

            {activeTab === 'general' ? (
                <motion.div
                    className="space-y-6"
                    variants={container}
                    initial="hidden"
                    animate="show"
                >
                    <div className="grid grid-cols-2 gap-4 px-4">
                        <motion.div variants={item} className="bg-white dark:bg-[#1C1C1E] p-4 rounded-[10px] shadow-sm flex flex-col items-center justify-center gap-2">
                            <span className="text-4xl">👨‍🎓</span>
                            <span className="text-2xl font-bold text-black dark:text-white">
                                {generalStats.totalStudents}
                            </span>
                            <span className="text-xs text-[#6D6D72] dark:text-[#8E8E93] font-medium uppercase tracking-wide">Students</span>
                        </motion.div>
                        <motion.div variants={item} className="bg-white dark:bg-[#1C1C1E] p-4 rounded-[10px] shadow-sm flex flex-col items-center justify-center gap-2">
                            <span className="text-4xl">👩‍🏫</span>
                            <span className="text-2xl font-bold text-black dark:text-white">
                                {generalStats.totalTeachers}
                            </span>
                            <span className="text-xs text-[#6D6D72] dark:text-[#8E8E93] font-medium uppercase tracking-wide">Teachers</span>
                        </motion.div>
                        <motion.div variants={item} className="bg-white dark:bg-[#1C1C1E] p-4 rounded-[10px] shadow-sm flex flex-col items-center justify-center gap-2">
                            <span className="text-4xl">👥</span>
                            <span className="text-2xl font-bold text-black dark:text-white">
                                {generalStats.activeGroups}
                            </span>
                            <span className="text-xs text-[#6D6D72] dark:text-[#8E8E93] font-medium uppercase tracking-wide">Active Groups</span>
                        </motion.div>
                        <motion.div variants={item} className="bg-white dark:bg-[#1C1C1E] p-4 rounded-[10px] shadow-sm flex flex-col items-center justify-center gap-2">
                            <span className="text-4xl">📚</span>
                            <span className="text-2xl font-bold text-black dark:text-white">
                                {generalStats.totalSubjects}
                            </span>
                            <span className="text-xs text-[#6D6D72] dark:text-[#8E8E93] font-medium uppercase tracking-wide">Courses</span>
                        </motion.div>
                    </div>

                    <motion.div variants={item}>
                        <AdminSection title="Growth (This Month)">
                            <AdminListItem
                                title="New Students"
                                value={<span className="text-green-500">+{generalStats.newStudents}</span>}
                                icon="📈"
                                iconColor="bg-green-500"
                            />
                            <AdminListItem
                                title="New Groups"
                                value={<span className="text-green-500">+{generalStats.newGroups}</span>}
                                icon="🆕"
                                iconColor="bg-blue-500"
                                isLast
                            />
                        </AdminSection>
                    </motion.div>
                </motion.div>
            ) : (
                <motion.div
                    className="space-y-6"
                    variants={container}
                    initial="hidden"
                    animate="show"
                >
                    <div className="px-4 grid grid-cols-2 gap-4">
                        {/* Net Income */}
                        <motion.div variants={item} className="col-span-2 bg-white dark:bg-[#1C1C1E] p-6 rounded-[10px] shadow-sm flex flex-col items-center justify-center gap-2">
                            <span className="text-sm font-medium text-green-600 uppercase tracking-wide">Net Income</span>
                            <span className="text-3xl font-bold text-green-600 dark:text-green-500">
                                <CountUp end={financialStats.netIncome} suffix=" UZS" />
                            </span>
                        </motion.div>

                        {/* Incoming */}
                        <motion.div variants={item} className="bg-white dark:bg-[#1C1C1E] p-4 rounded-[10px] shadow-sm flex flex-col items-center justify-center gap-2">
                            <span className="text-2xl">📥</span>
                            <span className="text-lg font-bold text-black dark:text-white break-all text-center">
                                <CountUp end={financialStats.totalRevenue} suffix=" UZS" />
                            </span>
                            <span className="text-xs text-[#6D6D72] dark:text-[#8E8E93] font-medium uppercase tracking-wide">Incoming</span>
                        </motion.div>

                        {/* Outgoing */}
                        <motion.div variants={item} className="bg-white dark:bg-[#1C1C1E] p-4 rounded-[10px] shadow-sm flex flex-col items-center justify-center gap-2">
                            <span className="text-2xl">📤</span>
                            <span className="text-lg font-bold text-red-500 break-all text-center">
                                <CountUp end={financialStats.totalOutgoing} suffix=" UZS" />
                            </span>
                            <span className="text-xs text-[#6D6D72] dark:text-[#8E8E93] font-medium uppercase tracking-wide">Outgoing</span>
                        </motion.div>

                        {/* Pending */}
                        <motion.div variants={item} className="col-span-2 bg-white dark:bg-[#1C1C1E] p-4 rounded-[10px] shadow-sm flex items-center justify-between px-6">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">⏳</span>
                                <span className="text-sm font-medium text-[#6D6D72] dark:text-[#8E8E93] uppercase tracking-wide">Pending Payments</span>
                            </div>
                            <span className="text-lg font-bold text-orange-500">
                                <CountUp end={financialStats.pendingPayments} suffix=" UZS" />
                            </span>
                        </motion.div>
                    </div>

                    {financialStats.recentTransactions.length > 0 && (
                        <motion.div variants={item}>
                            <AdminSection title="Recent Transactions">
                                {financialStats.recentTransactions.map((tx, index) => (
                                    <AdminListItem
                                        key={tx.id}
                                        title={tx.user}
                                        // subtitle removed as per request
                                        value={
                                            <span className={tx.type === 'incoming' ? 'text-green-500' : 'text-red-500'}>
                                                {tx.type === 'incoming' ? '+' : '-'}{tx.amount.toLocaleString()} UZS
                                            </span>
                                        }
                                        rightElement={<span className="text-xs text-[#6D6D72] dark:text-[#8E8E93]">{new Date(tx.date).toLocaleDateString()}</span>}
                                        isLast={index === financialStats.recentTransactions.length - 1}
                                        icon={tx.type === 'incoming' ? '💰' : '💸'}
                                        iconColor={tx.type === 'incoming' ? 'bg-green-500' : 'bg-red-500'}
                                    />
                                ))}
                            </AdminSection>
                        </motion.div>
                    )}

                    {financialStats.recentTransactions.length === 0 && (
                        <motion.div variants={item} className="px-4 text-center text-[#6D6D72] dark:text-[#8E8E93] text-sm">
                            No recent transactions
                        </motion.div>
                    )}
                </motion.div>
            )}
        </div>
    );
};

export default AdminStats;
