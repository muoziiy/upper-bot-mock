import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../../context/TelegramContext';
import { AdminSection } from './components/AdminSection';
import { AdminListItem } from './components/AdminListItem';

const AdminNotifications: React.FC = () => {
    const navigate = useNavigate();
    const { webApp } = useTelegram();
    const [settings, setSettings] = useState({
        paymentReminders: true,
        classCancellations: true,
        systemAlerts: true,
        marketing: false
    });

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

    const toggleSetting = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
        // TODO: Save to backend
    };

    const Toggle = ({ checked }: { checked: boolean }) => (
        <div className={`w-11 h-6 rounded-full transition-colors ${checked ? 'bg-green-500' : 'bg-[#E9E9EA] dark:bg-[#39393D]'} relative`}>
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#000000] pt-4 pb-20">
            <h1 className="text-3xl font-bold mb-6 px-4 text-black dark:text-white">Notifications</h1>

            <AdminSection title="Automated Alerts">
                <AdminListItem
                    title="Payment Reminders"
                    // subtitle removed
                    icon="💰"
                    iconColor="bg-green-500"
                    rightElement={<Toggle checked={settings.paymentReminders} />}
                    onClick={() => toggleSetting('paymentReminders')}
                />
                <AdminListItem
                    title="Class Schedule"
                    // subtitle removed
                    icon="📅"
                    iconColor="bg-blue-500"
                    rightElement={<Toggle checked={settings.classCancellations} />}
                    onClick={() => toggleSetting('classCancellations')}
                    isLast
                />
            </AdminSection>

            <AdminSection title="System">
                <AdminListItem
                    title="System Alerts"
                    // subtitle removed
                    icon="⚠️"
                    iconColor="bg-red-500"
                    rightElement={<Toggle checked={settings.systemAlerts} />}
                    onClick={() => toggleSetting('systemAlerts')}
                />
                <AdminListItem
                    title="Marketing"
                    // subtitle removed
                    icon="📢"
                    iconColor="bg-yellow-500"
                    rightElement={<Toggle checked={settings.marketing} />}
                    onClick={() => toggleSetting('marketing')}
                    isLast
                />
            </AdminSection>
        </div>
    );
};

export default AdminNotifications;
