import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../../context/TelegramContext';
import { Section } from '../../components/ui/Section';
import { ListItem } from '../../components/ui/ListItem';
import { Settings, Power, MessageSquare, Globe } from 'lucide-react';

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

    return (
        <div className="min-h-screen bg-tg-secondary pt-4 pb-20">
            <h1 className="text-2xl font-bold mb-6 px-4 text-tg-text">Bot Settings</h1>

            <Section title="General">
                <ListItem
                    title="Maintenance Mode"
                    subtitle="Disable bot for all users except admins"
                    icon={<Power size={20} className="text-red-500" />}
                    rightElement={
                        <div className={`w-11 h-6 rounded-full transition-colors ${maintenanceMode ? 'bg-red-500' : 'bg-gray-400'} relative`}>
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${maintenanceMode ? 'left-6' : 'left-1'}`} />
                        </div>
                    }
                    onClick={() => setMaintenanceMode(!maintenanceMode)}
                />
                <ListItem
                    title="Default Language"
                    subtitle={language}
                    icon={<Globe size={20} className="text-blue-500" />}
                    showChevron
                    onClick={() => { /* Open language picker */ }}
                />
            </Section>

            <Section title="Content">
                <ListItem
                    title="Welcome Message"
                    subtitle="Edit the /start message"
                    icon={<MessageSquare size={20} className="text-green-500" />}
                    showChevron
                    onClick={() => { /* Open editor */ }}
                />
                <ListItem
                    title="Help Text"
                    subtitle="Edit the /help message"
                    icon={<Settings size={20} className="text-gray-500" />}
                    showChevron
                    isLast
                    onClick={() => { /* Open editor */ }}
                />
            </Section>
        </div>
    );
};

export default AdminBotSettings;
