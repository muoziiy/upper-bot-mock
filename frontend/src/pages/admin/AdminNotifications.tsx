import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../../context/TelegramContext';
import { Section } from '../../components/ui/Section';
import { ListItem } from '../../components/ui/ListItem';
import { Bell, Calendar, DollarSign, AlertTriangle } from 'lucide-react';

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

    return (
        <div className="min-h-screen bg-tg-secondary pt-4 pb-20">
            <h1 className="text-2xl font-bold mb-6 px-4 text-tg-text">Notifications</h1>

            <Section title="Automated Alerts">
                <ListItem
                    title="Payment Reminders"
                    subtitle="Notify students 3 days before due date"
                    icon={<DollarSign size={20} className="text-green-500" />}
                    rightElement={
                        <div className={`w-11 h-6 rounded-full transition-colors ${settings.paymentReminders ? 'bg-green-500' : 'bg-gray-400'} relative`}>
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.paymentReminders ? 'left-6' : 'left-1'}`} />
                        </div>
                    }
                    onClick={() => toggleSetting('paymentReminders')}
                />
                <ListItem
                    title="Class Schedule"
                    subtitle="Daily reminders for upcoming classes"
                    icon={<Calendar size={20} className="text-blue-500" />}
                    rightElement={
                        <div className={`w-11 h-6 rounded-full transition-colors ${settings.classCancellations ? 'bg-green-500' : 'bg-gray-400'} relative`}>
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.classCancellations ? 'left-6' : 'left-1'}`} />
                        </div>
                    }
                    onClick={() => toggleSetting('classCancellations')}
                />
            </Section>

            <Section title="System">
                <ListItem
                    title="System Alerts"
                    subtitle="Critical errors and maintenance updates"
                    icon={<AlertTriangle size={20} className="text-red-500" />}
                    rightElement={
                        <div className={`w-11 h-6 rounded-full transition-colors ${settings.systemAlerts ? 'bg-green-500' : 'bg-gray-400'} relative`}>
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.systemAlerts ? 'left-6' : 'left-1'}`} />
                        </div>
                    }
                    onClick={() => toggleSetting('systemAlerts')}
                />
                <ListItem
                    title="Marketing"
                    subtitle="Promotional messages and news"
                    icon={<Bell size={20} className="text-yellow-500" />}
                    rightElement={
                        <div className={`w-11 h-6 rounded-full transition-colors ${settings.marketing ? 'bg-green-500' : 'bg-gray-400'} relative`}>
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.marketing ? 'left-6' : 'left-1'}`} />
                        </div>
                    }
                    onClick={() => toggleSetting('marketing')}
                    isLast
                />
            </Section>
        </div>
    );
};

export default AdminNotifications;
