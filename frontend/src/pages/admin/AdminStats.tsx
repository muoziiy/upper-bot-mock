import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../../context/TelegramContext';
import SegmentedControl from '../../components/ui/SegmentedControl';
import { Section } from '../../components/ui/Section';
import { ListItem } from '../../components/ui/ListItem';

const AdminStats: React.FC = () => {
    const { webApp } = useTelegram();
    const backButton = webApp.BackButton;
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('general');

    React.useEffect(() => {
        backButton.show();
        const handleBack = () => navigate(-1);
        backButton.onClick(handleBack);
        return () => {
            backButton.offClick(handleBack);
            backButton.hide();
        };
    }, [backButton, navigate]);

    return (
        <div className="page-content pt-4">
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
                        <ListItem title="Total Students" value="1,234" icon="👨‍🎓" />
                        <ListItem title="Total Teachers" value="42" icon="👩‍🏫" />
                        <ListItem title="Active Groups" value="156" icon="👥" />
                        <ListItem title="Total Courses" value="12" icon="📚" isLast />
                    </Section>

                    <Section title="Growth (This Month)">
                        <ListItem title="New Students" value={<span className="text-green-500">+45</span>} icon="📈" />
                        <ListItem title="New Groups" value={<span className="text-green-500">+3</span>} icon="🆕" isLast />
                    </Section>
                </div>
            ) : (
                <div className="space-y-6">
                    <Section title="Financial Overview">
                        <ListItem title="Total Revenue (Nov)" value="$12,450" icon="💰" />
                        <ListItem title="Pending Payments" value={<span className="text-orange-500">$1,200</span>} icon="⏳" />
                        <ListItem title="Average Revenue / Student" value="$45" icon="📊" isLast />
                    </Section>

                    <Section title="Recent Transactions">
                        <ListItem
                            title="John Doe"
                            subtitle="English - Intermediate"
                            value={<span className="text-green-500">+$50</span>}
                            rightElement={<span className="text-xs text-tg-hint">2m ago</span>}
                        />
                        <ListItem
                            title="Jane Smith"
                            subtitle="Math - Advanced"
                            value={<span className="text-green-500">+$60</span>}
                            rightElement={<span className="text-xs text-tg-hint">15m ago</span>}
                        />
                        <ListItem
                            title="Alice Johnson"
                            subtitle="Physics - Beginner"
                            value={<span className="text-green-500">+$45</span>}
                            rightElement={<span className="text-xs text-tg-hint">1h ago</span>}
                            isLast
                        />
                    </Section>
                </div>
            )}
        </div>
    );
};

export default AdminStats;
