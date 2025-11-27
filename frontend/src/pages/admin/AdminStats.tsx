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
        <div className="page-content pt-4 pb-20">
            <h1 className="text-2xl font-bold mb-4 px-4 text-tg-text">Statistics</h1>

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
                <div className="space-y-6">
                    <Section title="Overview">
                        <ListItem title="Total Students" value={generalStats.totalStudents.toString()} icon="👨‍🎓" />
                        <ListItem title="Total Teachers" value={generalStats.totalTeachers.toString()} icon="👩‍🏫" />
                        <ListItem title="Active Groups" value={generalStats.activeGroups.toString()} icon="👥" />
                        <ListItem title="Total Courses" value={generalStats.totalSubjects.toString()} icon="📚" isLast />
                    </Section>

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

                    <Section title="Financial Overview (This Month)">
                        <ListItem title="Total Revenue" value={`$${financialStats.totalRevenue.toLocaleString()}`} icon="💰" />
                        <ListItem title="Pending Payments" value={<span className="text-orange-500">${financialStats.pendingPayments.toLocaleString()}</span>} icon="⏳" isLast />
                    </Section>

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
