import React, { useState } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { useTelegram } from '../../context/TelegramContext';
import { Section } from '../../components/ui/Section';
import { ListItem } from '../../components/ui/ListItem';
import { Settings, LogOut, Globe, Moon } from 'lucide-react';
import SettingsModal from '../../components/profile/SettingsModal';

const AdminProfile: React.FC = () => {
    const { user } = useTelegram();
    const { dashboardData } = useAppData();
    const [showSettings, setShowSettings] = useState(false);

    return (
        <div className="min-h-screen bg-tg-secondary pt-6 pb-20">
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
                <p className="text-tg-hint">Administrator</p>
            </div>

            <Section title="Settings">
                <ListItem
                    icon={<Settings size={20} />}
                    title="General Settings"
                    onClick={() => setShowSettings(true)}
                    showChevron
                />
                <ListItem
                    icon={<Globe size={20} />}
                    title="Language"
                    value="English"
                    onClick={() => { }}
                    showChevron
                />
                <ListItem
                    icon={<Moon size={20} />}
                    title="Appearance"
                    value="System"
                    onClick={() => { }}
                    showChevron
                    isLast
                />
            </Section>

            <Section>
                <ListItem
                    icon={<LogOut size={20} />}
                    title="Log Out"
                    destructive
                    onClick={() => { }}
                    isLast
                />
            </Section>
        </div>
    );
};

export default AdminProfile;
