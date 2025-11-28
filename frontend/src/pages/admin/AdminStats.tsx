import React, { useState, useEffect } from 'react';
import SegmentedControl from '../../components/ui/SegmentedControl';
import { Section } from '../../components/ui/Section';
import { ListItem } from '../../components/ui/ListItem';
import { motion } from 'framer-motion';

// Simple CountUp Component
const CountUp: React.FC<{ end: number; duration?: number; prefix?: string }> = ({ end, duration = 1.5, prefix = '' }) => {
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

    return <span>{prefix}{count.toLocaleString()}</span>;
};

const AdminStats: React.FC = () => {
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
            <div className="min-h-screen bg-tg-secondary pt-4 pb-20 px-4">
                <h1 className="text-2xl font-bold mb-6 text-black dark:text-white">Statistics</h1>
                <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white dark:bg-black/20 h-32 rounded-2xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-tg-secondary pt-4 pb-20">
            <h1 className="text-2xl font-bold mb-6 px-4 text-black dark:text-white">Statistics</h1>

            <div className="px-4 mb-6">
                <SegmentedControl
                    options={[
                        { label: 'General', value: 'general' },
                        { label: 'Payments', value: 'payments' },
                    ]}
                    value={activeTab}
                    onChange={setActiveTab}
                />
            </div>

            {activeTab === 'general' ? (
                <motion.div
                    className="space-y-6 px-4"
                    variants={container}
                    initial="hidden"
                    animate="show"
                >
                    <div className="grid grid-cols-2 gap-4">
                        <motion.div variants={item} className="bg-white dark:bg-black/20 p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-2">
                            <span className="text-4xl">👨‍🎓</span>
                            <span className="text-2xl font-bold text-tg-text">
                                <CountUp end={generalStats.totalStudents} />
                            </span>
                            <span className="text-xs text-tg-hint font-medium uppercase tracking-wide">Students</span>
                        </motion.div>
                        <motion.div variants={item} className="bg-white dark:bg-black/20 p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-2">
                            <span className="text-4xl">👩‍🏫</span>
                            <span className="text-2xl font-bold text-tg-text">
                                <CountUp end={generalStats.totalTeachers} />
                            </span>
                            <span className="text-xs text-tg-hint font-medium uppercase tracking-wide">Teachers</span>
                        </motion.div>
                        <motion.div variants={item} className="bg-white dark:bg-black/20 p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-2">
                            <span className="text-4xl">👥</span>
                            <span className="text-2xl font-bold text-tg-text">
                                <CountUp end={generalStats.activeGroups} />
                            </span>
                            <span className="text-xs text-tg-hint font-medium uppercase tracking-wide">Active Groups</span>
                        </motion.div>
                        <motion.div variants={item} className="bg-white dark:bg-black/20 p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-2">
                            <span className="text-4xl">📚</span>
                            <span className="text-2xl font-bold text-tg-text">
                                <CountUp end={generalStats.totalSubjects} />
                            </span>
                            <span className="text-xs text-tg-hint font-medium uppercase tracking-wide">Courses</span>
                        </motion.div>
                    </div>

                    <motion.div variants={item}>
                        <Section title="Growth (This Month)">
                            <ListItem
                                title="New Students"
                                value={<span className="text-green-500">+<CountUp end={generalStats.newStudents} /></span>}
                                icon="📈"
                            />
                            <ListItem
                                title="New Groups"
                                value={<span className="text-green-500">+<CountUp end={generalStats.newGroups} /></span>}
                                icon="🆕"
                                isLast
                            />
                        </Section>
                    </motion.div>
                </motion.div>
            ) : (
                <motion.div
                    className="space-y-6"
                    variants={container}
                    initial="hidden"
                    animate="show"
                >
                    <motion.div variants={item} className="px-4">
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                            <p className="text-xs text-yellow-500">
                                Note: These stats reflect data from the 'payments' table. Ensure payments are recorded correctly.
                            </p>
                        </div>
                    </motion.div>

                    <div className="px-4 grid grid-cols-2 gap-4">
                        <motion.div variants={item} className="bg-white dark:bg-black/20 p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-2">
                            <span className="text-4xl">💰</span>
                            <span className="text-lg font-bold text-tg-text break-all text-center">
                                <CountUp end={financialStats.totalRevenue} prefix="$" />
                            </span>
                            <span className="text-xs text-tg-hint font-medium uppercase tracking-wide">Total Revenue</span>
                        </motion.div>
                        <motion.div variants={item} className="bg-white dark:bg-black/20 p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-2">
                            <span className="text-4xl">⏳</span>
                            <span className="text-lg font-bold text-orange-500 break-all text-center">
                                <CountUp end={financialStats.pendingPayments} prefix="$" />
                            </span>
                            <span className="text-xs text-tg-hint font-medium uppercase tracking-wide">Pending</span>
                        </motion.div>
                    </div>

                    {financialStats.recentTransactions.length > 0 && (
                        <motion.div variants={item}>
                            <Section title="Recent Transactions">
                                {financialStats.recentTransactions.map((tx, index) => (
                                    <ListItem
                                        key={tx.id}
                                        title={`${tx.users?.first_name || 'Unknown'} ${tx.users?.surname || ''}`}
                                        subtitle={tx.description || 'Payment'}
                                        value={
                                            <span className={tx.status === 'completed' ? 'text-green-500' : 'text-orange-500'}>
                                                {tx.status === 'completed' ? '+' : ''}${tx.amount}
                                            </span>
                                        }
                                        rightElement={<span className="text-xs text-tg-hint">{new Date(tx.transaction_date).toLocaleDateString()}</span>}
                                        isLast={index === financialStats.recentTransactions.length - 1}
                                    />
                                ))}
                            </Section>
                        </motion.div>
                    )}

                    {financialStats.recentTransactions.length === 0 && (
                        <motion.div variants={item} className="px-4 text-center text-tg-hint text-sm">
                            No recent transactions
                        </motion.div>
                    )}
                </motion.div>
            )}
        </div>
    );
};

export default AdminStats;
