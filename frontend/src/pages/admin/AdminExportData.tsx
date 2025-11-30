import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../../context/TelegramContext';
import { AdminSection } from './components/AdminSection';
import { AdminListItem } from './components/AdminListItem';
import { Download } from 'lucide-react';

const AdminExportData: React.FC = () => {
    const navigate = useNavigate();
    const { webApp } = useTelegram();

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

    const handleExport = (type: string) => {
        webApp?.showAlert(`Exporting ${type} data... This feature is coming soon.`);
    };

    return (
        <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#000000] pt-4 pb-20">
            <h1 className="text-3xl font-bold mb-6 px-4 text-black dark:text-white">Export Data</h1>

            <AdminSection title="Reports">
                <AdminListItem
                    title="Students List"
                    // subtitle removed
                    icon="👥"
                    iconColor="bg-blue-500"
                    rightElement={<Download size={20} className="text-[#8E8E93]" />}
                    onClick={() => handleExport('Students')}
                />
                <AdminListItem
                    title="Financial Report"
                    // subtitle removed
                    icon="💰"
                    iconColor="bg-green-500"
                    rightElement={<Download size={20} className="text-[#8E8E93]" />}
                    onClick={() => handleExport('Financial')}
                />
                <AdminListItem
                    title="Attendance Records"
                    // subtitle removed
                    icon="📝"
                    iconColor="bg-purple-500"
                    rightElement={<Download size={20} className="text-[#8E8E93]" />}
                    isLast
                    onClick={() => handleExport('Attendance')}
                />
            </AdminSection>
        </div>
    );
};

export default AdminExportData;
