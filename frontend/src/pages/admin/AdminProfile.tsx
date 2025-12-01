import React, { useState } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { useTelegram } from '../../context/TelegramContext';
import { AdminSection } from './components/AdminSection';
import { AdminListItem } from './components/AdminListItem';
import SettingsModal from '../../components/profile/SettingsModal';

const AdminProfile: React.FC = () => {
    const { user } = useTelegram();
    const { dashboardData } = useAppData();
    const [showSettings, setShowSettings] = useState(false);

    return (
        <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#000000] pt-6 pb-20">
            <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />

            <div className="flex flex-col items-center justify-center mb-8">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold overflow-hidden shadow-lg mb-3">
                    {user?.photo_url ? (
                        <img src={user.photo_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <span>{dashboardData?.user.first_name?.[0] || 'A'}</span>
                    )}
                </div>
                <h1 className="text-2xl font-bold text-black dark:text-white">
                    {dashboardData?.user.onboarding_first_name || dashboardData?.user.first_name} {dashboardData?.user.last_name}
                </h1>
                <p className="text-[#8E8E93]">Administrator</p>
            </div>

            <AdminSection title="AI Functions">
                <AdminListItem
                    icon="🤖"
                    iconColor="bg-indigo-500"
                    title="AI Teacher Assistant"
                    onClick={() => { }}
                    showChevron
                />
                <AdminListItem
                    icon="📊"
                    iconColor="bg-teal-500"
                    title="Smart Analytics"
                    onClick={() => { }}
                    showChevron
                />
                <AdminListItem
                    icon="📝"
                    iconColor="bg-orange-500"
                    title="Curriculum Generator"
                    onClick={() => { }}
                    showChevron
                    isLast
                />
            </AdminSection>

            <AdminSection title="Settings">
                <AdminListItem
                    icon="⚙️"
                    iconColor="bg-gray-500"
                    title="General Settings"
                    onClick={() => setShowSettings(true)}
                    showChevron
                />
                <AdminListItem
                    icon="🌐"
                    iconColor="bg-blue-500"
                    title="Language"
                    value="English"
                    onClick={() => { }}
                    showChevron
                />
                <AdminListItem
                    icon="🌙"
                    iconColor="bg-purple-500"
                    title="Appearance"
                    value="System"
                    onClick={() => { }}
                    showChevron
                    isLast
                />
            </AdminSection>

            <AdminSection>
                <AdminListItem
                    icon="🔄"
                    iconColor="bg-blue-500"
                    title="Switch Role"
                    onClick={() => {
                        localStorage.removeItem('telegram-user');
                        window.location.reload();
                    }}
                    showChevron
                />
                <AdminListItem
                    icon="🚪"
                    iconColor="bg-red-500"
                    title="Log Out"
                    destructive
                    onClick={() => { }}
                    isLast
                />
            </AdminSection>
        </div>
    );
};

export default AdminProfile;
