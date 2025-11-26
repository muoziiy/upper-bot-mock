import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../../context/TelegramContext';
import { Section } from '../../components/ui/Section';
import { ListItem } from '../../components/ui/ListItem';

const AdminActions: React.FC = () => {
    const { webApp } = useTelegram();
    const backButton = webApp.BackButton;
    const navigate = useNavigate();

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
            <h1 className="text-2xl font-bold mb-4 px-4 text-tg-text">Quick Actions</h1>

            <Section title="User Management">
                <ListItem
                    title="Add New Student"
                    subtitle="Register a new student manually"
                    icon="👤"
                    showChevron
                />
                <ListItem
                    title="Add New Teacher"
                    subtitle="Register a new teacher manually"
                    icon="👨‍🏫"
                    showChevron
                />
                <ListItem
                    title="Create Group"
                    subtitle="Start a new class group"
                    icon="👥"
                    showChevron
                    isLast
                />
            </Section>

            <Section title="Communication">
                <ListItem
                    title="Send Broadcast"
                    subtitle="Message all users or specific groups"
                    icon="📢"
                    showChevron
                />
                <ListItem
                    title="Notifications"
                    subtitle="Manage automated notifications"
                    icon="🔔"
                    showChevron
                    isLast
                />
            </Section>

            <Section title="System">
                <ListItem
                    title="Bot Settings"
                    subtitle="Configure general bot settings"
                    icon="⚙️"
                    showChevron
                />
                <ListItem
                    title="Export Data"
                    subtitle="Download reports as Excel/PDF"
                    icon="📥"
                    showChevron
                    isLast
                />
            </Section>
        </div>
    );
};

export default AdminActions;
