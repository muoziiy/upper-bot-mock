import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../../context/TelegramContext';
import { Section } from '../../components/ui/Section';
import { ListItem } from '../../components/ui/ListItem';

import { useAdminData } from '../../hooks/useAdminData';

const AdminDashboard: React.FC = () => {
    const { } = useTelegram();
    const navigate = useNavigate();
    const { students } = useAdminData(); // Prefetch data
    const studentCount = students.length;

    return (
        <div className="min-h-screen bg-tg-secondary pt-4 pb-10">
            <h1 className="text-2xl font-bold mb-6 px-4 text-black dark:text-white">Admin Dashboard</h1>

            <Section title="Management">
                <ListItem
                    icon="👨‍🎓"
                    title="Students"
                    subtitle={studentCount !== null ? `${studentCount} Total Students` : 'Manage Students'}
                    onClick={() => navigate('/admin/students')}
                    showChevron
                />
                <ListItem
                    icon="👥"
                    title="Groups"
                    subtitle="Manage Groups"
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
            </Section>

            <Section title="Analytics">
                <ListItem
                    icon="📊"
                    title="Statistics"
                    subtitle="Payments & General Stats"
                    onClick={() => navigate('/admin/stats')}
                    showChevron
                />
            </Section>

            <Section title="Tools">
                <ListItem
                    icon="⚡"
                    title="Quick Actions"
                    subtitle="Common Tasks"
                    onClick={() => navigate('/admin/actions')}
                    showChevron
                />
                <ListItem
                    icon="📚"
                    title="Subjects"
                    subtitle="Manage Subjects"
                    onClick={() => navigate('/admin/subjects')}
                    showChevron
                    isLast
                />
            </Section>
        </div>
    );
};

export default AdminDashboard;
