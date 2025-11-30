import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../../context/TelegramContext';
import { AdminSection } from './components/AdminSection';
import { AdminListItem } from './components/AdminListItem';

const AdminBotSettings: React.FC = () => {
    const navigate = useNavigate();
    const { webApp } = useTelegram();
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [language] = useState('English');

    useEffect(() => {
        if (webApp) {
            webApp.BackButton.show();
            const handleBack = () => navigate('/admin/actions');
            webApp.BackButton.onClick(handleBack);
            return () => {
                webApp.BackButton.offClick(handleBack);
                webApp.BackButton.hide();
            };
        }
    }, [webApp, navigate]);

    const Toggle = ({ checked }: { checked: boolean }) => (
        <div className={`w-11 h-6 rounded-full transition-colors ${checked ? 'bg-green-500' : 'bg-[#E9E9EA] dark:bg-[#39393D]'} relative`}>
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#000000] pt-4 pb-20">
            <h1 className="text-3xl font-bold mb-6 px-4 text-black dark:text-white">Bot Settings</h1>

            <AdminSection title="General">
                <AdminListItem
                    title="Maintenance Mode"
                    // subtitle removed
                    icon="🔌"
                    iconColor="bg-red-500"
                    rightElement={<Toggle checked={maintenanceMode} />}
                    onClick={() => setMaintenanceMode(!maintenanceMode)}
                />
                <AdminListItem
                    title="Default Language"
                    // subtitle removed
                    value={<span className="text-sm text-[#8E8E93]">{language}</span>}
                    icon="🌐"
                    iconColor="bg-blue-500"
                    showChevron
                    onClick={() => { /* Open language picker */ }}
                />
            </AdminSection>

            <AdminSection title="Content">
                <AdminListItem
                    title="Welcome Message"
                    // subtitle removed
                    icon="👋"
                    iconColor="bg-green-500"
                    showChevron
                    onClick={() => { /* Open editor */ }}
                />
                <AdminListItem
                    title="Help Text"
                    // subtitle removed
                    icon="ℹ️"
                    iconColor="bg-gray-500"
                    showChevron
                    isLast
                    onClick={() => { /* Open editor */ }}
                />
            </AdminSection>
        </div>
    );
};

export default AdminBotSettings;
