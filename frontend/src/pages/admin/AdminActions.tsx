import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Section } from '../../components/ui/Section';
import { ListItem } from '../../components/ui/ListItem';

const AdminActions: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-tg-secondary pt-4 pb-20">
            <h1 className="text-2xl font-bold mb-6 px-4 text-tg-text">Quick Actions</h1>

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
                    title="Manage Groups"
                    subtitle="View, edit, or create groups"
                    icon="👥"
                    onClick={() => navigate('/admin/groups')}
                    showChevron
                />
                <ListItem
                    title="Manage Subjects"
                    subtitle="Add or edit subjects"
                    icon="📚"
                    onClick={() => navigate('/admin/subjects')}
                    showChevron
                    isLast
                />
            </Section>

            <Section title="Communication">
                <ListItem
                    title="Send Broadcast"
                    subtitle="Message all users or specific groups"
                    icon="📢"
                    onClick={() => navigate('/admin/broadcast')}
                    showChevron
                />
                <ListItem
                    title="Notifications"
                    subtitle="Manage automated notifications"
                    icon="🔔"
                    onClick={() => navigate('/admin/notifications')}
                    showChevron
                    isLast
                />
            </Section>

            <Section title="System">
                <ListItem
                    title="Education Center Settings"
                    subtitle="Configure payment system"
                    icon="🏫"
                    onClick={() => navigate('/admin/center-settings')}
                    showChevron
                />
                <ListItem
                    title="Bot Settings"
                    subtitle="Configure general bot settings"
                    icon="⚙️"
                    onClick={() => navigate('/admin/settings')}
                    showChevron
                />
                <ListItem
                    title="Export Data"
                    subtitle="Download reports as Excel/PDF"
                    icon="📥"
                    onClick={() => navigate('/admin/export')}
                    showChevron
                    isLast
                />
            </Section>
        </div>
    );
};

export default AdminActions;
