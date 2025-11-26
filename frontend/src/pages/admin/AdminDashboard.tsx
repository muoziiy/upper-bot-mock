import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../../context/TelegramContext';
import { Section } from '../../components/ui/Section';
import { ListItem } from '../../components/ui/ListItem';

const AdminDashboard: React.FC = () => {
    const { user } = useTelegram();
    const navigate = useNavigate();

    return (
        <div className="page-content pt-4">
            <h1 className="text-2xl font-bold mb-4 px-4 text-tg-text">Admin Dashboard</h1>
            <p className="text-tg-hint mb-4 px-4">Welcome, {user?.first_name}!</p>

            <Section>
                <ListItem
                    icon="📊"
                    title="Stats"
                    subtitle="Payments & General Stats"
                    onClick={() => navigate('/admin/stats')}
                    showChevron
                />
                <ListItem
                    icon="👥"
                    title="Groups & Students"
                    subtitle="Manage Groups & Students"
                    onClick={() => navigate('/admin/groups')}
                    showChevron
                />
                <ListItem
                    icon="👨‍🏫"
                    title="Teachers"
                    subtitle="Manage Teachers"
                    onClick={() => navigate('/admin/teachers')}
                    showChevron
                />
                <ListItem
                    icon="⚡"
                    title="Actions"
                    subtitle="Quick Actions"
                    onClick={() => navigate('/admin/actions')}
                    showChevron
                    isLast
                />
            </Section>
        </div>
    );
};

export default AdminDashboard;
