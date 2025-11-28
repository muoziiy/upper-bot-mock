import React, { useState, useEffect } from 'react';
import SegmentedControl from '../../components/ui/SegmentedControl';
import { Section } from '../../components/ui/Section';
import { ListItem } from '../../components/ui/ListItem';

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

    if (loading) {
        return <div className="p-4 text-center text-tg-hint">Loading stats...</div>;
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
                <div className="space-y-6 px-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-black/20 p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-2">
                            <span className="text-4xl">👨‍🎓</span>
                            <span className="text-2xl font-bold text-tg-text">{generalStats.totalStudents}</span>
                            <span className="text-xs text-tg-hint font-medium uppercase tracking-wide">Students</span>
                        </div>
                        <div className="bg-white dark:bg-black/20 p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-2">
                            <span className="text-4xl">👩‍🏫</span>
                            <span className="text-2xl font-bold text-tg-text">{generalStats.totalTeachers}</span>
                            <span className="text-xs text-tg-hint font-medium uppercase tracking-wide">Teachers</span>
                        </div>
                        <div className="bg-white dark:bg-black/20 p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-2">
                            <span className="text-4xl">👥</span>
                            <span className="text-2xl font-bold text-tg-text">{generalStats.activeGroups}</span>
                            <span className="text-xs text-tg-hint font-medium uppercase tracking-wide">Active Groups</span>
                        </div>
                        <div className="bg-white dark:bg-black/20 p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-2">
                            <span className="text-4xl">📚</span>
                            <span className="text-2xl font-bold text-tg-text">{generalStats.totalSubjects}</span>
                            <span className="text-xs text-tg-hint font-medium uppercase tracking-wide">Courses</span>
                        </div>
                    </div>

                    <Section title="Growth (This Month)">
                        <ListItem
                            title="New Students"
                            value={<span className="text-green-500">+{generalStats.newStudents}</span>}
                            icon="📈"
                        />
                        <ListItem
                            title="New Groups"
                            value={<span className="text-green-500">+{generalStats.newGroups}</span>}
                            icon="🆕"
                            isLast
                        />
                    </Section>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="px-4">
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                            <p className="text-xs text-yellow-500">
                                Note: These stats reflect data from the 'payments' table. Ensure payments are recorded correctly.
                            </p>
                        </div>
                    </div>

                    <div className="px-4 grid grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-black/20 p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-2">
                            <span className="text-4xl">💰</span>
                            <span className="text-lg font-bold text-tg-text break-all text-center">
                                ${financialStats.totalRevenue.toLocaleString()}
                            </span>
                            <span className="text-xs text-tg-hint font-medium uppercase tracking-wide">Total Revenue</span>
                        </div>
                        <div className="bg-white dark:bg-black/20 p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-2">
                            <span className="text-4xl">⏳</span>
                            <span className="text-lg font-bold text-orange-500 break-all text-center">
                                ${financialStats.pendingPayments.toLocaleString()}
                            </span>
                            <span className="text-xs text-tg-hint font-medium uppercase tracking-wide">Pending</span>
                        </div>
                    </div>

                    {financialStats.recentTransactions.length > 0 && (
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
                    )}

                    {financialStats.recentTransactions.length === 0 && (
                        <div className="px-4 text-center text-tg-hint text-sm">No recent transactions</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminStats;
