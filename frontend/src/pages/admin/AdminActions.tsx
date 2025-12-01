import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminSection } from './components/AdminSection';
import { AdminListItem } from './components/AdminListItem';
import { useTelegram } from '../../context/TelegramContext';

const AdminActions: React.FC = () => {
    const navigate = useNavigate();
    const { webApp } = useTelegram();
    const [aiFeaturesEnabled, setAiFeaturesEnabled] = React.useState(false);

    return (
        <div className="min-h-screen pt-4 pb-20 bg-[#F2F2F7] dark:bg-[#000000]">
            <h1 className="text-3xl font-bold mb-6 px-4 text-black dark:text-white">Quick Actions</h1>

            <AdminSection title="User Management">

                <AdminListItem
                    title="Manage Groups"
                    icon="👥"
                    iconColor="bg-blue-500"
                    onClick={() => navigate('/admin/groups')}
                    showChevron
                />
                <AdminListItem
                    title="Manage Subjects"
                    icon="📚"
                    iconColor="bg-pink-500"
                    onClick={() => navigate('/admin/subjects')}
                    showChevron
                />
                <AdminListItem
                    title="Manage Admins"
                    icon="🛡️"
                    iconColor="bg-gray-500"
                    onClick={() => navigate('/admin/admins')}
                    showChevron
                />
                <AdminListItem
                    title="Attendance"
                    icon="📅"
                    iconColor="bg-orange-500"
                    onClick={() => navigate('/admin/attendance')}
                    showChevron
                />
                <AdminListItem
                    title="Manage Requests"
                    icon="📝"
                    iconColor="bg-yellow-500"
                    onClick={() => navigate('/admin/requests')}
                    showChevron
                />
                <AdminListItem
                    title="Create and Manage Exams"
                    icon="✍️"
                    iconColor="bg-indigo-500"
                    onClick={() => webApp.showPopup({ message: 'Coming Soon' })}
                    showChevron
                    isLast
                />
            </AdminSection>

            <AdminSection title="Communication">
                <AdminListItem
                    title="Send Broadcast"
                    icon="📢"
                    iconColor="bg-green-500"
                    onClick={() => navigate('/admin/broadcast')}
                    showChevron
                />
                <AdminListItem
                    title="Notifications"
                    icon="🔔"
                    iconColor="bg-red-500"
                    onClick={() => navigate('/admin/notifications')}
                    showChevron
                    isLast
                />
            </AdminSection>

            <AdminSection title="System">
                <AdminListItem
                    title="Education Center Settings"
                    icon="🏫"
                    iconColor="bg-purple-500"
                    onClick={() => navigate('/admin/center-settings')}
                    showChevron
                />
                <AdminListItem
                    title="Bot Settings"
                    icon="⚙️"
                    iconColor="bg-gray-600"
                    onClick={() => navigate('/admin/settings')}
                    showChevron
                />
                <AdminListItem
                    title="Export Data"
                    icon="📥"
                    iconColor="bg-blue-400"
                    onClick={() => navigate('/admin/export')}
                    showChevron
                />
                <AdminListItem
                    title="Enable AI Features"
                    icon="✨"
                    iconColor="bg-purple-500"
                    rightElement={
                        <div
                            className={`w-11 h-6 rounded-full transition-colors relative ${aiFeaturesEnabled ? 'bg-green-500' : 'bg-[#E9E9EA] dark:bg-[#39393D]'}`}
                            onClick={() => setAiFeaturesEnabled(!aiFeaturesEnabled)}
                        >
                            <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-transform ${aiFeaturesEnabled ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                        </div>
                    }
                    isLast
                />
            </AdminSection>
            <div className="px-4 mt-2">
                <p className="text-xs text-[#8E8E93]">
                    Turn on to enable experimental AI features. Talk to AI developers for more info.
                </p>
            </div>
        </div>
    );
};

export default AdminActions;
