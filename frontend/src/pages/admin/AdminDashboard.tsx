import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminSection } from './components/AdminSection';
import { AdminListItem } from './components/AdminListItem';
import { useAppData } from '../../context/AppDataContext';
import { useTranslation } from 'react-i18next';

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { dashboardData } = useAppData();
    const { t } = useTranslation();

    return (
        <div className="page-content pt-4 pb-20 bg-[#F2F2F7] dark:bg-[#000000] min-h-screen">
            <header className="mb-6 px-4">
                <h1 className="text-3xl font-bold text-black dark:text-white">
                    {t('dashboard.hello')} {dashboardData?.user.onboarding_first_name || dashboardData?.user.first_name}
                </h1>
                <p className="text-[#6D6D72] dark:text-[#8E8E93]">Admin Dashboard</p>
            </header>

            <AdminSection title="Management">
                <AdminListItem
                    icon="👥"
                    iconColor="bg-blue-500"
                    title="Students"
                    onClick={() => navigate('/admin/students')}
                    showChevron
                />
                <AdminListItem
                    icon="👨‍🏫"
                    iconColor="bg-orange-500"
                    title="Teachers"
                    onClick={() => navigate('/admin/teachers')}
                    showChevron
                />
                <AdminListItem
                    icon="🛡️"
                    iconColor="bg-gray-500"
                    title="Admins"
                    onClick={() => navigate('/admin/admins')}
                    showChevron
                    isLast
                />
            </AdminSection>

            <AdminSection title="Analytics">
                <AdminListItem
                    icon="📊"
                    iconColor="bg-green-500"
                    title="Statistics"
                    onClick={() => navigate('/admin/stats')}
                    showChevron
                    isLast
                />
            </AdminSection>

            <AdminSection title="Tools">
                <AdminListItem
                    icon="⚡"
                    iconColor="bg-indigo-500"
                    title="Quick Actions"
                    onClick={() => navigate('/admin/actions')}
                    showChevron
                />
                <AdminListItem
                    icon="📚"
                    iconColor="bg-pink-500"
                    title="Subjects"
                    onClick={() => navigate('/admin/subjects')}
                    showChevron
                    isLast
                />
            </AdminSection>
        </div >
    );
};

export default AdminDashboard;
