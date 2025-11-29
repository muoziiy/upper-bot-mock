import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Section } from '../../components/ui/Section';
import { ListItem } from '../../components/ui/ListItem';
import { useAppData } from '../../context/AppDataContext';
import { useTranslation } from 'react-i18next';

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { dashboardData } = useAppData();
    const { t } = useTranslation();

    return (
        <div className="page-content pt-4 pb-20">
            <header className="mb-6 px-4">
                <h1 className="text-2xl font-bold text-tg-text">
                    {t('dashboard.hello')} {dashboardData?.user.onboarding_first_name || dashboardData?.user.first_name}
                </h1>
                <p className="text-tg-hint">Admin Dashboard</p>
            </header>

            <Section title="Management">
                <ListItem
                    icon="👥"
                    title="Students"
                    subtitle="Manage Students"
                    onClick={() => navigate('/admin/students')}
                    showChevron
                />
                <ListItem
                    icon="👨‍🏫"
                    title="Teachers"
                    subtitle="Manage Staff"
                    onClick={() => navigate('/admin/teachers')}
                    showChevron
                />
                <ListItem
                    icon="🛡️"
                    title="Admins"
                    subtitle="Manage Admins"
                    onClick={() => navigate('/admin/admins')}
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
        </div >
    );
};

export default AdminDashboard;
