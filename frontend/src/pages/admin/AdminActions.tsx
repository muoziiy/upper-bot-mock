import React from 'react';
import { Section } from '../../components/ui/Section';
import { ListItem } from '../../components/ui/ListItem';
const AdminActions: React.FC = () => {
    return (
        <div className="min-h-screen bg-tg-secondary pt-4 pb-20">
            <h1 className="text-2xl font-bold mb-6 px-4 text-black dark:text-white">Quick Actions</h1>

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
                    onClick={() => window.location.href = '/admin/groups'}
                    showChevron
                />
                <ListItem
                    title="Manage Subjects"
                    subtitle="Add or edit subjects"
                    icon="📚"
                    onClick={() => window.location.href = '/admin/subjects'} // Using href for now or useNavigate if available
                    showChevron
                    isLast
                />
            </Section>

            <Section title="Communication">
                <ListItem
                    title="Send Broadcast"
                    subtitle="Message all users or specific groups"
                    icon="📢"
                    onClick={() => window.location.href = '/admin/broadcast'}
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
